type Sport = "NBA"|"NFL"|"MLB"|"NHL"|"Soccer"|"UFC";

export default function SportIcon({ sport }: { sport: Sport }) {
  const icon = {
    NBA: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        {/* Basketball */}
        <circle cx="12" cy="12" r="10" stroke="#ff6b35" strokeWidth="2" fill="#ff6b35" opacity="0.1"/>
        <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12s4.5-10 10-10z" stroke="#ff6b35" strokeWidth="1.5"/>
        <path d="M12 2v20M2 12h20" stroke="#ff6b35" strokeWidth="1.5"/>
        <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="#ff6b35" strokeWidth="1.2"/>
      </svg>
    ),
    NFL: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        {/* American Football */}
        <ellipse cx="12" cy="12" rx="8" ry="5" stroke="#8b4513" strokeWidth="2" fill="#8b4513" opacity="0.1"/>
        <path d="M4 12c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4s-1.8 4-4 4H8c-2.2 0-4-1.8-4-4z" stroke="#8b4513" strokeWidth="1.5"/>
        <path d="M8 10h8M8 14h8" stroke="#8b4513" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="1" fill="#8b4513"/>
      </svg>
    ),
    MLB: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        {/* Baseball */}
        <circle cx="12" cy="12" r="9" stroke="#c41e3a" strokeWidth="2" fill="#c41e3a" opacity="0.1"/>
        <path d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" stroke="#c41e3a" strokeWidth="1.5"/>
        <path d="M12 3v18M3 12h18" stroke="#c41e3a" strokeWidth="1.5"/>
        <path d="M8 8l8 8M16 8l-8 8" stroke="#c41e3a" strokeWidth="1.2"/>
      </svg>
    ),
    NHL: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        {/* Hockey Puck */}
        <circle cx="12" cy="12" r="8" stroke="#1e3a8a" strokeWidth="2" fill="#1e3a8a" opacity="0.1"/>
        <circle cx="12" cy="12" r="6" stroke="#1e3a8a" strokeWidth="1.5"/>
        <path d="M6 12h12M12 6v12" stroke="#1e3a8a" strokeWidth="1.2"/>
        <circle cx="12" cy="12" r="2" fill="#1e3a8a"/>
      </svg>
    ),
    Soccer: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        {/* Soccer Ball */}
        <circle cx="12" cy="12" r="10" stroke="#000000" strokeWidth="2" fill="#ffffff"/>
        <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12s4.5-10 10-10z" stroke="#000000" strokeWidth="1.5"/>
        <path d="M12 2v20M2 12h20" stroke="#000000" strokeWidth="1.5"/>
        <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="#000000" strokeWidth="1.2"/>
        <path d="M8.5 4.5l7 15M15.5 4.5l-7 15" stroke="#000000" strokeWidth="1"/>
        <path d="M4.5 8.5l15 7M4.5 15.5l15-7" stroke="#000000" strokeWidth="1"/>
      </svg>
    ),
    UFC: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        {/* MMA Glove */}
        <path d="M8 4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V4z" stroke="#dc2626" strokeWidth="2" fill="#dc2626" opacity="0.1"/>
        <rect x="8" y="4" width="8" height="6" rx="2" stroke="#dc2626" strokeWidth="1.5"/>
        <path d="M10 6h4M10 8h4" stroke="#dc2626" strokeWidth="1.2"/>
        <circle cx="12" cy="7" r="1" fill="#dc2626"/>
        {/* Fist */}
        <circle cx="12" cy="12" r="3" stroke="#dc2626" strokeWidth="1.5" fill="#dc2626" opacity="0.1"/>
        <path d="M9 12h6M12 9v6" stroke="#dc2626" strokeWidth="1.2"/>
      </svg>
    )
  }[sport];

  return <div className="sport-icon">{icon}</div>;
}
