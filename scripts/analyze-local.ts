#!/usr/bin/env tsx

// Local analysis script to bypass Vercel timeout limits
// Usage: npx tsx scripts/analyze-local.ts

import { analyzeAllGames } from '../src/lib/analyzer';

async function runLocalAnalysis() {
  console.log('🚀 Starting local game analysis...');
  console.log('This will analyze games and update the Supabase database directly.');
  console.log('');

  try {
    const result = await analyzeAllGames();
    
    console.log('');
    console.log('✅ Analysis complete!');
    console.log(`📊 Analyzed ${result.analyzedCount} new games out of ${result.totalGames} total games found`);
    console.log('');
    console.log('🎯 Check your website to see the updated game list!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error instanceof Error ? error.message : 'Unknown error');
    console.error('');
    console.error('Common issues:');
    console.error('- Check your .env.local file has correct DATABASE_URL and DEEPSEEK_API_KEY');
    console.error('- Make sure Supabase database is active');
    console.error('- Verify DeepSeek API key is valid');
    process.exit(1);
  }
}

// Run the analysis
runLocalAnalysis();
