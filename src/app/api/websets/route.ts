import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';
import { CreateEnrichmentParameters } from '@/types/exa';

// POST - Create a new Webset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, count, criteria, enrichments } = body as {
      query: string;
      count?: number;
      criteria?: string[];
      enrichments?: CreateEnrichmentParameters[];
    };

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const client = getExaClient();
    const webset = await client.createWebset({
      query,
      count: count || 20,
      criteria,
      enrichments,
    });

    return NextResponse.json(webset);
  } catch (error) {
    console.error('Error creating webset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create webset' },
      { status: 500 }
    );
  }
}

// GET - List all Websets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const cursor = searchParams.get('cursor');

    const client = getExaClient();
    const websets = await client.listWebsets(
      limit ? parseInt(limit) : undefined,
      cursor || undefined
    );

    return NextResponse.json(websets);
  } catch (error) {
    console.error('Error listing websets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list websets' },
      { status: 500 }
    );
  }
}
