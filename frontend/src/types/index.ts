export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Concert {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservedSeats: number;
  availableSeats: number;
  isFullyBooked: boolean;
  createdAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  concertId: string;
  status: 'ACTIVE' | 'CANCELLED';
  createdAt: string;
  concert?: Concert;
  user?: User;
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
}
