// app/api/games/route.ts
import { getRecentGames } from '../../../lib/analyzer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('Fetching games with limit:', limit);
    const games = await getRecentGames(limit);
    console.log('Found games:', games.length);

    // Convert Date objects back to strings for frontend compatibility
    const gamesWithStringDates = games.map(game => ({
      ...game,
      gameDate: game.gameDate instanceof Date ? game.gameDate.toISOString() : game.gameDate
    }));

    return NextResponse.json({
      games: gamesWithStringDates,
      count: games.length
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch games', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
