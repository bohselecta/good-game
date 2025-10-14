// lib/analyzer.ts
import { supabase } from './supabase';
import { analyzeGame } from './deepseek';
import { fetchNFLGames, fetchNBAGames, fetchSoccerGames, getTodayDate, getYesterdayDate, getDaysAgoDate } from './sports-api';

// Generate date range from last analysis date or recent days
function getDateRangeForAnalysis(lastAnalysisDate: Date | null): string[] {
  const dates: string[] = [];

  if (lastAnalysisDate) {
    // Get dates from last analysis until today
    const today = new Date();
    let currentDate = new Date(lastAnalysisDate);

    // Add one day to last analysis date to avoid re-analyzing
    currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate <= today) {
      dates.push(currentDate.toISOString().split('T')[0].replace(/-/g, ''));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    // No previous analysis, get last 7 days
    for (let i = 6; i >= 0; i--) {
      dates.push(getDaysAgoDate(i));
    }
  }

  return dates;
}

// Get fetch function for a specific sport
function getSportFetchFunction(sport: string) {
  switch (sport.toLowerCase()) {
    case 'nfl':
      return fetchNFLGames;
    case 'nba':
      return fetchNBAGames;
    case 'soccer':
      return (date: string) => fetchSoccerGames('premier-league', date); // Default to Premier League
    default:
      console.log(`⚠️  ${sport} not yet implemented, skipping`);
      return null;
  }
}

export async function analyzeGamesBySport(selectedSport: string, lastAnalysisDate: Date | null, limit: number = 50) {
  console.log(`🔍 Analyzing ${selectedSport === 'all' ? 'all sports' : selectedSport} games...`);

  const dateRange = getDateRangeForAnalysis(lastAnalysisDate);
  console.log(`📅 Analyzing games from ${dateRange.length} days: ${dateRange[0]} to ${dateRange[dateRange.length - 1]}`);

  try {
    const allGames: any[] = [];

    if (selectedSport === 'all') {
      // Analyze all available sports
      const sports = ['NFL', 'NBA', 'Soccer'];

      for (const sport of sports) {
        const fetchFunction = getSportFetchFunction(sport);
        if (!fetchFunction) continue;

        console.log(`🏈 Fetching ${sport} games...`);
        const sportGames = await Promise.all(dateRange.map(date => fetchFunction(date)));
        allGames.push(...sportGames.flat());
      }
    } else {
      // Analyze specific sport
      const fetchFunction = getSportFetchFunction(selectedSport);
      if (!fetchFunction) {
        console.log(`❌ ${selectedSport} not supported yet`);
        return { analyzedCount: 0, totalGames: 0 };
      }

      console.log(`🏈 Fetching ${selectedSport} games...`);
      const sportGames = await Promise.all(dateRange.map(date => fetchFunction(date)));
      allGames.push(...sportGames.flat());
    }

    console.log(`📊 Found ${allGames.length} total games to check`);

    // Filter to only completed games
    const completedGames = allGames.filter(game => game.status === 'post' || game.status === 'STATUS_FINAL');
    console.log(`✅ ${completedGames.length} completed games to analyze`);

    // Limit for performance
    const gamesToAnalyze = completedGames.slice(0, limit);
    if (completedGames.length > limit) {
      console.log(`⚡ Limiting to ${limit} games for performance`);
    }

    let analyzedCount = 0;

    for (const game of gamesToAnalyze) {
      // Generate unique game ID
      const checkGameId = `${game.sport}-${game.homeTeam}-${game.awayTeam}-${game.gameDate}`.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

      // Check if already analyzed
      const { data: existingGames } = await supabase
        .from('Game')
        .select('id, analysis')
        .eq('id', checkGameId)
        .limit(1);

      const existing = existingGames?.[0];

      if (existing?.analysis) {
        console.log(`⏭️  Skipping ${game.homeTeam} vs ${game.awayTeam} - already analyzed`);
        continue;
      }

      try {
        console.log(`🤖 Analyzing ${game.sport}: ${game.homeTeam} vs ${game.awayTeam}`);

        // Get AI analysis
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

        // Prepare game data
        const gameData = {
          id: checkGameId,
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

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Error analyzing ${game.homeTeam} vs ${game.awayTeam}:`, error);
      }
    }

    console.log(`\n🎉 Analysis complete! Analyzed ${analyzedCount} new games.`);
    return { analyzedCount, totalGames: gamesToAnalyze.length };

  } catch (error) {
    console.error('❌ Error in analyzeGamesBySport:', error);
    return { analyzedCount: 0, totalGames: 0, error: error.message };
  }
}

// Legacy function for backward compatibility
export async function analyzeAllGames(limit: number = 3) {
  console.log('⚠️  Using legacy analyzeAllGames function - consider using analyzeGamesBySport instead');
  return analyzeGamesBySport('all', null, limit);
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
