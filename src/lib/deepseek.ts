// lib/deepseek.ts
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
  const metrics = calculateGameMetrics(gameData);

  const prompt = `You are a sports analyst rating game watchability. Analyze this ${gameData.sport} game objectively.

GAME DATA:
- ${gameData.homeTeam}: ${gameData.homeScore}
- ${gameData.awayTeam}: ${gameData.awayScore}
- Final Margin: ${metrics.scoreMargin} points
- Status: ${gameData.status || gameData.quarter}

SCORING CRITERIA:
Rate 1-10 based on:
- Score closeness (most important): Is the margin within 1-2 possessions?
- Competitiveness: Was it close throughout or just at the end?
- Lead changes: Multiple momentum swings indicate excitement
- Context: High-scoring thriller vs defensive battle

RATING SCALE:
10: Instant classic, must-watch (buzzer beaters, OT thrillers, huge comebacks)
9: Elite entertainment, highly recommended
8: Very good game, worth watching
7: Good game, competitive throughout
6: Decent game, some exciting moments
5: Average game, watchable but not special
4: Below average, one-sided stretches
3: Poor game, mostly a blowout
2: Very one-sided
1: Complete blowout, skip it

RESPOND IN JSON (no markdown, just pure JSON):
{
  "qualityScore": <1-10 integer>,
  "isClose": <boolean - was margin within 1-2 possessions?>,
  "excitement": "<thriller|competitive|blowout>",
  "reasoning": "<2-3 sentence analysis WITHOUT revealing winner or final score>",
  "leadChanges": <estimated number, or null if unknown>,
  "recommendation": "<Must Watch|Worth Watching|Maybe Skip|Skip>"
}

CRITICAL: Do NOT reveal the winner or use team names when describing the outcome. Say "the winning team" not the actual team name.`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const analysis: GameAnalysis = JSON.parse(data.choices[0].message.content);

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
      analysis: `Final margin of ${metrics.scoreMargin} points. ${excitement === 'blowout' ? 'One-sided contest.' : 'Competitive matchup with good back-and-forth action.'}`,
      leadChanges: null,
      recommendation
    };
  }
}
