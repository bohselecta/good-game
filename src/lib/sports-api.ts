// lib/sports-api.ts
export interface GameData {
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string; // 'pre', 'in', 'post'
  gameDate: Date;
  externalId: string;
  quarter: string;
}

interface EspnCompetitor {
  team: {
    displayName: string;
  };
  homeAway: 'home' | 'away';
  score?: string;
}

interface EspnCompetition {
  competitors: EspnCompetitor[];
}

interface EspnEvent {
  id: string;
  date: string;
  status: {
    type: {
      state: string;
      shortDetail: string;
    };
  };
  competitions: EspnCompetition[];
}

interface EspnApiResponse {
  events: EspnEvent[];
}

export async function fetchNFLGames(date: string): Promise<GameData[]> {
  try {
    // ESPN API is free for basic data
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${date}`
    );

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: EspnApiResponse = await response.json();

    return data.events.map((event: EspnEvent) => ({
      sport: 'nfl',
      league: 'NFL',
      homeTeam: event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'home')!.team.displayName,
      awayTeam: event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'away')!.team.displayName,
      homeScore: parseInt(event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'home')!.score || '0'),
      awayScore: parseInt(event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'away')!.score || '0'),
      status: event.status.type.state, // 'pre', 'in', 'post'
      gameDate: new Date(event.date),
      externalId: event.id,
      quarter: event.status.type.shortDetail
    }));
  } catch (error) {
    console.error('Error fetching NFL games:', error);
    return [];
  }
}

export async function fetchNBAGames(date: string): Promise<GameData[]> {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`
    );

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: EspnApiResponse = await response.json();

    return data.events.map((event: EspnEvent) => ({
      sport: 'nba',
      league: 'NBA',
      homeTeam: event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'home')!.team.displayName,
      awayTeam: event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'away')!.team.displayName,
      homeScore: parseInt(event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'home')!.score || '0'),
      awayScore: parseInt(event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'away')!.score || '0'),
      status: event.status.type.state,
      gameDate: new Date(event.date),
      externalId: event.id,
      quarter: event.status.type.shortDetail
    }));
  } catch (error) {
    console.error('Error fetching NBA games:', error);
    return [];
  }
}

export async function fetchSoccerGames(league: string, date: string): Promise<GameData[]> {
  try {
    // Using ESPN for soccer as well - you might want to switch to API-Football for more leagues
    const leagueMap: { [key: string]: string } = {
      'premier-league': 'eng.1',
      'la-liga': 'esp.1',
      'bundesliga': 'ger.1',
      'serie-a': 'ita.1',
      'champions-league': 'uefa.champions'
    };

    const leagueCode = leagueMap[league] || league;

    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${leagueCode}/scoreboard?dates=${date}`
    );

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: EspnApiResponse = await response.json();

    return data.events.map((event: EspnEvent) => ({
      sport: 'soccer',
      league: league.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      homeTeam: event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'home')!.team.displayName,
      awayTeam: event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'away')!.team.displayName,
      homeScore: parseInt(event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'home')!.score || '0'),
      awayScore: parseInt(event.competitions[0].competitors.find((c: EspnCompetitor) => c.homeAway === 'away')!.score || '0'),
      status: event.status.type.state,
      gameDate: new Date(event.date),
      externalId: event.id,
      quarter: event.status.type.shortDetail
    }));
  } catch (error) {
    console.error('Error fetching soccer games:', error);
    return [];
  }
}

// Utility function to get today's date in YYYYMMDD format
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

// Utility function to get yesterday's date in YYYYMMDD format
export function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0].replace(/-/g, '');
}
