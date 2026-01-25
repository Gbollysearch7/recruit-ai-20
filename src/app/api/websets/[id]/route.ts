import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';
import { websetIdSchema, validateRequest, formatZodErrors } from '@/lib/api/validation';
import {
  generateRequestId,
  createErrorResponse,
  validationError,
} from '@/lib/api/errors';
import { logger, createRequestTimer } from '@/lib/api/logger';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific search
export async function GET(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const timer = createRequestTimer();
  const { id } = await params;

  logger.logRequest({
    requestId,
    method: 'GET',
    path: `/api/websets/${id}`,
  });

  try {
    // Validate ID parameter
    const validation = validateRequest(websetIdSchema, { id });
    if (!validation.success) {
      const formattedErrors = formatZodErrors(validation.errors);
      logger.logResponse({
        requestId,
        method: 'GET',
        path: `/api/websets/${id}`,
        status: 400,
        duration: timer.getDuration(),
        error: 'Invalid webset ID',
      });
      return createErrorResponse(
        validationError('Invalid webset ID', formattedErrors),
        requestId
      );
    }

    const client = getExaClient();
    const result = await client.getWebset(id, requestId);

    logger.logResponse({
      requestId,
      method: 'GET',
      path: `/api/websets/${id}`,
      status: 200,
      duration: timer.getDuration(),
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.logResponse({
      requestId,
      method: 'GET',
      path: `/api/websets/${id}`,
      status: 500,
      duration: timer.getDuration(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return createErrorResponse(error, requestId);
  }
}

// DELETE - Delete a search
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const requestId = generateRequestId();
  const timer = createRequestTimer();
  const { id } = await params;

  logger.logRequest({
    requestId,
    method: 'DELETE',
    path: `/api/websets/${id}`,
  });

  try {
    // Validate ID parameter
    const validation = validateRequest(websetIdSchema, { id });
    if (!validation.success) {
      const formattedErrors = formatZodErrors(validation.errors);
      logger.logResponse({
        requestId,
        method: 'DELETE',
        path: `/api/websets/${id}`,
        status: 400,
        duration: timer.getDuration(),
        error: 'Invalid webset ID',
      });
      return createErrorResponse(
        validationError('Invalid webset ID', formattedErrors),
        requestId
      );
    }

    const client = getExaClient();
    await client.deleteWebset(id, requestId);

    logger.logResponse({
      requestId,
      method: 'DELETE',
      path: `/api/websets/${id}`,
      status: 200,
      duration: timer.getDuration(),
    });

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    logger.logResponse({
      requestId,
      method: 'DELETE',
      path: `/api/websets/${id}`,
      status: 500,
      duration: timer.getDuration(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return createErrorResponse(error, requestId);
  }
}
