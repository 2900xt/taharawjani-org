"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Terminal() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to TAHA-OS Terminal v1.0" },
    { role: "assistant", content: "Go get a job or smth, what are you doin here fam?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/terminal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error || "Something went wrong"}`,
          },
        ]);
        return;
      }

      if (data.authenticated !== undefined) {
        setIsAuthenticated(data.authenticated);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: Failed to connect to server`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal-output">
        {messages.map((msg, i) => (
          <div key={i} className={`terminal-line ${msg.role}`}>
            <span className="terminal-prompt">
              {msg.role === "user" ? "you@taha-os:~$" : "system:"}
            </span>
            <span className="terminal-text">{msg.content}</span>
          </div>
        ))}
        {isLoading && (
          <div className="terminal-line assistant">
            <span className="terminal-prompt">system:</span>
            <span className="terminal-text">Processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="terminal-input-form">
        <span className="terminal-input-prompt">you@taha-os:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="terminal-input"
          placeholder={
            isAuthenticated
              ? "Chat with Claude..."
              : "Stop wasting my time"
          }
          autoFocus
          disabled={isLoading}
        />
      </form>
    </div>
  );
}