// app/api/env-test/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    return NextResponse.json({
      hasDatabaseUrl: !!databaseUrl,
      databaseUrlPrefix: databaseUrl ? databaseUrl.substring(0, 20) + '...' : 'NOT_SET',
      hasSupabaseKey: !!supabaseKey,
      supabaseKeyPrefix: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
