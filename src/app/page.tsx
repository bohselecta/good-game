'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../../components/Header';
import GameCard from '../../components/GameCard';
import SportFilter from '../../components/SportFilter';
import SortFilter from '../../components/SortFilter';

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


type Sport = "NBA"|"NFL"|"MLB"|"NHL"|"Soccer"|"UFC";
type SortOption = 'date' | 'quality' | 'excitement';

export default function HomePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSports, setSelectedSports] = useState<Sport[]>(['NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'UFC']);
  const [sortBy, setSortBy] = useState<SortOption>('date');

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


  // Filter and sort games
  const filteredAndSortedGames = useMemo(() => {
    const filtered = games.filter(game => 
      selectedSports.length === 0 || selectedSports.includes(game.league as Sport)
    );

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime();
        case 'quality':
          return (b.qualityScore || 0) - (a.qualityScore || 0);
        case 'excitement':
          const excitementOrder = { 'thriller': 3, 'competitive': 2, 'blowout': 1 };
          return (excitementOrder[b.excitement as keyof typeof excitementOrder] || 0) - 
                 (excitementOrder[a.excitement as keyof typeof excitementOrder] || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [games, selectedSports, sortBy]);

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
      <Header />
      <main className="page">
        {games.length === 0 ? (
          <div className="empty-state">
            <div className="logo-container">
              <img 
                src="/logo.png" 
                alt="GoodGame?" 
                width="120" 
                height="120"
                style={{ borderRadius: '20px' }}
              />
            </div>
            <h2>No games analyzed yet</h2>
            <p>
              We&apos;re working on analyzing recent games. Check back soon!
            </p>
            <div style={{background: 'var(--gg-panel)', border: '1px solid var(--gg-border)', borderRadius: 'var(--r-lg)', padding: '20px', maxWidth: '400px', margin: '0 auto'}}>
              <p className="subtle" style={{marginBottom: '16px'}}>
                <strong>Note:</strong> Games are analyzed automatically daily.
                Check back soon for the latest game reviews!
              </p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="section-title">Recent Games ({filteredAndSortedGames.length})</h2>
            <p className="subtle">Click any card to progressively reveal spoilers</p>
            
            {/* Filter and Sort Controls */}
            <div className="filters-section">
              <SportFilter 
                selectedSports={selectedSports}
                onSportsChange={setSelectedSports}
              />
              <SortFilter 
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>

            <div className="grid">
              {filteredAndSortedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
