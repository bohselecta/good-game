#!/usr/bin/env tsx

// Add sample game data for testing
// Usage: npx tsx scripts/add-sample-data.ts

import { config } from 'dotenv';
import { supabase } from '../src/lib/supabase';

// Load environment variables
config({ path: '.env.local' });

const sampleGames = [
  {
    id: 'sample-1',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    gameDate: new Date('2025-01-15T19:30:00Z'),
    status: 'final',
    qualityScore: 9,
    isClose: true,
    excitement: 'thriller',
    analysis: 'This was an incredible back-and-forth battle between two championship-caliber teams. Multiple lead changes in the fourth quarter kept fans on the edge of their seats until the final buzzer.',
    leadChanges: 12,
    finalScore: '118-115',
    winner: 'Los Angeles Lakers',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    gameDate: new Date('2025-01-14T15:00:00Z'),
    status: 'final',
    qualityScore: 8,
    isClose: true,
    excitement: 'competitive',
    analysis: 'A hard-fought playoff matchup with strong defensive play from both sides. The game remained competitive throughout, with neither team able to pull away until late in the fourth quarter.',
    leadChanges: 3,
    finalScore: '27-24',
    winner: 'Kansas City Chiefs',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-3',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Philadelphia 76ers',
    gameDate: new Date('2025-01-14T19:00:00Z'),
    status: 'final',
    qualityScore: 4,
    isClose: false,
    excitement: 'blowout',
    analysis: 'A one-sided affair from the opening tip. The Celtics dominated on both ends of the court, leading by double digits for most of the game.',
    leadChanges: 0,
    finalScore: '125-98',
    winner: 'Boston Celtics',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-4',
    sport: 'Soccer',
    league: 'Premier League',
    homeTeam: 'Manchester City',
    awayTeam: 'Liverpool',
    gameDate: new Date('2025-01-13T16:30:00Z'),
    status: 'final',
    qualityScore: 10,
    isClose: true,
    excitement: 'thriller',
    analysis: 'An absolute classic that had everything - goals, drama, controversy, and a stunning comeback. This match will be remembered as one of the greatest Premier League games ever played.',
    leadChanges: 4,
    finalScore: '3-3',
    winner: 'Draw',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-5',
    sport: 'MLB',
    league: 'MLB',
    homeTeam: 'New York Yankees',
    awayTeam: 'Boston Red Sox',
    gameDate: new Date('2025-01-12T19:00:00Z'),
    status: 'final',
    qualityScore: 6,
    isClose: false,
    excitement: 'competitive',
    analysis: 'A solid baseball game with good pitching duels and some timely hitting. While not a blowout, it lacked the dramatic moments that make for truly memorable games.',
    leadChanges: 2,
    finalScore: '4-2',
    winner: 'New York Yankees',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function addSampleData() {
  console.log('🗃️ Adding sample game data to database...');

  try {
    // Clear existing data first
    console.log('Clearing existing games...');
    const { error: deleteError } = await supabase
      .from('Game')
      .delete()
      .neq('id', ''); // Delete all records

    if (deleteError) {
      throw new Error(`Failed to delete existing games: ${deleteError.message}`);
    }

    // Add sample games
    console.log('Adding sample games...');
    const { error: insertError } = await supabase
      .from('Game')
      .insert(sampleGames);

    if (insertError) {
      throw new Error(`Failed to insert sample games: ${insertError.message}`);
    }

    console.log('✅ Sample data added successfully!');
    console.log(`📊 Added ${sampleGames.length} games to database`);

    // Show what we added
    console.log('\n📋 Sample Games Added:');
    sampleGames.forEach((game, i) => {
      console.log(`${i + 1}. ${game.homeTeam} vs ${game.awayTeam} (${game.league}) - ${game.qualityScore}/10 ${game.excitement}`);
    });

  } catch (error) {
    console.error('❌ Failed to add sample data:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run the script
addSampleData();
