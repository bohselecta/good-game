import Link from 'next/link';
import { SpoilerReveal } from './SpoilerReveal';

interface Game {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  gameDate: Date;
  status: string;
  qualityScore?: number;
  isClose?: boolean;
  excitement?: string;
  analysis?: string;
  finalScore?: string;
  winner?: string;
  leadChanges?: number;
}

interface GameCardProps {
  game: Game;
  showFullDetails?: boolean;
}

export function GameCard({ game, showFullDetails = false }: GameCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const gameDate = new Date(date);
    const diffTime = now.getTime() - gameDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return gameDate.toLocaleDateString();
  };

  const getSportEmoji = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'nfl': return '🏈';
      case 'nba': return '🏀';
      case 'soccer': return '⚽';
      case 'f1': return '🏎️';
      default: return '🎮';
    }
  };

  if (showFullDetails) {
    return <SpoilerReveal game={game} />;
  }

  return (
    <Link href={`/game/${game.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getSportEmoji(game.sport)}</span>
              <span className="text-sm font-medium text-gray-600">{game.league}</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg leading-tight">
              {game.homeTeam} vs {game.awayTeam}
            </h3>
          </div>
          {game.qualityScore && (
            <div className="text-right ml-4">
              <div className="text-2xl font-bold text-green-600">{game.qualityScore}/10</div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">{game.excitement}</div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDate(game.gameDate)}</span>
          {game.qualityScore ? (
            <span className="text-green-600 font-medium">Analyzed ✓</span>
          ) : (
            <span className="text-orange-500">Pending analysis</span>
          )}
        </div>

        {game.analysis && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-700 line-clamp-2">{game.analysis}</p>
          </div>
        )}
      </div>
    </Link>
  );
}
