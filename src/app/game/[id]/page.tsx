'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { SpoilerReveal } from '../../../components/SpoilerReveal';

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

export default function GameDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/games/${id}`, {
          cache: 'no-store'
        });

        if (!res.ok) {
          if (res.status === 404) {
            setNotFound(true);
          } else {
            throw new Error('Failed to fetch game');
          }
          return;
        }

        const data = await res.json();
        if (data.game) {
          setGame({
            ...data.game,
            gameDate: new Date(data.game.gameDate)
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching game:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchGame();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (notFound || !game) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-4">The game you're looking for doesn't exist.</p>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to all games
          </Link>
        </div>
      </div>
    );
  }

  const getSportEmoji = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'nfl': return '🏈';
      case 'nba': return '🏀';
      case 'soccer': return '⚽';
      case 'f1': return '🏎️';
      default: return '🎮';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to all games
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl">{getSportEmoji(game.sport)}</span>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {game.league}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {game.homeTeam} vs {game.awayTeam}
            </h1>
            <p className="text-lg text-gray-600">
              {new Date(game.gameDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Spoiler Reveal Component */}
        <SpoilerReveal game={game} />

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Feature</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              <strong>GoodGame?</strong> helps you decide if a recorded game is worth watching without spoiling the outcome.
              Our AI analyzes games based on:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>How close the score was throughout the game</li>
              <li>Lead changes and momentum swings</li>
              <li>Overall competitiveness and entertainment value</li>
              <li>Statistical analysis of game flow</li>
            </ul>
            <p className="text-gray-700">
              Reveal spoilers at your own pace - start with just the quality rating, then decide if you want to know the winner,
              and finally see the full score if you&apos;re still interested.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
