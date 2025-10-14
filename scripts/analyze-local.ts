#!/usr/bin/env tsx

// Interactive local analysis script with sport selection
// Usage: npx tsx scripts/analyze-local.ts

import { config } from 'dotenv';
import { supabase } from '../src/lib/supabase';
import { analyzeGamesBySport } from '../src/lib/analyzer';
import * as readline from 'readline';

// Load environment variables from .env.local
config({ path: '.env.local' });

const AVAILABLE_SPORTS = ['NFL', 'NBA', 'Soccer', 'MLB', 'NHL', 'UFC', 'all'] as const;
type Sport = typeof AVAILABLE_SPORTS[number];

async function getLastAnalysisDate(): Promise<Date | null> {
  try {
    const { data, error } = await supabase
      .from('Game')
      .select('updatedAt')
      .not('analysis', 'is', null)
      .order('updatedAt', { ascending: false })
      .limit(1);

    if (error) {
      console.log('No previous analysis found, will analyze recent games');
      return null;
    }

    if (data && data.length > 0) {
      return new Date(data[0].updatedAt);
    }

    return null;
  } catch (error) {
    console.log('Could not determine last analysis date, will analyze recent games');
    return null;
  }
}

async function promptSportSelection(): Promise<Sport> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n🏈 Available Sports:');
    AVAILABLE_SPORTS.forEach((sport, index) => {
      if (sport === 'all') {
        console.log(`  ${index + 1}. ${sport.toUpperCase()} - Analyze all sports`);
      } else {
        console.log(`  ${index + 1}. ${sport.toUpperCase()}`);
      }
    });

    rl.question('\n🎯 Select sport to analyze (1-7): ', (answer) => {
      rl.close();
      const selection = parseInt(answer) - 1;

      if (isNaN(selection) || selection < 0 || selection >= AVAILABLE_SPORTS.length) {
        console.log('❌ Invalid selection. Please run the script again.');
        process.exit(1);
      }

      const selectedSport = AVAILABLE_SPORTS[selection];
      console.log(`\n🎯 Selected: ${selectedSport.toUpperCase()}\n`);
      resolve(selectedSport);
    });
  });
}

async function runInteractiveAnalysis() {
  console.log('🚀 GoodGame? - Interactive Game Analysis');
  console.log('=======================================');
  console.log('This will analyze recent games and update the Supabase database directly.');
  console.log('');

  // Check required environment variables
  const requiredEnvVars = ['DATABASE_URL', 'DEEPSEEK_API_KEY', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('');
    console.error('Make sure your .env.local file contains all required variables.');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded successfully');

  // Get last analysis date
  const lastAnalysisDate = await getLastAnalysisDate();
  if (lastAnalysisDate) {
    console.log(`📅 Last analysis: ${lastAnalysisDate.toLocaleString()}`);
    console.log('🔍 Will analyze games since then');
  } else {
    console.log('📅 No previous analysis found');
    console.log('🔍 Will analyze recent games');
  }
  console.log('');

  // Prompt for sport selection
  const selectedSport = await promptSportSelection();

  try {
    console.log('🔍 Starting analysis...');
    const result = await analyzeGamesBySport(selectedSport, lastAnalysisDate);

    console.log('');
    console.log('✅ Analysis complete!');
    console.log(`📊 Analyzed ${result.analyzedCount} new games out of ${result.totalGames} total games found`);
    console.log('');

    if (result.analyzedCount > 0) {
      console.log('🎯 Check your website to see the updated game list!');
    } else {
      console.log('✨ No new games to analyze. All recent games are up to date!');
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('');
    console.error('Common issues:');
    console.error('- Check your .env.local file has correct DATABASE_URL and DEEPSEEK_API_KEY');
    console.error('- Make sure Supabase database is active');
    console.error('- Verify DeepSeek API key is valid');
    console.error('- Check your internet connection for ESPN API access');
    process.exit(1);
  }
}

// Run the interactive analysis
runInteractiveAnalysis();
