// app/api/health/route.ts
import { prisma } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Test a simple query
    const gameCount = await prisma.game.count();
    console.log(`Total games in database: ${gameCount}`);
    
    const analyzedCount = await prisma.game.count({
      where: { analysis: { not: null } }
    });
    console.log(`Analyzed games: ${analyzedCount}`);
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      totalGames: gameCount,
      analyzedGames: analyzedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
