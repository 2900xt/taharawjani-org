'use client'

import { useRouter } from 'next/navigation'

export default function GamesWindow() {
  const router = useRouter()

  const games = [
    {
      name: 'EcoSpark',
      description: 'A city builder game',
      slug: 'ecospark',
      icon: '🏙️'
    },
    {
      name: 'Plundr.io',
      description: 'A pirate battle royale',
      slug: 'plundr',
      icon: '🏴‍☠️'
    },
    {
      name: 'Bread2Dough',
      description: 'A bread farming tycoon',
      slug: 'bread2dough',
      icon: '🍞'
    },
    {
      name: 'CR Impostor',
      description: 'Clash Royale themed Impostor Game',
      slug: 'crimpostor',
      icon: '👑'
    }
  ]

  return (
    <div className="window">
      <div className="window-title">Games</div>
      <div className="window-content active">
        <div className="stats-box" style={{ width: '100%', marginBottom: '15px' }}>
          <div className="stats-title">Game Library</div>
          <div className="games-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'flex-start' }}>
            {games.map((game, index) => (
              <div
                key={index}
                className="game-app"
                onClick={() => router.push(`/games/${game.slug}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px',
                  cursor: 'pointer',
                  minWidth: '80px',
                  textAlign: 'center'
                }}
              >
                <div className="icon" style={{ fontSize: '32px', marginBottom: '5px' }}>{game.icon}</div>
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{game.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}