type Sport = "NBA"|"NFL"|"MLB"|"NHL"|"Soccer"|"UFC";

export default function SportIcon({ sport }: { sport: Sport }) {
  const icon = {
    NBA: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#2c394a" strokeWidth="2"/>
        <path d="M12 3v18M3 12h18M6 6l12 12M6 18L18 6" stroke="#2c394a" strokeWidth="1.6" opacity=".6"/>
      </svg>
    ),
    NFL: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="6" width="14" height="12" rx="3" stroke="#2c394a" strokeWidth="2"/>
        <path d="M8 9h8M8 12h8M8 15h5" stroke="#2c394a" strokeWidth="1.6" opacity=".7"/>
      </svg>
    ),
    MLB: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#2c394a" strokeWidth="2"/>
        <path d="M7 9c2 2 3 2 5 0m0 6c2-2 3-2 5 0" stroke="#2c394a" strokeWidth="1.6" opacity=".7"/>
      </svg>
    ),
    NHL: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M6 5h12l-1 11-5 3-5-3-1-11z" stroke="#2c394a" strokeWidth="2"/>
        <path d="M8 9h8m-8 3h7" stroke="#2c394a" strokeWidth="1.6" opacity=".7"/>
      </svg>
    ),
    Soccer: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#2c394a" strokeWidth="2"/>
        <path d="M12 6l3 2 1 3-2 3h-4l-2-3 1-3 3-2z" stroke="#2c394a" strokeWidth="1.6" opacity=".7"/>
      </svg>
    ),
    UFC: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="7" width="14" height="10" rx="3" stroke="#2c394a" strokeWidth="2"/>
        <path d="M7 10h10" stroke="#2c394a" strokeWidth="1.6" opacity=".7"/>
      </svg>
    )
  }[sport];

  return <div className="sport-icon">{icon}</div>;
}
