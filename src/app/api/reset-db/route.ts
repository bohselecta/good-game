// app/api/reset-db/route.ts
import { supabase } from '../../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Simple auth for manual trigger
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Database reset triggered');
    
    // Delete all existing games
    const { error: deleteError } = await supabase
      .from('Game')
      .delete()
      .neq('id', '') // Delete all records

    if (deleteError) {
      console.error('Error deleting games:', deleteError);
      throw new Error(`Failed to delete games: ${deleteError.message}`);
    }

    console.log('All games deleted from database');

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully. All games have been deleted.'
    });
  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json(
      { error: 'Database reset failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
