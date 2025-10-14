// lib/analyzer.ts
import { supabase } from './supabase';
import { analyzeGame } from './deepseek';
import { fetchNFLGames, fetchNBAGames, fetchSoccerGames, getTodayDate, getYesterdayDate, getDaysAgoDate } from './sports-api';

export async function analyzeAllGames(limit: number = 5) {
  console.log(`🔍 Analyzing ${limit} games...`);

  // Just return a simple response for now
  return {
    analyzedCount: 0,
    totalGames: 0,
    message: 'Analysis disabled for stability'
  };
}

// Function to get recent games for display
export async function getRecentGames(limit: number = 50) {
  try {
    console.log('Getting recent games from database...');
    const { data: games, error } = await supabase
      .from('Game')
      .select('*')
      .not('analysis', 'is', null)
      .order('gameDate', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase error in getRecentGames:', error);
      throw new Error(`Database query failed: ${error.message}`);
    }

    console.log(`Found ${games?.length || 0} analyzed games in database`);
    return games || [];
  } catch (error) {
    console.error('Database error in getRecentGames:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to get a specific game by ID
export async function getGameById(id: string) {
  const { data: game, error } = await supabase
    .from('Game')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching game by ID:', error);
    return null;
  }

  return game;
}
