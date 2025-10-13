// lib/analyzer.ts
import { prisma } from './db';
import { analyzeGame } from './deepseek';
import { fetchNFLGames, fetchNBAGames, fetchSoccerGames, getTodayDate, getYesterdayDate } from './sports-api';

export async function analyzeAllGames() {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  console.log(`Analyzing games for ${yesterday} and ${today}`);

  // Fetch games from multiple sports and dates
  const nflGamesToday = await fetchNFLGames(today);
  const nflGamesYesterday = await fetchNFLGames(yesterday);
  const nbaGamesToday = await fetchNBAGames(today);
  const nbaGamesYesterday = await fetchNBAGames(yesterday);
  // Add soccer games for major leagues
  const premierLeagueGames = await fetchSoccerGames('premier-league', yesterday);

  const allGames = [
    ...nflGamesToday,
    ...nflGamesYesterday,
    ...nbaGamesToday,
    ...nbaGamesYesterday,
    ...premierLeagueGames
  ];

  console.log(`Found ${allGames.length} games to analyze`);

  let analyzedCount = 0;

  for (const game of allGames) {
    // Only analyze finished games
    if (game.status !== 'post') {
      console.log(`Skipping ${game.homeTeam} vs ${game.awayTeam} - status: ${game.status}`);
      continue;
    }

    // Check if already analyzed
    const existing = await prisma.game.findFirst({
      where: {
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        gameDate: game.gameDate
      }
    });

    if (existing?.analysis) {
      console.log(`Skipping ${game.homeTeam} vs ${game.awayTeam} - already analyzed`);
      continue; // Already analyzed
    }

    try {
      console.log(`Analyzing ${game.sport}: ${game.homeTeam} vs ${game.awayTeam}`);

      // Get AI analysis
      const analysis = await analyzeGame({
        sport: game.sport,
        homeTeam: game.homeTeam,
        awayTeam: game.awayTeam,
        homeScore: game.homeScore,
        awayScore: game.awayScore,
        quarter: game.quarter,
        stats: {} // Could be expanded with more detailed stats
      });

      // Determine winner
      const winner = game.homeScore > game.awayScore ? game.homeTeam : game.awayTeam;

      // Save to database
      await prisma.game.upsert({
        where: { id: existing?.id || 'new' },
        create: {
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
          winner: winner
        },
        update: {
          qualityScore: analysis.qualityScore,
          isClose: analysis.isClose,
          excitement: analysis.excitement,
          analysis: analysis.analysis,
          leadChanges: analysis.leadChanges,
          finalScore: `${game.homeScore}-${game.awayScore}`,
          winner: winner
        }
      });

      analyzedCount++;
      console.log(`✅ Analyzed ${game.homeTeam} vs ${game.awayTeam} - Score: ${analysis.qualityScore}/10`);

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
  return await prisma.game.findMany({
    orderBy: { gameDate: 'desc' },
    take: limit,
    where: {
      analysis: { not: null } // Only show analyzed games
    }
  });
}

// Function to get a specific game by ID
export async function getGameById(id: string) {
  return await prisma.game.findUnique({
    where: { id }
  });
}
