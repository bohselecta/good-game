#!/usr/bin/env tsx

// Local analysis script to bypass Vercel timeout limits
// Usage: npx tsx scripts/analyze-local.ts

import { config } from 'dotenv';
import { analyzeAllGames } from '../src/lib/analyzer';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function runLocalAnalysis() {
  console.log('🚀 Starting local game analysis...');
  console.log('This will analyze games and update the Supabase database directly.');
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
