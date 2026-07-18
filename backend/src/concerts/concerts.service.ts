import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Concert } from './concert.entity';
import { CreateConcertDto } from '../common/dto';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationStatus } from '../common/enums/reservation-status.enum';

export interface ConcertWithAvailability {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservedSeats: number;
  availableSeats: number;
  isFullyBooked: boolean;
  createdAt: Date;
}

@Injectable()
export class ConcertsService {
  constructor(
    @InjectRepository(Concert)
    private readonly concertsRepository: Repository<Concert>,
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  async create(dto: CreateConcertDto): Promise<ConcertWithAvailability> {
    const concert = this.concertsRepository.create({
      name: dto.name.trim(),
      description: dto.description.trim(),
      totalSeats: dto.totalSeats,
    });

    const saved = await this.concertsRepository.save(concert);
    return this.toConcertWithAvailability(saved, 0);
  }

  async findAll(): Promise<ConcertWithAvailability[]> {
    const concerts = await this.concertsRepository.find({
      order: { createdAt: 'DESC' },
    });

    const counts = await this.getActiveReservationCounts(
      concerts.map((c) => c.id),
    );

    return concerts.map((concert) =>
      this.toConcertWithAvailability(concert, counts[concert.id] ?? 0),
    );
  }

  async findOne(id: string): Promise<ConcertWithAvailability> {
    const concert = await this.concertsRepository.findOne({ where: { id } });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    const count = await this.countActiveReservations(id);
    return this.toConcertWithAvailability(concert, count);
  }

  async remove(id: string): Promise<void> {
    const concert = await this.concertsRepository.findOne({ where: { id } });

    if (!concert) {
      throw new NotFoundException('Concert not found');
    }

    await this.concertsRepository.remove(concert);
  }

  async countActiveReservations(concertId: string): Promise<number> {
    return this.reservationsRepository.count({
      where: { concertId, status: ReservationStatus.ACTIVE },
    });
  }

  private async getActiveReservationCounts(
    concertIds: string[],
  ): Promise<Record<string, number>> {
    if (concertIds.length === 0) {
      return {};
    }

    const rows = await this.reservationsRepository
      .createQueryBuilder('reservation')
      .select('reservation.concertId', 'concertId')
      .addSelect('COUNT(*)', 'count')
      .where('reservation.concertId IN (:...concertIds)', { concertIds })
      .andWhere('reservation.status = :status', {
        status: ReservationStatus.ACTIVE,
      })
      .groupBy('reservation.concertId')
      .getRawMany<{ concertId: string; count: string }>();

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.concertId] = parseInt(row.count, 10);
      return acc;
    }, {});
  }

  private toConcertWithAvailability(
    concert: Concert,
    reservedSeats: number,
  ): ConcertWithAvailability {
    const availableSeats = Math.max(concert.totalSeats - reservedSeats, 0);

    return {
      id: concert.id,
      name: concert.name,
      description: concert.description,
      totalSeats: concert.totalSeats,
      reservedSeats,
      availableSeats,
      isFullyBooked: availableSeats === 0,
      createdAt: concert.createdAt,
    };
  }
}
