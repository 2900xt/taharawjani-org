'use client'

import React from 'react'

export default function ProjectsWindow() {
  const projects = [
    {
      title: "Neo OS",
      tech: "C++, x86 Assembly, Custom Drivers",
      link: "https://github.com/2900xt/neo-OS",
      description: "An operating system written from scratch featuring custom drivers, UNIX-based VFS, multithreading, interactive shell with TahaScript, custom .nic image format, and AHCI/FDC/PIT/APIC drivers."
    },
    {
      title: "MobyGlobal: AI Whale Tracking",
      tech: "TensorFlow, Python, Next.js, Embedded C++",
      link: "https://mobylabs.org",
      description: "Real-time AI-powered whale tracking network using 3D-printed buoys (patent pending). Won 4th at International Science & Engineering Fair 2025, accepted to Ocean Sciences Meeting 2026."
    },
    {
      title: "Braindead 2DS",
      tech: "Java Swing, A* Pathfinding, Game Engine",
      link: "https://github.com/2900xt/Braindead-2DS",
      description: "Counter Strike inspired 2D shooter with custom game engine, input system, rendering pipeline, UI engine, level loader/editor, custom map format, and AI bots using A* pathfinding for 5v5 gameplay."
    },
    {
      title: "Reef: The Research Search Engine",
      tech: "Next.js, arXiv API, Supabase, Stripe, Tailwind",
      link: "https://reef.mobylabs.org",
      description: "An abstract search engine for scientific research papers with advanced filtering using vector embeddings. 5x faster than word-based search and ~50x cheaper than traditional LLM-based deep research. Integrated with stripe for monetization, part of the MobyLabs ecosystem."
    }
  ]

  return (
    <div className="window">
      <div className="window-title">Latest Projects</div>
      <div className="window-content active">
        <div className="projects-list">
          {projects.map((project, index) => (
            <div key={index} className="project-item">
              <div className="project-title">
                <a href={project.link}>{project.title}</a> <div>{project.tech}</div>
              </div>
              <p style={{ marginTop: '10px' }}>{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}