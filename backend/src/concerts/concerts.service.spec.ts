import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ConcertsService } from './concerts.service';
import { Concert } from './concert.entity';
import { Reservation } from '../reservations/reservation.entity';
import { ReservationStatus } from '../common/enums/reservation-status.enum';

describe('ConcertsService', () => {
  let service: ConcertsService;

  const mockConcert: Concert = {
    id: 'concert-1',
    name: 'Rock Night',
    description: 'Live rock performance',
    totalSeats: 100,
    createdAt: new Date('2024-01-01'),
    reservations: [],
  };

  const concertsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const reservationsRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: getRepositoryToken(Concert), useValue: concertsRepository },
        {
          provide: getRepositoryToken(Reservation),
          useValue: reservationsRepository,
        },
      ],
    }).compile();

    service = module.get<ConcertsService>(ConcertsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a concert with availability metadata', async () => {
      concertsRepository.create.mockReturnValue(mockConcert);
      concertsRepository.save.mockResolvedValue(mockConcert);

      const result = await service.create({
        name: 'Rock Night',
        description: 'Live rock performance',
        totalSeats: 100,
      });

      expect(result.name).toBe('Rock Night');
      expect(result.availableSeats).toBe(100);
      expect(result.isFullyBooked).toBe(false);
    });
  });

  describe('findAll', () => {
    it('returns concerts with reserved seat counts', async () => {
      concertsRepository.find.mockResolvedValue([mockConcert]);

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { concertId: 'concert-1', count: '50' },
        ]),
      };

      reservationsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].reservedSeats).toBe(50);
      expect(result[0].availableSeats).toBe(50);
      expect(result[0].isFullyBooked).toBe(false);
    });
  });

  describe('findOne', () => {
    it('throws when concert is not found', async () => {
      concertsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes an existing concert', async () => {
      concertsRepository.findOne.mockResolvedValue(mockConcert);
      concertsRepository.remove.mockResolvedValue(mockConcert);

      await service.remove('concert-1');

      expect(concertsRepository.remove).toHaveBeenCalledWith(mockConcert);
    });
  });

  describe('countActiveReservations', () => {
    it('counts only active reservations', async () => {
      reservationsRepository.count.mockResolvedValue(3);

      const count = await service.countActiveReservations('concert-1');

      expect(count).toBe(3);
      expect(reservationsRepository.count).toHaveBeenCalledWith({
        where: { concertId: 'concert-1', status: ReservationStatus.ACTIVE },
      });
    });
  });
});
