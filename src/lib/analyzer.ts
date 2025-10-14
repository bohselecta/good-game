// lib/analyzer.ts
import { prisma } from './db';
import { analyzeGame } from './deepseek';
import { fetchNFLGames, fetchNBAGames, fetchSoccerGames, getTodayDate, getYesterdayDate, getDaysAgoDate } from './sports-api';

export async function analyzeAllGames() {
  const today = getTodayDate();
  const yesterday = getYesterdayDate();
  const twoDaysAgo = getDaysAgoDate(2);
  const threeDaysAgo = getDaysAgoDate(3);
  const fourDaysAgo = getDaysAgoDate(4);
  const fiveDaysAgo = getDaysAgoDate(5);
  const sixDaysAgo = getDaysAgoDate(6);
  const sevenDaysAgo = getDaysAgoDate(7);

  console.log(`Analyzing games for the past 7 days: ${sevenDaysAgo} to ${today}`);

  // Fetch games from multiple sports and dates (past 7 days)
  const nflGames = await Promise.all([
    fetchNFLGames(sevenDaysAgo),
    fetchNFLGames(sixDaysAgo),
    fetchNFLGames(fiveDaysAgo),
    fetchNFLGames(fourDaysAgo),
    fetchNFLGames(threeDaysAgo),
    fetchNFLGames(twoDaysAgo),
    fetchNFLGames(yesterday),
    fetchNFLGames(today)
  ]);

  const nbaGames = await Promise.all([
    fetchNBAGames(sevenDaysAgo),
    fetchNBAGames(sixDaysAgo),
    fetchNBAGames(fiveDaysAgo),
    fetchNBAGames(fourDaysAgo),
    fetchNBAGames(threeDaysAgo),
    fetchNBAGames(twoDaysAgo),
    fetchNBAGames(yesterday),
    fetchNBAGames(today)
  ]);

  // Add soccer games for major leagues (past 3 days)
  const premierLeagueGames = await Promise.all([
    fetchSoccerGames('premier-league', threeDaysAgo),
    fetchSoccerGames('premier-league', twoDaysAgo),
    fetchSoccerGames('premier-league', yesterday)
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
