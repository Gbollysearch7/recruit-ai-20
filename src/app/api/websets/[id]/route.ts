import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific search
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getExaClient();
    const result = await client.getWebset(id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get search' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a search
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getExaClient();
    await client.deleteWebset(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete search' },
      { status: 500 }
    );
  }
}
