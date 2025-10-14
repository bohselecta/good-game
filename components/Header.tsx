export default function Header({ onRefresh, analyzing }: { onRefresh?: () => void; analyzing?: boolean }) {
  return (
    <header className="header">
      <div className="brand">
        <span className="mark" aria-label="GoodGame logo">
          <img 
            src="/logo.png" 
            alt="GoodGame?" 
            width="56" 
            height="56"
            style={{ borderRadius: '10px' }}
          />
        </span>
        GoodGame?
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
