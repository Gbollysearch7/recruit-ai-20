import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';
import {
  createSearchSchema,
  listWebsetsSchema,
  validateRequest,
  formatZodErrors,
} from '@/lib/api/validation';
import {
  generateRequestId,
  createErrorResponse,
  validationError,
} from '@/lib/api/errors';
import { logger, createRequestTimer } from '@/lib/api/logger';

// POST - Create a new search
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const timer = createRequestTimer();

  logger.logRequest({
    requestId,
    method: 'POST',
    path: '/api/websets',
  });

  try {
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(createSearchSchema, body);
    if (!validation.success) {
      const formattedErrors = formatZodErrors(validation.errors);
      logger.logResponse({
        requestId,
        method: 'POST',
        path: '/api/websets',
        status: 400,
        duration: timer.getDuration(),
        error: 'Validation failed',
      });
      return createErrorResponse(
        validationError('Validation failed', formattedErrors),
        requestId
      );
    }

    const { query, count, criteria, enrichments } = validation.data;

    const client = getExaClient();
    const result = await client.createWebset(
      {
        query,
        count,
        criteria,
        enrichments,
      },
      requestId
    );

    logger.logResponse({
      requestId,
      method: 'POST',
      path: '/api/websets',
      status: 200,
      duration: timer.getDuration(),
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.logResponse({
      requestId,
      method: 'POST',
      path: '/api/websets',
      status: 500,
      duration: timer.getDuration(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return createErrorResponse(error, requestId);
  }
}

// GET - List all searches
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const timer = createRequestTimer();

  logger.logRequest({
    requestId,
    method: 'GET',
    path: '/api/websets',
  });

  try {
    const { searchParams } = new URL(request.url);
    const params = {
      limit: searchParams.get('limit') || undefined,
      cursor: searchParams.get('cursor') || undefined,
    };

    // Validate query params
    const validation = validateRequest(listWebsetsSchema, params);
    if (!validation.success) {
      const formattedErrors = formatZodErrors(validation.errors);
      logger.logResponse({
        requestId,
        method: 'GET',
        path: '/api/websets',
        status: 400,
        duration: timer.getDuration(),
        error: 'Validation failed',
      });
      return createErrorResponse(
        validationError('Invalid query parameters', formattedErrors),
        requestId
      );
    }

    const { limit, cursor } = validation.data;

    const client = getExaClient();
    const results = await client.listWebsets(limit, cursor, requestId);

    logger.logResponse({
      requestId,
      method: 'GET',
      path: '/api/websets',
      status: 200,
      duration: timer.getDuration(),
    });

    return NextResponse.json(results);
  } catch (error) {
    logger.logResponse({
      requestId,
      method: 'GET',
      path: '/api/websets',
      status: 500,
      duration: timer.getDuration(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return createErrorResponse(error, requestId);
  }
}
