import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { Concert } from '../concerts/concert.entity';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { AuthenticatedUser } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    private readonly dataSource: DataSource,
  ) {}

  async reserve(user: AuthenticatedUser, concertId: string) {
    return this.dataSource.transaction(async (manager) => {
      const concert = await manager
        .getRepository(Concert)
        .createQueryBuilder('concert')
        .setLock('pessimistic_write')
        .where('concert.id = :concertId', { concertId })
        .getOne();

      if (!concert) {
        throw new NotFoundException('Concert not found');
      }

      const reservationRepo = manager.getRepository(Reservation);

      const existing = await reservationRepo.findOne({
        where: {
          userId: user.id,
          concertId,
          status: ReservationStatus.ACTIVE,
        },
      });

      if (existing) {
        throw new ConflictException(
          'You already have an active reservation for this concert',
        );
      }

      const activeCount = await reservationRepo.count({
        where: { concertId, status: ReservationStatus.ACTIVE },
      });

      if (activeCount >= concert.totalSeats) {
        throw new BadRequestException('This concert is fully booked');
      }

      const reservation = reservationRepo.create({
        userId: user.id,
        concertId,
        status: ReservationStatus.ACTIVE,
      });

      const saved = await reservationRepo.save(reservation);

      return reservationRepo.findOne({
        where: { id: saved.id },
        relations: ['concert'],
      });
    });
  }

  async cancel(user: AuthenticatedUser, reservationId: string) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id: reservationId, userId: user.id },
      relations: ['concert'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Reservation is already cancelled');
    }

    reservation.status = ReservationStatus.CANCELLED;
    return this.reservationsRepository.save(reservation);
  }

  async findMyHistory(user: AuthenticatedUser) {
    return this.reservationsRepository.find({
      where: { userId: user.id },
      relations: ['concert'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllForAudit() {
    return this.reservationsRepository.find({
      relations: ['user', 'concert'],
      order: { createdAt: 'DESC' },
    });
  }
}
