'use client'

import MainContent from '@/components/MainContent'
import Sidebar from '@/components/Sidebar'
import { useState, useEffect, Suspense } from 'react'

function HomeContent() {
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

export default function Home() {
  return (
    <Suspense fallback={<div className="desktop-container">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}