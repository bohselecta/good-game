export default function Header({ onRefresh, analyzing }: { onRefresh?: () => void; analyzing?: boolean }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="mark" aria-label="GoodGame logo">
          {/* question-mark + play dot */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M8.9 7.7c0-2.3 1.9-4.2 4.4-4.2 2.3 0 4.3 1.6 4.3 3.9 0 1.6-.8 2.7-2.5 3.6-1.6.8-2.2 1.4-2.2 2.5v.5" stroke="#1a2332" strokeWidth="2.6" strokeLinecap="round"/>
            <path d="M11.5 20.1l3.6-2.1-3.6-2.1v4.2z" fill="#c4ff0e"/>
          </svg>
        </span>
        GoodGame<span style={{opacity:.7}}>?</span>
      </div>
      <div className="controls">
        <button 
          className="btn" 
          onClick={onRefresh}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <div className="spinner" style={{width: '16px', height: '16px', borderWidth: '2px', marginRight: '8px'}}></div>
              Analyzing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>
    </header>
  );
}
