'use client'

import React from 'react'
import AboutWindow from './windows/AboutWindow'
import ProjectsWindow from './windows/ProjectsWindow'
import GamesWindow from './windows/GamesWindow'
import BlogWindow from './windows/BlogWindow'

interface MainContentProps {
  activeWindow: string
}

export default function MainContent({ activeWindow }: MainContentProps) {
  return (
    <div className="main-content">
      {activeWindow === 'about' && <AboutWindow />}
      {activeWindow === 'projects' && <ProjectsWindow />}
      {activeWindow === 'games' && <GamesWindow />}
      {activeWindow === 'blog' && <BlogWindow />}
    </div>
  )
}