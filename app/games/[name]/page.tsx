import Link from "next/link";

export default async function GameViewer({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const gameName = decodeURIComponent(resolvedParams.name);

  // Game data mapping
  const games: Record<string, { url: string; name: string; icon: string }> = {
    'ecospark': {
      name: 'EcoSpark',
      url: 'https://cognicadestudios.github.io/EcoSparkGame/',
      icon: '🏙️'
    },
    'plundr': {
      name: 'Plundr.io',
      url: 'https://ashmithry.github.io/Plundr.io-Game/',
      icon: '🏴‍☠️'
    },
    'bread2dough': {
      name: 'Bread2Dough',
      url: 'https://2900xt.github.io/bread2dough-build/',
      icon: '🍞'
    }
  };

  const game = games[gameName.toLowerCase()];

  if (!game) {
    return (
      <div className="window">
        <div className="window-title">Game - Error</div>
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%', marginBottom: '15px' }}>
            <p>Game not found: {gameName}</p>
            <Link
              style={{
                padding: '5px 10px',
                background: '#333',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-block',
                marginTop: '10px'
              }}
              href="/games"
            >
              ← Back to Games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="window">
      <div className="window-title">
        <span style={{ marginRight: '8px' }}>{game.icon}</span>
        {game.name}
      </div>
      <div className="window-content active">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '10px'
        }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link
              style={{
                padding: '8px 12px',
                background: '#333',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              href="/games"
            >
              ← Back to Games
            </Link>
            <a
              style={{
                padding: '8px 12px',
                background: '#555',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              href={game.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in New Tab ↗
            </a>
          </div>
          <div
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              border: '2px solid #333',
              borderRadius: '4px',
              overflow: 'hidden',
              backgroundColor: '#000',
              position: 'relative'
            }}
          >
            <iframe
              src={game.url}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block'
              }}
              title={game.name}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
