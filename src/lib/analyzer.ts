// lib/analyzer.ts
import { supabase } from './supabase';
import { analyzeGame } from './deepseek';
import { fetchNFLGames, fetchNBAGames, fetchSoccerGames, getTodayDate, getYesterdayDate, getDaysAgoDate } from './sports-api';

export async function analyzeAllGames(limit: number = 3) {
  console.log(`🔍 Analyzing up to ${limit} games for testing...`);

  // For testing, only fetch from the last 2 days to keep it fast
  const yesterday = getYesterdayDate();
  const today = getTodayDate();

  console.log(`Fetching games from: ${yesterday} to ${today}`);

  try {
    // Fetch games from multiple sports (only yesterday and today for speed)
    const nflGames = await Promise.all([
      fetchNFLGames(yesterday),
      fetchNFLGames(today)
    ]);

    const nbaGames = await Promise.all([
      fetchNBAGames(yesterday),
      fetchNBAGames(today)
    ]);

    const allGames = [
      ...nflGames.flat(),
      ...nbaGames.flat()
    ];

    console.log(`Found ${allGames.length} games to analyze`);

    // Limit to the specified number for testing
    const gamesToAnalyze = allGames.slice(0, limit);
    console.log(`Will analyze ${gamesToAnalyze.length} games (limited for testing)`);

    let analyzedCount = 0;

    for (const game of gamesToAnalyze) {
      // Only analyze finished games
      if (game.status !== 'post') {
        console.log(`Skipping ${game.homeTeam} vs ${game.awayTeam} - status: ${game.status}`);
        continue;
      }

      // Check if already analyzed
      const checkGameId = `${game.sport}-${game.homeTeam}-${game.awayTeam}-${game.gameDate}`.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

      const { data: existingGames } = await supabase
        .from('Game')
        .select('id, analysis')
        .eq('id', checkGameId)
        .limit(1);

      const existing = existingGames?.[0];

      if (existing?.analysis) {
        console.log(`Skipping ${game.homeTeam} vs ${game.awayTeam} - already analyzed`);
        continue;
      }

      try {
        console.log(`Analyzing ${game.sport}: ${game.homeTeam} vs ${game.awayTeam}`);

        // Get AI analysis with enhanced logic
        const analysis = await analyzeGame({
          sport: game.sport,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          homeScore: game.homeScore,
          awayScore: game.awayScore,
          quarter: game.quarter,
          stats: {},
          status: game.status
        });

        // Determine winner
        const winner = game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam;

        // Generate a unique ID for the game
        const gameId = `${game.sport}-${game.homeTeam}-${game.awayTeam}-${game.gameDate}`.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

        // Save to database using Supabase
        const gameData = {
          id: gameId,
          sport: game.sport,
          league: game.league,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          gameDate: new Date(game.gameDate),
          status: 'final',
          qualityScore: analysis.qualityScore,
          isClose: analysis.isClose,
          excitement: analysis.excitement,
          analysis: analysis.analysis,
          leadChanges: analysis.leadChanges,
          finalScore: `${game.homeScore}-${game.awayScore}`,
          winner: winner,
          updatedAt: new Date().toISOString()
        };

        if (existing?.id) {
          // Update existing game
          const { error: updateError } = await supabase
            .from('Game')
            .update({ ...gameData, updatedAt: new Date().toISOString() })
            .eq('id', existing.id);

          if (updateError) {
            throw new Error(`Failed to update game: ${updateError.message}`);
          }
        } else {
          // Create new game
          const { error: insertError } = await supabase
            .from('Game')
            .insert(gameData);

          if (insertError) {
            throw new Error(`Failed to insert game: ${insertError.message}`);
          }
        }

        analyzedCount++;
        console.log(`✅ Analyzed ${game.homeTeam} vs ${game.awayTeam} - Score: ${analysis.qualityScore}/10 (${analysis.recommendation})`);

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error analyzing ${game.homeTeam} vs ${game.awayTeam}:`, error);
      }
    }

    console.log(`Analysis complete! Analyzed ${analyzedCount} new games.`);
    return { analyzedCount, totalGames: gamesToAnalyze.length };

  } catch (error) {
    console.error('❌ Error in analyzeAllGames:', error);
    return { analyzedCount: 0, totalGames: 0, error: error.message };
  }
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
