"use client";

import { useEffect, useState } from "react";

const BAR_COUNT = 24;

function makeBars(time: number) {
  return Array.from({ length: BAR_COUNT }, (_, index) => {
    const position = index / BAR_COUNT;
    const speed = position < 0.35 ? 185 : position < 0.7 ? 135 : 105;
    const primary = Math.sin(time / speed + index * 0.31);
    const secondary = Math.sin(time / (speed * 0.61) + index * 0.57);
    return Math.max(18, Math.min(100, 57 + primary * 27 + secondary * 16));
  });
}

export default function TopBarVisualizer() {
  const [bars, setBars] = useState(() => makeBars(0));

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const startedAt = performance.now();
    const interval = window.setInterval(() => {
      setBars(makeBars(performance.now() - startedAt));
    }, 80);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <a
      className="topbar-player"
      href="https://open.spotify.com/track/2lTm559tuIvatlT1u0JYG2"
      target="_blank"
      rel="noreferrer"
      aria-label="BAILE INoLVIDABLE"
    >
      <span className="topbar-track">BAILE INoLVIDABLE</span>
      <span className="topbar-cava" aria-hidden="true">
        {bars.map((height, index) => (
          <i key={index} style={{ height: `${height}%` }} />
        ))}
      </span>
    </a>
  );
}
