import { ApiError } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiClientError extends Error {
  statusCode: number;
  details: string[];

  constructor(message: string, statusCode: number, details: string[] = []) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function parseErrorMessage(payload: ApiError): string {
  if (Array.isArray(payload.message)) {
    return payload.message.join(', ');
  }
  return payload.message;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    const extra = options.headers as Record<string, string>;
    Object.assign(headers, extra);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const hasJson = contentType?.includes('application/json');
  const payload = hasJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload
      ? parseErrorMessage(payload as ApiError)
      : 'Request failed';
    const details = Array.isArray((payload as ApiError)?.message)
      ? ((payload as ApiError).message as string[])
      : [];

    throw new ApiClientError(message, response.status, details);
  }

  return payload as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, role: 'ADMIN' | 'USER') =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
};

export const concertsApi = {
  list: (token: string) => apiRequest('/concerts', {}, token),
  create: (
    token: string,
    data: { name: string; description: string; totalSeats: number },
  ) =>
    apiRequest('/concerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),
  remove: (token: string, id: string) =>
    apiRequest(`/concerts/${id}`, { method: 'DELETE' }, token),
};

export const reservationsApi = {
  reserve: (token: string, concertId: string) =>
    apiRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify({ concertId }),
    }, token),
  cancel: (token: string, id: string) =>
    apiRequest(`/reservations/${id}`, { method: 'DELETE' }, token),
  myHistory: (token: string) => apiRequest('/reservations/my', {}, token),
  audit: (token: string) => apiRequest('/reservations/audit', {}, token),
};
