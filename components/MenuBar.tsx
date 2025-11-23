'use client'

import React, { useState, useEffect } from 'react'

export default function MenuBar() {
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }

    updateTime()
    const interval = setInterval(updateTime, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="menu-bar">
      <div className="menu-items">
        <div>Profiler</div>
        <div>File</div>
        <div>Edit</div>
        <div>View</div>
        <div>Window</div>
        <div>Help</div>
      </div>
      <div className="time-display">{currentTime}</div>
    </div>
  )
}