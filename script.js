(() => {
  const bars = Array.from(document.querySelectorAll(".topbar-cava i"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const barCount = bars.length;
  let intervalId;

  function updateBars(time) {
    bars.forEach((bar, index) => {
      const position = index / barCount;
      const speed = position < 0.35 ? 185 : position < 0.7 ? 135 : 105;
      const primary = Math.sin(time / speed + index * 0.31);
      const secondary = Math.sin(time / (speed * 0.61) + index * 0.57);
      const height = Math.max(18, Math.min(100, 57 + primary * 27 + secondary * 16));
      bar.style.height = `${height}%`;
    });
  }

  function startVisualizer() {
    if (reduceMotion.matches || intervalId) return;
    const startedAt = performance.now();
    intervalId = window.setInterval(() => updateBars(performance.now() - startedAt), 80);
  }

  function stopVisualizer() {
    window.clearInterval(intervalId);
    intervalId = undefined;
  }

  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches) stopVisualizer();
    else startVisualizer();
  });

  startVisualizer();
})();
