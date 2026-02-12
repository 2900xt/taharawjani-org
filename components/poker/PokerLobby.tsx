'use client';

import { useState } from 'react';

interface PokerLobbyProps {
  onRoomJoined: (roomCode: string, playerToken: string, seatIndex: number) => void;
}

export default function PokerLobby({ onRoomJoined }: PokerLobbyProps) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/poker/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create room');
        return;
      }
      onRoomJoined(data.roomCode, data.playerToken, data.seatIndex);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    if (!joinCode.trim()) {
      setError('Enter a room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/poker/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), roomCode: joinCode.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to join room');
        return;
      }
      onRoomJoined(joinCode.trim().toUpperCase(), data.playerToken, data.seatIndex);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div className="stats-box" style={{ marginBottom: '15px' }}>
        <div className="stats-title">Your Name</div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your name..."
          maxLength={20}
          style={{ marginTop: '8px' }}
        />
      </div>

      <div className="stats-box" style={{ marginBottom: '15px' }}>
        <div className="stats-title">Create Room</div>
        <p style={{ fontSize: '14px', margin: '8px 0' }}>Start a new poker table. Share the room code with friends.</p>
        <button onClick={handleCreate} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </div>

      <div className="stats-box" style={{ marginBottom: '15px' }}>
        <div className="stats-title">Join Room</div>
        <input
          type="text"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Enter room code..."
          maxLength={6}
          style={{ marginTop: '8px', textTransform: 'uppercase', letterSpacing: '3px', textAlign: 'center', fontSize: '20px' }}
        />
        <button onClick={handleJoin} disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
          {loading ? 'Joining...' : 'Join Room'}
        </button>
      </div>

      {error && (
        <div style={{
          color: '#ff4444',
          border: '2px solid #ff4444',
          padding: '8px',
          textAlign: 'center',
          fontSize: '16px',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
