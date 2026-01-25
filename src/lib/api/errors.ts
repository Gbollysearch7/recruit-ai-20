import { NextResponse } from 'next/server';

// Error codes for typed API responses
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  EXA_API_ERROR: 'EXA_API_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

// Structured API error response
export interface ApiErrorResponse {
  code: ErrorCodeType;
  message: string;
  details?: unknown;
  requestId: string;
  timestamp: string;
}

// Custom API Error class
export class ApiError extends Error {
  constructor(
    public code: ErrorCodeType,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generate unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Create error response helper
export function createErrorResponse(
  error: ApiError | Error | unknown,
  requestId: string
): NextResponse<ApiErrorResponse> {
  const timestamp = new Date().toISOString();

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
        timestamp,
      },
      { status: error.statusCode }
    );
  }

  // Handle Exa API errors
  if (error instanceof Error && error.message.includes('Exa API Error')) {
    const statusMatch = error.message.match(/(\d{3})/);
    const status = statusMatch ? parseInt(statusMatch[1]) : 502;

    return NextResponse.json(
      {
        code: ErrorCode.EXA_API_ERROR,
        message: error.message,
        requestId,
        timestamp,
      },
      { status: status === 429 ? 429 : 502 }
    );
  }

  // Handle timeout errors
  if (error instanceof Error && error.name === 'AbortError') {
    return NextResponse.json(
      {
        code: ErrorCode.TIMEOUT_ERROR,
        message: 'Request timed out',
        requestId,
        timestamp,
      },
      { status: 504 }
    );
  }

  // Generic error handling
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';

  return NextResponse.json(
    {
      code: ErrorCode.INTERNAL_ERROR,
      message,
      requestId,
      timestamp,
    },
    { status: 500 }
  );
}

// Validation error helper
export function validationError(message: string, details?: unknown): ApiError {
  return new ApiError(ErrorCode.VALIDATION_ERROR, message, 400, details);
}

// Not found error helper
export function notFoundError(resource: string): ApiError {
  return new ApiError(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
}

// Rate limit error helper
export function rateLimitError(retryAfter?: number): ApiError {
  return new ApiError(
    ErrorCode.RATE_LIMITED,
    'Too many requests. Please try again later.',
    429,
    retryAfter ? { retryAfter } : undefined
  );
}
