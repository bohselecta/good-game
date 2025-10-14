// lib/analyzer.ts
import { supabase } from './supabase';
import { analyzeGame } from './deepseek';
import { fetchNFLGames, fetchNBAGames, fetchSoccerGames, getTodayDate, getYesterdayDate, getDaysAgoDate } from './sports-api';

export async function analyzeAllGames() {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const twoDaysAgo = getDaysAgoDate(2);

  console.log(`Analyzing games for the past 3 days: ${twoDaysAgo} to ${today}`);

    // Fetch games from multiple sports and dates (past 3 days to prevent timeout)
    const nflGames = await Promise.all([
      fetchNFLGames(twoDaysAgo),
      fetchNFLGames(yesterday),
      fetchNFLGames(today)
    ]);

    const nbaGames = await Promise.all([
      fetchNBAGames(twoDaysAgo),
      fetchNBAGames(yesterday),
      fetchNBAGames(today)
    ]);

    // Add soccer games for major leagues (past 2 days)
    const premierLeagueGames = await Promise.all([
      fetchSoccerGames('premier-league', yesterday),
      fetchSoccerGames('premier-league', today)
    ]);

  const allGames = [
    ...nflGames.flat(),
    ...nbaGames.flat(),
    ...premierLeagueGames.flat()
  ];

  console.log(`Found ${allGames.length} games to analyze`);

  // Debug: log sample of games found
  console.log('Sample games found:');
  allGames.slice(0, 5).forEach((game, i) => {
    console.log(`${i + 1}. ${game.sport}: ${game.homeTeam} vs ${game.awayTeam} - Status: ${game.status} - Date: ${game.gameDate}`);
  });

  let analyzedCount = 0;

  for (const game of allGames) {
    // Only analyze finished games
    if (game.status !== 'post') {
      console.log(`Skipping ${game.homeTeam} vs ${game.awayTeam} - status: ${game.status}`);
      continue;
    }

      // Check if already analyzed
      const { data: existingGames } = await supabase
        .from('Game')
        .select('id, analysis')
        .eq('homeTeam', game.homeTeam)
        .eq('awayTeam', game.awayTeam)
        .eq('gameDate', game.gameDate)
        .limit(1);

      const existing = existingGames?.[0] as { id: string; analysis: string | null } | undefined;

      if (existing?.analysis) {
        console.log(`Skipping ${game.homeTeam} vs ${game.awayTeam} - already analyzed`);
        continue; // Already analyzed
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
        stats: {}, // Could be expanded with more detailed stats
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
            gameDate: game.gameDate,
            status: 'final',
            qualityScore: analysis.qualityScore,
            isClose: analysis.isClose,
            excitement: analysis.excitement,
            analysis: analysis.analysis,
            leadChanges: analysis.leadChanges,
            finalScore: `${game.homeScore}-${game.awayScore}`,
            winner: winner,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

        if (existing?.id) {
          // Update existing game
          // @ts-ignore
          const { error: updateError } = await supabase
            .from('Game')
            .update(gameData)
            .eq('id', existing.id);

          if (updateError) {
            throw new Error(`Failed to update game: ${updateError.message}`);
          }
        } else {
          // Create new game
          // @ts-ignore
          const { error: insertError } = await supabase
            .from('Game')
            .insert(gameData);

          if (insertError) {
            throw new Error(`Failed to insert game: ${insertError.message}`);
          }
        }

      analyzedCount++;
      console.log(`✅ Analyzed ${game.homeTeam} vs ${game.awayTeam} - Score: ${analysis.qualityScore}/10 (${analysis.recommendation})`);

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Error analyzing ${game.homeTeam} vs ${game.awayTeam}:`, error);
    }
  }

  console.log(`Analysis complete! Analyzed ${analyzedCount} new games.`);
  return { analyzedCount, totalGames: allGames.length };
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
