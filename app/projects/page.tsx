'use client';

import React from 'react'

export default function ProjectsPage() {
  const projects = [
    {
      title: "Neo OS",
      tech: "C++, x86 Assembly, Custom Drivers",
      link: "https://github.com/2900xt/neo-OS",
      description: "An operating system written from scratch featuring custom drivers, UNIX-based VFS, multithreading, interactive shell with TahaScript, and custom .nic image format."
    },
    {
      title: "MobyGlobal: AI Whale Tracking",
      tech: "TensorFlow, Python, Next.js, Embedded C++",
      link: "https://mobylabs.org",
      description: "Real-time AI-powered whale tracking network using 3D-printed buoys (patent pending). Won 4th at International Science & Engineering Fair 2025."
    },
    {
      title: "Braindead 2DS",
      tech: "Java Swing, A* Pathfinding, Game Engine",
      link: "https://github.com/2900xt/Braindead-2DS",
      description: "Counter Strike inspired 2D shooter with custom game engine and AI."
    },
    {
      title: "Reef: The Research Search Engine",
      tech: "Next.js, LangGraph, Supabase, Stripe, Tailwind",
      link: "https://app.mobylabs.org",
      description: "An abstract search engine and research idea generator. Uses a knowledge graph and vector DB of Arxiv papers."
    },
    {
      title: "Nexus: AI Learning Platform",
      tech: "LangGraph, RAG, Kaplay.js, ElevenLabs, Next.js",
      link: "https://nexus.education",
      description: "Agentically generates interactive mini-games and videos from teacher lesson plans in one click. Won PatriotHacks 2026."
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
