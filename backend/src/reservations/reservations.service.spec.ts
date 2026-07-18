import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation } from './reservation.entity';
import { Concert } from '../concerts/concert.entity';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { UserRole } from '../common/enums/user-role.enum';

describe('ReservationsService', () => {
  let service: ReservationsService;

  const user = {
    id: 'user-1',
    email: 'user@example.com',
    role: UserRole.USER,
  };

  const concert: Concert = {
    id: 'concert-1',
    name: 'Jazz Fest',
    description: 'Smooth jazz evening',
    totalSeats: 2,
    createdAt: new Date(),
    reservations: [],
  };

  const reservationsRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  let transactionManager: {
    getRepository: jest.Mock;
  };

  const dataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    transactionManager = {
      getRepository: jest.fn(),
    };

    dataSource.transaction.mockImplementation(async (callback) =>
      callback(transactionManager),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationsRepository,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    jest.clearAllMocks();
  });

  const mockTransaction = ({
    concertFound = true,
    existingReservation = null as Reservation | null,
    activeCount = 0,
  }) => {
    const concertRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(concertFound ? concert : null),
      }),
    };

    const reservationRepo = {
      findOne: jest.fn().mockResolvedValue(existingReservation),
      count: jest.fn().mockResolvedValue(activeCount),
      create: jest.fn().mockImplementation((data) => ({
        id: 'reservation-1',
        ...data,
      })),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    };

    transactionManager.getRepository.mockImplementation((entity) => {
      if (entity === Concert) return concertRepo;
      if (entity === Reservation) return reservationRepo;
      return {};
    });

    return reservationRepo;
  };

  describe('reserve', () => {
    it('creates a reservation when seats are available', async () => {
      const reservationRepo = mockTransaction({ activeCount: 1 });

      reservationRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({
        id: 'reservation-1',
        userId: user.id,
        concertId: concert.id,
        status: ReservationStatus.ACTIVE,
        concert,
      });

      const result = await service.reserve(user, concert.id);

      expect(result?.concert.name).toBe('Jazz Fest');
      expect(reservationRepo.save).toHaveBeenCalled();
    });

    it('throws when concert is not found', async () => {
      mockTransaction({ concertFound: false });

      await expect(service.reserve(user, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws when user already has an active reservation', async () => {
      mockTransaction({
        existingReservation: {
          id: 'existing',
          userId: user.id,
          concertId: concert.id,
          status: ReservationStatus.ACTIVE,
        } as Reservation,
      });

      await expect(service.reserve(user, concert.id)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws when concert is fully booked', async () => {
      mockTransaction({ activeCount: 2 });

      await expect(service.reserve(user, concert.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancel', () => {
    it('cancels an active reservation', async () => {
      const reservation = {
        id: 'reservation-1',
        userId: user.id,
        concertId: concert.id,
        status: ReservationStatus.ACTIVE,
        concert,
      } as Reservation;

      reservationsRepository.findOne.mockResolvedValue(reservation);
      reservationsRepository.save.mockResolvedValue({
        ...reservation,
        status: ReservationStatus.CANCELLED,
      });

      const result = await service.cancel(user, reservation.id);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('throws when reservation does not exist', async () => {
      reservationsRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel(user, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws when reservation is already cancelled', async () => {
      reservationsRepository.findOne.mockResolvedValue({
        id: 'reservation-1',
        userId: user.id,
        status: ReservationStatus.CANCELLED,
      });

      await expect(service.cancel(user, 'reservation-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
