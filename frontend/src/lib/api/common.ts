/**
 * Common API utilities and shared functionality
 */

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

/**
 * Common fetch configuration
 */
export const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Generic API error handler
 */
export class APIError extends Error {
  status?: number;
  
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

/**
 * Generic fetch wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...fetchConfig,
      ...options,
      headers: {
        ...fetchConfig.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new APIError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Handle API responses with consistent error handling
 */
export async function handleAPIResponse<T>(
  responsePromise: Promise<Response>
): Promise<T> {
  const response = await responsePromise;
  
  if (!response.ok) {
    throw new APIError(
      `HTTP error! status: ${response.status}`,
      response.status
    );
  }
  
  return await response.json();
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

/**
 * Common timeout configuration
 */
export const API_TIMEOUT = 30000; // 30 seconds

/**
 * Create fetch with timeout
 */
export function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new APIError('Request timeout')), timeout)
    ),
  ]);
}
