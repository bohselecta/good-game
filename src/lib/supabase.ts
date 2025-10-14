// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hrpdelmrwdgqtngbzxcn.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('Missing Supabase key. Please set SUPABASE_ANON_KEY or SUPABASE_KEY environment variable.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to get games using Supabase client
export async function getGamesFromSupabase(limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('Game')
      .select('*')
      .not('analysis', 'is', null)
      .order('gameDate', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error(`Supabase query failed: ${error.message}`)
    }

    console.log(`Found ${data?.length || 0} games from Supabase`)
    return data || []
  } catch (error) {
    console.error('Error fetching games from Supabase:', error)
    throw error
  }
}
