import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsEnum(UserRole, { message: 'Role must be ADMIN or USER' })
  role!: UserRole;
}

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty({ message: 'Concert name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Concert description is required' })
  description!: string;

  @IsInt({ message: 'Total seats must be an integer' })
  @Min(1, { message: 'Total seats must be at least 1' })
  totalSeats!: number;
}

export class ReserveConcertDto {
  @IsString()
  @IsNotEmpty({ message: 'Concert ID is required' })
  concertId!: string;
}
