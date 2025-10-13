// app/api/games/[id]/route.ts
import { getGameById } from '../../../../lib/analyzer';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const game = await getGameById(id);

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ game });
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
