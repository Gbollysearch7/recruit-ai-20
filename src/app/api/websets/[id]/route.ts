import { NextRequest, NextResponse } from 'next/server';
import { getExaClient } from '@/lib/exa';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a specific Webset
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getExaClient();
    const webset = await client.getWebset(id);

    return NextResponse.json(webset);
  } catch (error) {
    console.error('Error getting webset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get webset' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Webset
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const client = getExaClient();
    await client.deleteWebset(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webset:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete webset' },
      { status: 500 }
    );
  }
}
