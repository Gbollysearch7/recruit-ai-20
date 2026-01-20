import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get items from a Webset
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const cursor = searchParams.get('cursor');

    const client = getExaClient();
    const items = await client.getWebsetItems(id, {
      limit: limit ? parseInt(limit) : 100,
      cursor: cursor || undefined,
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error getting webset items:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get webset items' },
      { status: 500 }
    );
  }
}
