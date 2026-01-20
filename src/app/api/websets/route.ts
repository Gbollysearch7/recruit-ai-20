import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';
import { CreateEnrichmentParameters } from '@/types/exa';

// POST - Create a new search
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
    const result = await client.createWebset({
      query,
      count: count || 20,
      criteria,
      enrichments,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create search' },
      { status: 500 }
    );
  }
}

// GET - List all searches
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const cursor = searchParams.get('cursor');

    const client = getExaClient();
    const results = await client.listWebsets(
      limit ? parseInt(limit) : undefined,
      cursor || undefined
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error listing searches:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list searches' },
      { status: 500 }
    );
  }
}
