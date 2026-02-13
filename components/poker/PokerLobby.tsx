'use client';

import { useState, useEffect } from 'react';

interface LiveTable {
  roomCode: string;
  status: string;
  playerCount: number;
  maxPlayers: number;
  blinds: string;
  playerNames: string[];
}

interface PokerLobbyProps {
  onRoomJoined: (roomCode: string, playerToken: string, seatIndex: number) => void;
}

export default function PokerLobby({ onRoomJoined }: PokerLobbyProps) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<LiveTable[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);

  useEffect(() => {
    async function fetchTables() {
      try {
        const res = await fetch('/api/poker/tables');
        if (res.ok) {
          const data = await res.json();
          setTables(data.tables ?? []);
        }
      } catch {
        // silently ignore fetch errors
      } finally {
        setTablesLoading(false);
      }
    }
    fetchTables();
    const interval = setInterval(fetchTables, 10000);
    return () => clearInterval(interval);
  }, []);

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

      <div className="stats-box" style={{ marginBottom: '15px' }}>
        <div className="stats-title">Live Tables</div>
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '8px' }}>
          {tablesLoading ? (
            <p style={{ fontSize: '14px', textAlign: 'center', margin: '8px 0' }}>Loading...</p>
          ) : tables.length === 0 ? (
            <p style={{ fontSize: '14px', textAlign: 'center', margin: '8px 0', opacity: 0.6 }}>No active tables. Create one!</p>
          ) : (
            tables.map(table => (
              <div
                key={table.roomCode}
                onClick={() => setJoinCode(table.roomCode)}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  border: '1px solid rgba(123, 104, 238, 0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(123, 104, 238, 0.15)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <span style={{ fontWeight: 'bold', letterSpacing: '2px' }}>{table.roomCode}</span>
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '12px',
                    color: table.status === 'playing' ? '#44ff44' : '#ffaa44',
                  }}>
                    [{table.status === 'playing' ? 'PLAYING' : 'WAITING'}]
                  </span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '12px', opacity: 0.8 }}>
                  <div>{table.playerCount}/{table.maxPlayers} players &middot; {table.blinds}</div>
                  <div>{table.playerNames.join(', ')}</div>
                </div>
              </div>
            ))
          )}
        </div>
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
