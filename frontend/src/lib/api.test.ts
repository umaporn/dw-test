import { apiRequest, ApiClientError } from '@/lib/api';

describe('apiRequest', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns JSON payload on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ id: '1', name: 'Jazz Night' }),
    });

    const result = await apiRequest('/concerts', {}, 'token');

    expect(result).toEqual({ id: '1', name: 'Jazz Night' });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/api/concerts',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      }),
    );
  });

  it('throws ApiClientError with message array details', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({
        statusCode: 400,
        message: ['Concert name is required', 'Total seats must be at least 1'],
      }),
    });

    await expect(apiRequest('/concerts', { method: 'POST' })).rejects.toMatchObject({
      message: 'Concert name is required, Total seats must be at least 1',
      statusCode: 400,
      details: ['Concert name is required', 'Total seats must be at least 1'],
    });
  });

  it('throws ApiClientError with string message', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({
        statusCode: 401,
        message: 'Invalid email or password',
      }),
    });

    await expect(apiRequest('/auth/login', { method: 'POST' })).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });
});
