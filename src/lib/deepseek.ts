// lib/deepseek.ts
import OpenAI from 'openai';

// Initialize OpenAI client with DeepSeek configuration
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export interface GameAnalysis {
  qualityScore: number; // 1-10
  isClose: boolean;
  excitement: 'blowout' | 'competitive' | 'thriller';
  analysis: string; // 2-3 sentence spoiler-free description
  leadChanges: number | null;
  recommendation?: 'Must Watch' | 'Worth Watching' | 'Maybe Skip' | 'Skip';
}

// Calculate objective metrics first
function calculateGameMetrics(gameData: {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: string;
  stats: Record<string, unknown>;
  status?: string;
}) {
  const scoreMargin = Math.abs(gameData.homeScore - gameData.awayScore);
  const totalPoints = gameData.homeScore + gameData.awayScore;
  const winningScore = Math.max(gameData.homeScore, gameData.awayScore);

  // Sport-specific thresholds
  const closeGameThreshold: Record<string, number> = {
    'nfl': 7,      // 1 possession
    'nba': 10,     // 2-3 possessions
    'mlb': 2,      // 1-2 runs
    'nhl': 1,      // 1 goal
    'soccer': 1,   // 1 goal
    'football': 7, // NFL fallback
    'basketball': 10, // NBA fallback
    'baseball': 2, // MLB fallback
    'hockey': 1,   // NHL fallback
  };

  const threshold = closeGameThreshold[gameData.sport.toLowerCase()] || 7; // Default to NFL threshold

  return {
    scoreMargin,
    totalPoints,
    winningScore,
    threshold,
    isVeryClose: scoreMargin <= threshold,
    isClose: scoreMargin <= threshold * 2,
    isOvertime: gameData.quarter?.toLowerCase().includes('ot') ||
                gameData.quarter?.toLowerCase().includes('overtime') ||
                gameData.status?.toLowerCase().includes('ot') ||
                gameData.status?.toLowerCase().includes('overtime')
  };
}

export async function analyzeGame(gameData: {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: string;
  stats: Record<string, unknown>;
  status?: string;
}): Promise<GameAnalysis> {
  // Check if API key is available
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('DEEPSEEK_API_KEY environment variable is not set');
    throw new Error('DeepSeek API key is not configured');
  }

  const metrics = calculateGameMetrics(gameData);

  const prompt = `You are an expert sports analyst specializing in game watchability. Analyze this ${gameData.sport} game and provide detailed insights for someone deciding whether to watch a recorded game.

GAME DATA:
- ${gameData.homeTeam}: ${gameData.homeScore}
- ${gameData.awayTeam}: ${gameData.awayScore}
- Final Margin: ${metrics.scoreMargin} points
- Status: ${gameData.status || gameData.quarter}
- Total Points: ${metrics.totalPoints}

ANALYSIS REQUIREMENTS:
Provide detailed analysis covering:
1. Game flow and competitiveness throughout
2. Key moments and momentum swings
3. Scoring patterns and offensive/defensive performance
4. Overall entertainment value and watchability
5. Specific reasons why someone should or shouldn't watch

SCORING CRITERIA (Rate 1-10):
- Score closeness (most important): Margin within 1-2 possessions?
- Competitiveness: Close throughout or just at the end?
- Momentum swings: Multiple lead changes and exciting moments?
- Context: High-scoring thriller vs defensive battle?
- Entertainment: Memorable plays, comebacks, or dramatic finishes?

RATING SCALE:
10: Instant classic, must-watch (buzzer beaters, OT thrillers, huge comebacks)
9: Elite entertainment, highly recommended (multiple lead changes, dramatic finish)
8: Very good game, worth watching (competitive throughout, exciting moments)
7: Good game, competitive throughout (solid watch with some highlights)
6: Decent game, some exciting moments (watchable but not special)
5: Average game, watchable but not special (mediocre entertainment)
4: Below average, one-sided stretches (mostly boring)
3: Poor game, mostly a blowout (skip unless you're a fan)
2: Very one-sided (not worth your time)
1: Complete blowout, skip it (waste of time)

RESPOND IN JSON (no markdown, just pure JSON):
{
  "qualityScore": <1-10 integer>,
  "isClose": <boolean - was margin within 1-2 possessions?>,
  "excitement": "<thriller|competitive|blowout>",
  "reasoning": "<3-4 sentence detailed analysis WITHOUT revealing winner or final score. Include specific game flow, momentum swings, and entertainment factors>",
  "leadChanges": <estimated number, or null if unknown>,
  "recommendation": "<Must Watch|Worth Watching|Maybe Skip|Skip>"
}

CRITICAL RULES:
- Do NOT reveal the winner or use team names when describing the outcome
- Say "the winning team" or "the home team" not actual team names
- Focus on game flow, competitiveness, and entertainment value
- Provide specific reasons for the rating (momentum swings, scoring patterns, etc.)
- Make it helpful for someone deciding whether to watch a recorded game`;

  try {
    console.log('Calling DeepSeek API with OpenAI SDK...');
    
    const completion = await openai.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0,
      response_format: { type: 'json_object' }
    });

    console.log('DeepSeek API response received');
    
    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      console.error('Invalid DeepSeek response structure:', completion);
      throw new Error('Invalid response structure from DeepSeek API');
    }

    const responseContent = completion.choices[0].message.content;
    console.log('DeepSeek response content:', responseContent?.substring(0, 200) + '...');
    
    if (!responseContent) {
      throw new Error('Empty response from DeepSeek API');
    }

    const analysis: GameAnalysis = JSON.parse(responseContent);

    // Post-AI validation and adjustment logic
    let finalScore = analysis.qualityScore;

    // Boost score if extremely close finish
    if (metrics.isVeryClose) {
      finalScore = Math.min(10, finalScore + 1);
    }

    // Penalize if blowout but AI rated it high
    if (metrics.scoreMargin > metrics.threshold * 4) {
      finalScore = Math.min(finalScore, 5);
    }

    // Overtime gets a boost but not guaranteed minimum
    if (metrics.isOvertime) {
      finalScore = Math.min(10, finalScore + 1);
    }

    // Add recommendation field based on final score
    let recommendation: 'Must Watch' | 'Worth Watching' | 'Maybe Skip' | 'Skip';
    if (finalScore >= 9) recommendation = "Must Watch";
    else if (finalScore >= 7) recommendation = "Worth Watching";
    else if (finalScore >= 5) recommendation = "Maybe Skip";
    else recommendation = "Skip";

    return {
      ...analysis,
      qualityScore: finalScore,
      recommendation
    };

  } catch (error) {
    console.error('DeepSeek API failed, using fallback logic:', error);

    // Fallback logic if AI fails
    let qualityScore: number;
    let excitement: 'blowout' | 'competitive' | 'thriller';
    let recommendation: 'Must Watch' | 'Worth Watching' | 'Maybe Skip' | 'Skip';

    if (metrics.isVeryClose) {
      qualityScore = 9;
      excitement = 'thriller';
      recommendation = 'Must Watch';
    } else if (metrics.isClose) {
      qualityScore = 7;
      excitement = 'competitive';
      recommendation = 'Worth Watching';
    } else if (metrics.scoreMargin <= metrics.threshold * 3) {
      qualityScore = 5;
      excitement = 'competitive';
      recommendation = 'Maybe Skip';
    } else {
      qualityScore = 3;
      excitement = 'blowout';
      recommendation = 'Skip';
    }

    // Overtime bonus in fallback too
    if (metrics.isOvertime) {
      qualityScore = Math.max(8, qualityScore);
      recommendation = qualityScore >= 8 ? 'Must Watch' : 'Worth Watching';
    }

    return {
      qualityScore,
      isClose: metrics.isClose,
      excitement,
      analysis: `This ${gameData.sport} game featured a ${metrics.scoreMargin}-point margin with ${metrics.totalPoints} total points scored. ${excitement === 'blowout' ? 'The game was largely one-sided with limited competitive moments, making it less engaging for casual viewers.' : excitement === 'thriller' ? 'The game was highly competitive throughout with multiple momentum swings and exciting plays that kept viewers engaged until the final moments.' : 'The game remained competitive for most of the duration with some exciting moments, though not consistently thrilling.'} ${metrics.isOvertime ? 'The overtime period added extra drama and excitement to an already competitive matchup.' : ''} Overall, this was a ${excitement} game that ${qualityScore >= 7 ? 'offers good entertainment value' : qualityScore >= 5 ? 'provides decent viewing' : 'may not be worth the time investment'} for most viewers.`,
      leadChanges: null,
      recommendation
    };
  }
}
