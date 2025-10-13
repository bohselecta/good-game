// lib/deepseek.ts
export interface GameAnalysis {
  qualityScore: number; // 1-10
  isClose: boolean;
  excitement: 'blowout' | 'competitive' | 'thriller';
  analysis: string; // 2-3 sentence spoiler-free description
  leadChanges: number;
}

export async function analyzeGame(gameData: {
  sport: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  quarter: string;
  stats: Record<string, unknown>;
}): Promise<GameAnalysis> {
  const prompt = `Analyze this ${gameData.sport} game and rate it 1-10 for watchability WITHOUT revealing the winner or final score.

Home: ${gameData.homeTeam} - ${gameData.homeScore}
Away: ${gameData.awayTeam} - ${gameData.awayScore}
Period: ${gameData.quarter}

Consider:
- How close is the score?
- Lead changes and momentum swings
- Overall competitiveness
- Entertainment value

Respond in JSON:
{
  "qualityScore": <1-10>,
  "isClose": <boolean>,
  "excitement": "<blowout|competitive|thriller>",
  "analysis": "<2-3 sentence spoiler-free description>",
  "leadChanges": <number>
}`;

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
  return JSON.parse(data.choices[0].message.content);
}
