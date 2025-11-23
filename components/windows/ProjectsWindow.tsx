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
      tech: "TensorFlow, PyTorch, ESP32, C++, Fusion360",
      link: "https://github.com/2900xt/MobyGlobal",
      description: "Real-time AI-powered whale tracking network using 3D-printed buoys (patent pending). Won 4th at International Science & Engineering Fair 2025, accepted to Ocean Sciences Meeting 2026."
    },
    {
      title: "Braindead 2DS",
      tech: "Java Swing, A* Pathfinding",
      link: "https://github.com/2900xt/Braindead-2DS",
      description: "Counter Strike inspired 2D shooter with custom game engine, input system, rendering pipeline, UI engine, level loader/editor, custom map format, and AI bots using A* pathfinding for 5v5 gameplay."
    },
    {
      title: "ACL Online Judge",
      tech: "Next.js, Judge0, Supabase",
      link: "https://github.com/AcademiesCS/acl-oj",
      description: "A competitive programming judge for my school with in-house rating system. Serving 100+ users at ACL and LCPS."
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