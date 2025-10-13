// app/api/analyze/route.ts
import { analyzeAllGames } from '../../../lib/analyzer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Simple auth for manual trigger
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Manual analysis triggered');
    const result = await analyzeAllGames();

    return NextResponse.json({
      success: true,
      message: `Analyzed ${result.analyzedCount} new games out of ${result.totalGames} total games found.`
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
