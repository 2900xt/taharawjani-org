"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Terminal() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to TAHA-OS Terminal v1.0" },
    { role: "assistant", content: "Type a message and press Enter..." },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
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
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="terminal-input-form">
        <span className="terminal-input-prompt">you@taha-os:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="terminal-input"
          placeholder="Enter message..."
          autoFocus
        />
      </form>
    </div>
  );
}