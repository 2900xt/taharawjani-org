"use client";

import Link from "next/link";
import React from "react";

interface SidebarProps {
  side: "left" | "right";
}

export default function Sidebar({ side }: SidebarProps) {
  if (side === "left") {
    return (
      <div className="sidebar left">
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="icon-container">
            <div className="icon">👤</div>
            <div>/dev/sda</div>
          </div>
        </a>
        <a href="/projects" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="icon-container">
            <div className="icon">📁</div>
            <div>Projects</div>
          </div>
        </a>
        <a href="/games" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="icon-container">
            <div className="icon">🎮</div>
            <div>Games</div>
          </div>
        </a>
        <a href="/blog" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="icon-container">
            <div className="icon">📝</div>
            <div>Blog</div>
          </div>
        </a>
      </div>
    );
  }

  const handleBooksClick = () => {
    alert(
      "📚 Current Reading List:\n\n• The Mom Test by Rob Fitzpatrick\n• Zero to One by Peter Thiel"
    );
  };

  const handleResumeClick = () => {
    // server file '/public/resume.pdf'
    window.open("/resume.pdf", "_blank");
  };

  return (
    <div className="sidebar right">
      <div className="icon-container" onClick={handleResumeClick}>
        <div className="icon">📄</div>
        <div>Resume</div>
      </div>
      <div className="icon-container" onClick={handleBooksClick}>
        <div className="icon">📚</div>
        <div>Books</div>
      </div>
    </div>
  );
}
