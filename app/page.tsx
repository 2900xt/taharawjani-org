'use client';

import Image from "next/image";
import React, { useState, useEffect } from "react";
import Terminal from "@/components/Terminal";

export default function Home() {
  const [activeTab, setActiveTab] = useState("processes");

  const [cpuBars, setCpuBars] = useState<number[]>([]);
  const [memoryBars, setMemoryBars] = useState<number[]>([]);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([]);
  const [currentSong] = useState({
    title: "Lofi Beats",
    artist: "Study Session"
  });

  useEffect(() => {
    const updateGauges = () => {
      const newCpuBars = Array.from(
        { length: 20 },
        () => Math.random() * 80 + 20
      );
      const newMemoryBars = Array.from(
        { length: 20 },
        () => Math.random() * 80 + 20
      );
      setCpuBars(newCpuBars);
      setMemoryBars(newMemoryBars);
    };

    updateGauges();
    const interval = setInterval(updateGauges, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateVisualizer = () => {
      const newBars = Array.from(
        { length: 60 },
        (_, i) => {
          // Create a more musical pattern with bass (left), mids (center), highs (right)
          const position = i / 60;
          const bass = Math.sin(Date.now() / 200 + i * 0.1) * 40 + 50;
          const mids = Math.sin(Date.now() / 150 + i * 0.2) * 30 + 40;
          const highs = Math.sin(Date.now() / 100 + i * 0.3) * 20 + 30;

          // Mix frequencies based on position
          if (position < 0.33) return Math.max(20, bass + Math.random() * 20);
          if (position < 0.66) return Math.max(20, mids + Math.random() * 20);
          return Math.max(20, highs + Math.random() * 20);
        }
      );
      setVisualizerBars(newBars);
    };

    updateVisualizer();
    const interval = setInterval(updateVisualizer, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="window">
      <div className="window-title">Profiler - ahat</div>
      <div className="tab-container">
        <div
          className={`tab ${activeTab === "processes" ? "active" : ""}`}
          onClick={() => setActiveTab("processes")}
        >
          Processes
        </div>
        <div
          className={`tab ${activeTab === "terminal" ? "active" : ""}`}
          onClick={() => setActiveTab("terminal")}
        >
          Terminal
        </div>
      </div>

      {activeTab === "processes" && (
        <div className="window-content active">
          <div className="stats-box" style={{ width: "100%", backgroundColor: "#1a1a1a", padding: "20px" }}>
            {/* Now Playing Title */}
            <div style={{
              marginBottom: "15px",
              textAlign: "center",
              borderBottom: "1px solid #333",
              paddingBottom: "10px"
            }}>
              <div style={{
                fontSize: "11px",
                color: "#888",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "4px"
              }}>
                Now Playing
              </div>
              <div style={{
                fontSize: "16px",
                color: "#fff",
                fontWeight: "600",
                marginBottom: "2px"
              }}>
                {currentSong.title}
              </div>
              <div style={{
                fontSize: "13px",
                color: "#aaa"
              }}>
                {currentSong.artist}
              </div>
            </div>

            {/* Visualizer */}
            <div style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-around",
              height: "120px",
              gap: "3px"
            }}>
              {visualizerBars.map((height, index) => (
                <div
                  key={index}
                  style={{
                    width: "8px",
                    height: `${height}%`,
                    backgroundColor: "#8b5cf6",
                    borderRadius: "2px 2px 0 0",
                    transition: "height 0.08s ease-out",
                    boxShadow: "0 0 8px rgba(139, 92, 246, 0.5)"
                  }}
                />
              ))}
            </div>
          </div>

          <div className="stats-container" style={{ marginTop: "15px" }}>
            <div className="stats-box">
              <div className="stats-title">Experience</div>
              <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <a href="https://mobylabs.org/" style={{ color: '#0066cc', textDecoration: 'none' }}>
                    CTO @ Moby Labs
                  </a>
                  <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>Jun 2024 - Present</span>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="https://maximus.com/" style={{ color: '#0066cc', textDecoration: 'none' }}>
                    SWE Intern @ Maximus
                  </a>
                  <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>Jun 2025 - Aug 2025</span>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="https://blueprint.mov/" style={{ color: '#0066cc', textDecoration: 'none' }}>
                    SWE @ Blueprint
                  </a>
                  <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>Mar 2025 - Jul 2025</span>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <a href="https://www.academies-it.org/" style={{ color: '#0066cc', textDecoration: 'none' }}>
                    CS @ Academies of Loudoun
                  </a>
                  <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>Aug 2022 - Present</span>
                </li>
              </ul>
            </div>
            <div className="stats-box">
              <div className="stats-title">Fun Stats</div>
              <div className="stats-row">
                <div className="stats-label">CP Problems Solved</div>
                <div>1500+</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Hackathon Wins</div>
                <div>8</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">Spanish 1 Grade</div>
                <div>B+</div>
              </div>
              <div className="stats-row">
                <div className="stats-label">AI B2B SaaS?</div>
                <div>:)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "terminal" && <Terminal />}


      {/* Contact Icons at bottom */}
      <div className="contact-section">
        <div className="contact-icons-row">
          <ContactIcon
            icon="/pictures/github.png"
            label="github"
            url="https://github.com/2900xt"
          />
          <ContactIcon
            icon="/pictures/linkedin.png"
            label="cringedin"
            url="https://www.linkedin.com/in/taha-rawjani-08959a2a0/"
          />
          <ContactIcon
            icon="/pictures/youtube.png"
            label="yt"
            url="https://youtube.com/@its-ahat"
          />
        </div>
      </div>
    </div>
  );
}

function ContactIcon({
  icon,
  label,
  url,
}: {
  icon: string;
  label: string;
  url: string;
}) {
  return (
    <div className="contact-icon" onClick={() => window.open(url)}>
      <div className="icon small">
        <Image src={icon} alt={label} width={16} height={16} />
      </div>
      <span>{label}</span>
    </div>
  );
}