import SportIcon from "./SportIcon";
import LeaguePill from "./LeaguePill";
import { useState } from "react";

type Game = {
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
  leadChanges?: number | null;
};

export default function GameCard({ game }: { game: Game }) {
  const [revealed, setRevealed] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Yesterday";
    if (diffDays === 0) return "Today";
    return `${diffDays} days ago`;
  };

  // Get tags based on quality score and excitement
  const getTags = () => {
    const tags = [];
    
    // Quality-based tags
    if (game.qualityScore && game.qualityScore >= 9) tags.push("THRILLER");
    else if (game.qualityScore && game.qualityScore >= 7) tags.push("COMPETITIVE");
    else if (game.qualityScore && game.qualityScore >= 5) tags.push("DECENT");
    else if (game.qualityScore && game.qualityScore >= 3) tags.push("MEH");
    else if (game.qualityScore && game.qualityScore <= 2) tags.push("BLOWOUT");
    
    // Recommendation tags
    if (game.excitement === "thriller") tags.push("MUST WATCH");
    else if (game.excitement === "competitive") tags.push("WORTH IT");
    else if (game.excitement === "blowout") tags.push("SKIP");
    
    return tags;
  };

  const tags = getTags();
  const scoreLabel = game.qualityScore ? `${game.qualityScore}/10` : "TBD";
  const matchup = `${game.homeTeam} vs ${game.awayTeam}`;

  return (
    <article 
      className="card" 
      onClick={() => setRevealed(true)} 
      role="button" 
      aria-pressed={revealed}
    >
      <div className="card-row">
        <div className="rail">
          <SportIcon sport={game.league as "NBA"|"NFL"|"MLB"|"NHL"|"Soccer"|"UFC"} />
          <LeaguePill league={game.league} />
        </div>

        <div>
          <div className="title">{matchup}</div>
          <div className="meta">
            <span>{formatDate(game.gameDate)}</span>
            <span className="badge">{game.status}</span>
          </div>
          <p className={`subtle ${revealed ? "revealed" : "spoiler"}`} style={{marginTop:8}}>
            {game.analysis || "Analysis pending..."}
          </p>
        </div>

        <div className="right">
          <div className={`score ${revealed ? "revealed" : "spoiler"}`}>{scoreLabel}</div>
          <div style={{display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end"}}>
            {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
        </div>
      </div>
    </article>
  );
}
