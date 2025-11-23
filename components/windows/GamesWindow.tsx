'use client'

import React from 'react'

export default function GamesWindow() {
  const games = [
    {
      name: 'EcoSpark',
      description: 'A city builder game',
      url: 'https://cognicadestudios.github.io/EcoSparkGame/',
      icon: '🏙️'
    },
    {
      name: 'Plundr.io',
      description: 'A pirate battle royale',
      url: 'https://ashmithry.github.io/Plundr.io-Game/',
      icon: '🏴‍☠️'
    },
    {
      name: 'Bread2Dough',
      description: 'A bread farming tycoon',
      url: 'https://2900xt.github.io/bread2dough-build/',
      icon: '🍞'
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
                onClick={() => window.open(game.url, '_blank')}
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