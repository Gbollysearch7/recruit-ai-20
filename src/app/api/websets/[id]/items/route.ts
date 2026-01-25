import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';
import {
  websetIdSchema,
  getItemsSchema,
  validateRequest,
  formatZodErrors,
} from '@/lib/api/validation';
import {
  generateRequestId,
  createErrorResponse,
  validationError,
} from '@/lib/api/errors';
import { logger, createRequestTimer } from '@/lib/api/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get items from a search
export async function GET(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const timer = createRequestTimer();
  const { id } = await params;

  logger.logRequest({
    requestId,
    method: 'GET',
    path: `/api/websets/${id}/items`,
  });

  try {
    // Validate ID parameter
    const idValidation = validateRequest(websetIdSchema, { id });
    if (!idValidation.success) {
      const formattedErrors = formatZodErrors(idValidation.errors);
      logger.logResponse({
        requestId,
        method: 'GET',
        path: `/api/websets/${id}/items`,
        status: 400,
        duration: timer.getDuration(),
        error: 'Invalid webset ID',
      });
      return createErrorResponse(
        validationError('Invalid webset ID', formattedErrors),
        requestId
      );
    }

    // Validate query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      limit: searchParams.get('limit') || undefined,
      cursor: searchParams.get('cursor') || undefined,
    };

    const queryValidation = validateRequest(getItemsSchema, queryParams);
    if (!queryValidation.success) {
      const formattedErrors = formatZodErrors(queryValidation.errors);
      logger.logResponse({
        requestId,
        method: 'GET',
        path: `/api/websets/${id}/items`,
        status: 400,
        duration: timer.getDuration(),
        error: 'Invalid query parameters',
      });
      return createErrorResponse(
        validationError('Invalid query parameters', formattedErrors),
        requestId
      );
    }

    const { limit, cursor } = queryValidation.data;

    const client = getExaClient();
    const items = await client.getWebsetItems(
      id,
      { limit, cursor },
      requestId
    );

    logger.logResponse({
      requestId,
      method: 'GET',
      path: `/api/websets/${id}/items`,
      status: 200,
      duration: timer.getDuration(),
      metadata: { itemCount: items.data?.length || 0 },
    });

    return NextResponse.json(items);
  } catch (error) {
    logger.logResponse({
      requestId,
      method: 'GET',
      path: `/api/websets/${id}/items`,
      status: 500,
      duration: timer.getDuration(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return createErrorResponse(error, requestId);
  }
}
