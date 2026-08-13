jest.mock('../src/config/api', () => ({
  API_BASE_URL: 'http://localhost:4000',
}));
jest.mock('../src/config/supabase', () => ({
  DATA_BACKEND: 'local',
  isSupabaseConfigured: () => false,
}));
jest.mock('../src/services/supabaseApi', () => ({
  supabaseApi: {},
}));

import { ApiError } from '../src/services/api';

describe('ApiError', () => {
  it('stores message, status, and details correctly', () => {
    const message = 'Resource not found';
    const status = 404;
    const details = { resourceId: '123' };

    const error = new ApiError(message, status, details);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe(message);
    expect(error.status).toBe(status);
    expect(error.details).toEqual(details);
  });

  it('inherits native Error properties', () => {
    const error = new ApiError('Internal Server Error', 500);

    expect(error.stack).toBeDefined();
    expect(error.status).toBe(500);
    expect(error.details).toBeUndefined();
  });
});
