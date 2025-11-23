'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import MainContent from './MainContent'

export default function DesktopContainer() {
  const [activeWindow, setActiveWindow] = useState('about')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const blogParam = urlParams.get('blog')
    
    if (blogParam) {
      setActiveWindow('blog')
    }
  }, [])

  return (
    <div className="desktop-container">
      <Sidebar 
        side="left" 
        activeWindow={activeWindow}
        setActiveWindow={setActiveWindow}
      />
      <MainContent activeWindow={activeWindow} />
      <Sidebar 
        side="right" 
        activeWindow={activeWindow}
        setActiveWindow={setActiveWindow}
      />
    </div>
  )
}