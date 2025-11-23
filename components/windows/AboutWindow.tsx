'use client'

import React, { useState, useEffect } from 'react'

export default function AboutWindow() {
  const [activeTab, setActiveTab] = useState('applications')

  const [cpuBars, setCpuBars] = useState<number[]>([])
  const [memoryBars, setMemoryBars] = useState<number[]>([])

  useEffect(() => {
    const updateGauges = () => {
      const newCpuBars = Array.from({ length: 20 }, () => Math.random() * 80 + 20)
      const newMemoryBars = Array.from({ length: 20 }, () => Math.random() * 80 + 20)
      setCpuBars(newCpuBars)
      setMemoryBars(newMemoryBars)
    }

    updateGauges()
    const interval = setInterval(updateGauges, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="window">
      <div className="window-title">Profiler - ahat</div>
      <div className="tab-container">
        <div 
          className={`tab ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </div>
        <div 
          className={`tab ${activeTab === 'processes' ? 'active' : ''}`}
          onClick={() => setActiveTab('processes')}
        >
          Processes
        </div>
        <div 
          className={`tab ${activeTab === 'monitor' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitor')}
        >
          Monitor
        </div>
      </div>

      {activeTab === 'applications' && (
        <div className="window-content active">
          <div className="graph-container">
            <div className="graph">
              <div className="graph-title">CPU</div>
              <div className="graph-visual">
                {cpuBars.map((height, index) => (
                  <div 
                    key={index}
                    className="graph-bar" 
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="graph">
              <div className="graph-title">Memory</div>
              <div className="graph-visual">
                {memoryBars.map((height, index) => (
                  <div 
                    key={index}
                    className="graph-bar" 
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="stats-container">
            <div className="stats-box">
              <div className="stats-title">Profile</div>
              <div className="stats-row">
                <div className="stats-label">Name:</div>
                <div>Taha Rawjani</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Title:</div>
                <div>Student @ ACL</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Experience:</div>
                <div>6.7 years</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Status:</div>
                <div>Available</div>
              </div>
            </div>
            <div className="stats-box">
              <div className="stats-title">Resources (KB)</div>
              <div className="stats-row">
                <div className="stats-label">Creativity:</div>
                <div>945</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Logic:</div>
                <div>987</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Coffee:</div>
                <div>432</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Free:</div>
                <div>234</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'processes' && (
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%' }}>
            <div className="stats-title">About Me</div>
            <p style={{ marginBottom: '10px' }}>
              I started programming in 8th grade. My first projects were in C++, such as tahascript and neo-OS.
              Nowadays, I'm building solutions to real-world problems, such as saving the freaking whales with AI-powered buoys.
            </p>
            <p>
              I'm the Co-Founder and President of ACL Competitive Programming Club, growing to 100+ members.
              We hosted ACL-IT, which was LCPS's first Competitive Programming Tournament!
            </p>
          </div>

          <div className="stats-container" style={{ marginTop: '15px' }}>
            <div className="stats-box">
              <div className="stats-title">Education</div>
              <div className="stats-row">
                <div className="stats-label">School:</div>
                <div>Academies of Loudoun</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">GPA:</div>
                <div>4.0, Summa Cum Laude</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">SAT:</div>
                <div>1540</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Graduation:</div>
                <div>June 2026</div>
              </div>
            </div>
            <div className="stats-box">
              <div className="stats-title">Fun Stats</div>
              <div className="stats-row">
                <div className="stats-label">CP Problems Solved:</div>
                <div>1500+</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Hackathon Wins:</div>
                <div>8x Winner</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Spanish 1 Grade:</div>
                <div>B+</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monitor' && (
        <div className="window-content active">
          <div className="stats-box" style={{ width: '100%', marginBottom: '15px' }}>
            <div className="stats-title">System Information</div>
            <div className="stats-row">
              <div className="stats-label">Operating System:</div>
              <div>Arch Linux :D</div>
            </div>
            <div className="stats-row">
              <div className="stats-label">Primary Languages:</div>
              <div>C++, Python, Javascript</div>
            </div>
            <div className="stats-row">
              <div className="stats-label">Secondary Languages:</div>
              <div>C, Java, C#</div>
            </div>
            <div className="stats-row">
              <div className="stats-label">System Uptime:</div>
              <div>17.5 years</div>
            </div>
          </div>

          <div className="stats-box" style={{ width: '100%' }}>
            <div className="stats-title">Personal Information</div>
            <div className="stats-row">
              <div className="stats-label">Location:</div>
              <div>Leesburg, VA</div>
            </div>
            <div className="stats-row">
              <div className="stats-label">Interests:</div>
              <div>Competitive Programming, AI, OS Development</div>
            </div>
            <div className="stats-row">
              <div className="stats-label">Languages:</div>
              <div>English, Urdu, Spanish, Arabic</div>
            </div>
            <div className="stats-row">
              <div className="stats-label">Status:</div>
              <div>Cooked</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contact Icons at bottom */}
      <div className="contact-section">
        <div className="contact-icons-row">
          <div className="contact-icon" onClick={() => window.open('https://github.com/2900xt')}>
            <div className="icon small">🐙</div>
            <span>GitHub</span>
          </div>
          <div className="contact-icon" onClick={() => window.open('https://www.linkedin.com/in/taha-rawjani-08959a2a0/')}>
            <div className="icon small">💼</div>
            <span>LinkedIn</span>
          </div>
          <div className="contact-icon" onClick={() => window.open('https://youtube.com/@2900xt')}>
            <div className="icon small">📺</div>
            <span>YouTube</span>
          </div>
        </div>
      </div>
    </div>
  )
}