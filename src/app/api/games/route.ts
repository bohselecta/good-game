// app/api/games/route.ts
import { getRecentGames } from '../../../lib/analyzer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const games = await getRecentGames(limit);

    return NextResponse.json({
      games,
      count: games.length
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch games', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
