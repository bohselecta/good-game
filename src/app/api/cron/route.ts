// app/api/cron/route.ts
import { analyzeAllGames } from '../../../lib/analyzer';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Scheduled analysis triggered');
    const result = await analyzeAllGames();

    return NextResponse.json({
      success: true,
      message: `Analyzed ${result.analyzedCount} new games out of ${result.totalGames} total games found.`
    });
  } catch (error) {
    console.error('Cron analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
