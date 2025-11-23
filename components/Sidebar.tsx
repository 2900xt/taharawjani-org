'use client'

import React from 'react'

interface SidebarProps {
  side: 'left' | 'right'
  activeWindow: string
  setActiveWindow: (window: string) => void
}

export default function Sidebar({ side, activeWindow, setActiveWindow }: SidebarProps) {
  if (side === 'left') {
    return (
      <div className="sidebar left">
        <div className="icon-container" onClick={() => setActiveWindow('about')}>
          <div className="icon">👤</div>
          <div>HDD1</div>
        </div>
        <div className="icon-container" onClick={() => setActiveWindow('projects')}>
          <div className="icon">📁</div>
          <div>Projects</div>
        </div>
        <div className="icon-container" onClick={() => setActiveWindow('games')}>
          <div className="icon">🎮</div>
          <div>Games</div>
        </div>
        <div className="icon-container" onClick={() => setActiveWindow('blog')}>
          <div className="icon">📝</div>
          <div>Blog</div>
        </div>
      </div>
    )
  }

  const handleBooksClick = () => {
    alert('📚 Current Reading List:\n\n• The Mom Test by Rob Fitzpatrick\n• Zero to One by Peter Thiel')
  }

  const handleResumeClick = () => {
    window.open('/Taha_Rawjani__Resume.pdf', '_blank')
  }

  return (
    <div className="sidebar right">
      <div className="icon-container" onClick={handleResumeClick}>
        <div className="icon">📄</div>
        <div>Resume</div>
      </div>
      <div className="icon-container" onClick={handleBooksClick}>
        <div className="icon">📚</div>
        <div>Books</div>
      </div>
    </div>
  )
}