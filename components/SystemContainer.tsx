'use client'

import React, { useState, useEffect } from 'react'
import MenuBar from './MenuBar'
import DesktopContainer from './DesktopContainer'

export default function SystemContainer() {
  return (
    <div className="system-container">
      <MenuBar />
      <DesktopContainer />
    </div>
  )
}