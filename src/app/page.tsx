'use client';

import { useState, useEffect } from 'react';
import { GameCard } from '../components/GameCard';

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

interface ApiGameResponse {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  gameDate: string;
  status: string;
  qualityScore?: number;
  isClose?: boolean;
  excitement?: string;
  analysis?: string;
  finalScore?: string;
  winner?: string;
  leadChanges?: number;
}

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function fetchGames() {
      try {
        const res = await fetch('/api/games?limit=50', {
          cache: 'no-store'
        });

        if (!res.ok) {
          throw new Error('Failed to fetch games');
        }

        const data = await res.json();
        const formattedGames = (data.games || []).map((game: ApiGameResponse) => ({
          ...game,
          gameDate: new Date(game.gameDate)
        }));
        setGames(formattedGames);
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: 'AdminPass123!' }), // Using the password the user set
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Analysis complete! ${data.message}`);
        // Refresh the games list
        window.location.reload();
      } else {
        const error = await res.json();
        alert(`Analysis failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              GoodGame?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover if recorded games are worth watching without spoiling the outcome.
              Get AI-powered analysis of competitiveness, excitement, and entertainment value.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No games analyzed yet</h2>
            <p className="text-gray-500 mb-6">
              We&apos;re working on analyzing recent games. Check back soon!
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-6">
              <p className="text-sm text-blue-800 mb-4">
                <strong>Note:</strong> Games are analyzed automatically daily.
                You can also manually trigger analysis below.
              </p>
              <button
                onClick={triggerAnalysis}
                disabled={analyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing Games...
                  </>
                ) : (
                  <>
                    🔄 Refresh Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Recent Games ({games.length})
                </h2>
                <button
                  onClick={triggerAnalysis}
                  disabled={analyzing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      🔄 Refresh
                    </>
                  )}
                </button>
              </div>
              <p className="text-gray-600">
                Click on any game to reveal spoilers progressively
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Built with Next.js, DeepSeek AI, and sports data APIs</p>
            <p className="mt-2">
              Supporting NFL, NBA, Premier League, and more sports
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
