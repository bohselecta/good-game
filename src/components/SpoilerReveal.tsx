'use client';
import { useState } from 'react';

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

export function SpoilerReveal({ game }: { game: Game }) {
  const [revealed, setRevealed] = useState({
    quality: false,
    winner: false,
    score: false
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4 max-w-2xl mx-auto">
      {/* Always visible */}
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800">{game.homeTeam} vs {game.awayTeam}</h3>
        <p className="text-sm text-gray-600 mt-1">{game.league} • {new Date(game.gameDate).toLocaleDateString()}</p>
      </div>

      {/* Progressive reveals */}
      {!revealed.quality ? (
        <button
          onClick={() => setRevealed(prev => ({ ...prev, quality: true }))}
          className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          🎮 Is this game worth watching?
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-green-600">{game.qualityScore}/10</span>
            <span className="text-lg font-medium text-green-700">• {game.excitement}</span>
            {game.isClose && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Close Game</span>}
          </div>
          <p className="text-gray-700 leading-relaxed">{game.analysis}</p>
        </div>
      )}

      {revealed.quality && !revealed.winner && (
        <button
          onClick={() => setRevealed(prev => ({ ...prev, winner: true }))}
          className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          👑 Who won/is leading?
        </button>
      )}

      {revealed.winner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-lg font-semibold text-yellow-800">
            {game.winner} {game.status === 'live' ? 'is leading' : 'won'}
          </p>
          {game.leadChanges !== undefined && (
            <p className="text-sm text-yellow-700 mt-1">Lead changes: {game.leadChanges}</p>
          )}
        </div>
      )}

      {revealed.winner && !revealed.score && (
        <button
          onClick={() => setRevealed(prev => ({ ...prev, score: true }))}
          className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          🔢 Reveal final score
        </button>
      )}

      {revealed.score && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-3xl font-bold text-red-600 text-center">{game.finalScore}</p>
        </div>
      )}
    </div>
  );
}
