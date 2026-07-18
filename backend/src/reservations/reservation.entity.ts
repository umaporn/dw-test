import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Concert } from '../concerts/concert.entity';
import { ReservationStatus } from '../common/enums/reservation-status.enum';

@Entity('reservations')
@Index(['userId', 'concertId'], {
  unique: true,
  where: `"status" = 'ACTIVE'`,
})
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'concert_id' })
  concertId!: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status!: ReservationStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.reservations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Concert, (concert) => concert.reservations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'concert_id' })
  concert!: Concert;
}
