'use client';

import React from 'react'

export default function ProjectsPage() {
  const projects = [
    {
      title: "Neo OS",
      tech: "c++, x86 nasm, qemu",
      link: "https://github.com/2900xt/neo-OS",
      description: "An operating system written from scratch featuring custom drivers, UNIX-based VFS, multithreading, interactive shell with TahaScript."
    },
    {
      title: "MobyGlobal: AI Whale Tracking",
      tech: "tensorflow, python, c++, embeded systems, flask, platform-io",
      link: "https://mobylabs.org",
      description: "Real-time AI-powered whale tracking network using 3D-printed buoys."
    },
    {
      title: "67-Racer",
      tech: "mosquitto, nextjs, opencv, python, aws deepracers",
      link: "https://ghost-racer.vercel.app/",
      description: " Clones how you drive. Then beats you at your own game."
    },
    {
      title: "Mobylabs: Automating AI Research",
      tech: "next.js, langchain, python, arxiv API, anthropic, openai",
      link: "https://github.com/2900xt/mobylabs",
      description: "Fully automated AI research platform. Scrapes ArXiv for papers, generates code implementations, and drafts methodology and results sections for research papers."
    },
    {
      title: "Nexus: AI Learning Platform",
      tech: "langgraph, kaplay.js, next.js, python, digitalocean, elevenlabs",
      link: "https://nexus-rust-theta.vercel.app/landing",
      description: "Agentically generates interactive mini-games and videos from teacher lesson plans in one click."
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
