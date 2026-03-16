"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Problem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
}

interface ContestProblem extends Problem {
  targetRating: number;
  label: string;
}

const CF_TAGS = [
  "binary search", "bitmasks", "brute force", "combinatorics",
  "constructive algorithms", "data structures", "dfs and similar",
  "divide and conquer", "dp", "dsu", "flows", "games", "geometry",
  "graph matchings", "graphs", "greedy", "hashing", "implementation",
  "interactive", "math", "matrices", "number theory", "probabilities",
  "shortest paths", "sortings", "string suffix structures", "strings",
  "ternary search", "trees", "two pointers",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getRatingColor(rating: number | undefined): string {
  if (!rating) return "#999";
  if (rating < 1200) return "#999";
  if (rating < 1400) return "#00cc00";
  if (rating < 1600) return "#00cccc";
  if (rating < 1900) return "#5555ff";
  if (rating < 2100) return "#aa00aa";
  if (rating < 2400) return "#ff8c00";
  return "#ff0000";
}

function getRankName(rating: number): string {
  if (rating < 1200) return "Newbie";
  if (rating < 1400) return "Pupil";
  if (rating < 1600) return "Specialist";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Candidate Master";
  if (rating < 2400) return "Master";
  if (rating < 2600) return "International Master";
  if (rating < 3000) return "Grandmaster";
  return "Legendary Grandmaster";
}

export default function CFPracticePage() {
  const [handle, setHandle] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [maxRating, setMaxRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [contest, setContest] = useState<ContestProblem[] | null>(null);
  const [generatingContest, setGeneratingContest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [timerRunning, setTimerRunning] = useState(false);
  const [contestFinished, setContestFinished] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allProblemsRef = useRef<Problem[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setTimerRunning(false);
            setContestFinished(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timerRunning, timeLeft]);

  const fetchUser = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setError("");
    setRating(null);
    setSelectedTag(null);
    setContest(null);

    try {
      const res = await fetch(
        `/api/codeforces?method=user.info&handles=${encodeURIComponent(handle.trim())}`
      );
      const data = await res.json();

      if (data.status !== "OK") {
        setError(data.comment || "User not found");
        return;
      }

      const user = data.result[0];
      setRating(user.rating ?? 800);
      setMaxRating(user.maxRating ?? 800);
    } catch {
      setError("Failed to fetch user data. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProblemsAndGenerate = useCallback(
    async (tag: string) => {
      if (!rating) return;
      setGeneratingContest(true);
      setError("");

      try {
        let problems = allProblemsRef.current;
        if (problems.length === 0) {
          const res = await fetch(`/api/codeforces?method=problemset.problems`);
          const data = await res.json();
          if (data.status !== "OK") {
            setError("Failed to fetch problems");
            return;
          }
          problems = data.result.problems as Problem[];
          allProblemsRef.current = problems;
        }

        const targets = [
          { rating: Math.max(800, rating - 400), label: "A (Warm-up)" },
          { rating: rating, label: "B (On-level)" },
          { rating: rating + 200, label: "C (Stretch)" },
        ];

        const contestProblems: ContestProblem[] = [];
        const usedIds = new Set<string>();

        for (const target of targets) {
          const candidates = problems.filter((p) => {
            const id = `${p.contestId}-${p.index}`;
            if (usedIds.has(id)) return false;
            if (!p.rating) return false;
            if (!p.tags.includes(tag)) return false;
            return Math.abs(p.rating - target.rating) <= 100;
          });

          if (candidates.length === 0) {
            setError(
              `Not enough problems for rating ${target.rating} with tag "${tag}". Try a different tag.`
            );
            return;
          }

          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          const id = `${pick.contestId}-${pick.index}`;
          usedIds.add(id);
          contestProblems.push({
            ...pick,
            targetRating: target.rating,
            label: target.label,
          });
        }

        setContest(contestProblems);
        setTimeLeft(3600);
        setTimerRunning(false);
        setContestFinished(false);
        setSolvedProblems(new Set());
      } catch {
        setError("Failed to generate contest. Try again.");
      } finally {
        setGeneratingContest(false);
      }
    },
    [rating]
  );

  const toggleSolved = (id: string) => {
    setSolvedProblems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetAll = () => {
    setContest(null);
    setSelectedTag(null);
    setTimerRunning(false);
    setContestFinished(false);
    setTimeLeft(3600);
    setSolvedProblems(new Set());
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const timerColor =
    timeLeft <= 300 ? "#ff0000" : timeLeft <= 600 ? "#ff8c00" : "#000";

  const progressPct = ((3600 - timeLeft) / 3600) * 100;

  return (
    <div className="window" style={{ width: "100%" }}>
      <div className="window-title">CF Practice Arena</div>
      <div className="window-content">
        {/* Step 1: Handle input */}
        {rating === null && !contest && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px" }}>
              PRACTICE SMARTER
            </div>
            <div style={{ marginBottom: "20px", color: "#666" }}>
              Enter your Codeforces handle to generate a personalized
              practice contest matched to your rating.
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "center", maxWidth: "400px", margin: "0 auto" }}>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchUser()}
                placeholder="Codeforces handle..."
                style={{ flex: 1 }}
              />
              <button
                onClick={fetchUser}
                disabled={loading || !handle.trim()}
              >
                {loading ? "..." : "GO >>"}
              </button>
            </div>

            {error && (
              <div style={{ color: "#ff0000", marginTop: "10px" }}>{error}</div>
            )}
          </div>
        )}

        {/* Step 2: Tag selection */}
        {rating !== null && !contest && (
          <div>
            {/* User card */}
            <div className="stats-box" style={{ marginBottom: "15px" }}>
              <div className="stats-title">User Profile</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "20px" }}>{handle}</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    <span
                      onClick={resetAll}
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                      change user
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: getRatingColor(rating) }}>
                    {rating}
                  </div>
                  <div style={{ color: getRatingColor(rating), fontSize: "14px" }}>
                    {getRankName(rating)}
                  </div>
                  {maxRating && maxRating > rating && (
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      max: <span style={{ color: getRatingColor(maxRating) }}>{maxRating}</span>
                    </div>
                  )}
                </div>
              </div>
              <div style={{
                borderTop: "1px solid #000",
                marginTop: "8px",
                paddingTop: "8px",
                display: "flex",
                justifyContent: "space-around",
                fontSize: "14px",
                color: "#666",
              }}>
                <span>A: {Math.max(800, rating - 400)}</span>
                <span>B: {rating}</span>
                <span>C: {rating + 200}</span>
              </div>
            </div>

            {/* Tag picker */}
            <div className="stats-box">
              <div className="stats-title">Select Topic</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "5px 0" }}>
                {CF_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTag(tag);
                      fetchProblemsAndGenerate(tag);
                    }}
                    disabled={generatingContest}
                    style={{
                      fontSize: "14px",
                      padding: "4px 10px",
                      backgroundColor: selectedTag === tag ? "#7b68ee" : "#000",
                      border: selectedTag === tag ? "2px solid #7b68ee" : "2px solid #000",
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {generatingContest && (
                <div style={{ marginTop: "10px", color: "#666" }}>
                  Generating contest...
                </div>
              )}
              {error && (
                <div style={{ color: "#ff0000", marginTop: "10px" }}>{error}</div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Contest */}
        {contest && (
          <div>
            {/* Timer section */}
            <div className="stats-box" style={{ marginBottom: "15px" }}>
              <div className="stats-title">
                {selectedTag} - {handle}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <div>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    color: timerColor,
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {formatTime(timeLeft)}
                  </div>
                  {contestFinished && (
                    <div style={{ color: "#ff0000", fontSize: "14px", fontWeight: "bold" }}>
                      TIME&apos;S UP!
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {!contestFinished && (
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      style={{
                        backgroundColor: timerRunning ? "#666" : "#00cc00",
                        borderColor: timerRunning ? "#666" : "#00cc00",
                      }}
                    >
                      {timerRunning ? "PAUSE" : timeLeft === 3600 ? "START" : "RESUME"}
                    </button>
                  )}
                  <button onClick={resetAll}>
                    NEW CONTEST
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: "8px",
                border: "2px solid #000",
                backgroundColor: "#fff",
                marginTop: "4px",
              }}>
                <div style={{
                  height: "100%",
                  backgroundColor: "#7b68ee",
                  width: `${progressPct}%`,
                  transition: "width 1s linear",
                }} />
              </div>
            </div>

            {/* Problems */}
            {contest.map((problem) => {
              const id = `${problem.contestId}-${problem.index}`;
              const solved = solvedProblems.has(id);
              return (
                <div
                  key={id}
                  className="stats-box"
                  style={{
                    marginBottom: "10px",
                    backgroundColor: solved ? "#e8ffe8" : "#fff",
                    borderColor: solved ? "#00cc00" : "#000",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{
                          backgroundColor: "#000",
                          color: "#fff",
                          padding: "2px 8px",
                          fontSize: "14px",
                        }}>
                          {problem.label}
                        </span>
                        <span style={{
                          color: getRatingColor(problem.rating),
                          fontWeight: "bold",
                          fontSize: "14px",
                        }}>
                          {problem.rating}
                        </span>
                      </div>
                      <a
                        href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "18px", fontWeight: "bold" }}
                      >
                        {problem.contestId}{problem.index}. {problem.name}
                      </a>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                        {problem.tags.map((t) => (
                          <span
                            key={t}
                            style={{
                              fontSize: "12px",
                              padding: "1px 6px",
                              border: "1px solid #000",
                              backgroundColor: t === selectedTag ? "#7b68ee" : "#fff",
                              color: t === selectedTag ? "#fff" : "#000",
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSolved(id)}
                      style={{
                        width: "36px",
                        height: "36px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: solved ? "#00cc00" : "#000",
                        borderColor: solved ? "#00cc00" : "#000",
                        fontSize: "20px",
                        flexShrink: 0,
                        marginLeft: "10px",
                      }}
                    >
                      {solved ? "\u2713" : ""}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Score */}
            <div style={{ textAlign: "center", padding: "10px 0", color: "#666", fontSize: "16px" }}>
              {solvedProblems.size} / {contest.length} solved
              {contestFinished && (
                <span> | Final time: {formatTime(3600 - timeLeft)}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
