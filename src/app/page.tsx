'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import GameCard from '../../components/GameCard';

interface Game {
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
        setGames(data.games || []);
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
      <div className="loading">
        <div className="spinner"></div>
        <p className="subtle" style={{marginTop: '16px'}}>Loading games...</p>
      </div>
    );
  }

  return (
    <>
      <Header onRefresh={triggerAnalysis} analyzing={analyzing} />
      <main className="page">
        {games.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎮</div>
            <h2>No games analyzed yet</h2>
            <p>
              We&apos;re working on analyzing recent games. Check back soon!
            </p>
            <div style={{background: 'var(--gg-panel)', border: '1px solid var(--gg-border)', borderRadius: 'var(--r-lg)', padding: '20px', maxWidth: '400px', margin: '0 auto'}}>
              <p className="subtle" style={{marginBottom: '16px'}}>
                <strong>Note:</strong> Games are analyzed automatically daily.
                You can also manually trigger analysis below.
              </p>
              <button
                onClick={triggerAnalysis}
                disabled={analyzing}
                className="btn"
                style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
              >
                {analyzing ? (
                  <>
                    <div className="spinner" style={{width: '16px', height: '16px', borderWidth: '2px'}}></div>
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
            <h2 className="section-title">Recent Games ({games.length})</h2>
            <p className="subtle">Click any card to progressively reveal spoilers</p>
            <div className="grid">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
