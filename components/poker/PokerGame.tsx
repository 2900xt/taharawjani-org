'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ClientGameState, ActionType } from '@/lib/poker/types';
import PokerLobby from './PokerLobby';
import PokerTable from './PokerTable';

const POLL_INTERVAL = 2000;

export default function PokerGame() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [roomStatus, setRoomStatus] = useState('waiting');
  const [error, setError] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    if (!roomCode || !playerToken) return;
    try {
      const res = await fetch('/api/poker/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403 || res.status === 404) {
          // Kicked or room gone
          handleLeaveState();
          setError(data.error || 'Disconnected from room');
        }
        return;
      }
      const data = await res.json();
      setGameState(data.gameState);
      setRoomStatus(data.roomStatus);
    } catch {
      // Network error - keep polling
    }
  }, [roomCode, playerToken]);

  useEffect(() => {
    if (roomCode && playerToken) {
      poll(); // immediate first poll
      pollingRef.current = setInterval(poll, POLL_INTERVAL);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [roomCode, playerToken, poll]);

  function handleRoomJoined(code: string, token: string, _seat: number) {
    setRoomCode(code);
    setPlayerToken(token);
    setError('');
  }

  function handleLeaveState() {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setRoomCode(null);
    setPlayerToken(null);
    setGameState(null);
    setRoomStatus('waiting');
  }

  async function handleAction(actionType: ActionType, amount?: number) {
    if (!roomCode || !playerToken) return;
    try {
      const res = await fetch('/api/poker/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerToken,
          action: { type: actionType, amount },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Action failed');
        setTimeout(() => setError(''), 3000);
      }
      // Poll immediately after action
      poll();
    } catch {
      setError('Network error');
      setTimeout(() => setError(''), 3000);
    }
  }

  async function handleStart() {
    if (!roomCode || !playerToken) return;
    try {
      const res = await fetch('/api/poker/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to start');
        setTimeout(() => setError(''), 3000);
      }
      poll();
    } catch {
      setError('Network error');
      setTimeout(() => setError(''), 3000);
    }
  }

  async function handleLeave() {
    if (roomCode && playerToken) {
      try {
        await fetch('/api/poker/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomCode, playerToken }),
        });
      } catch {
        // ignore
      }
    }
    handleLeaveState();
  }

  if (!roomCode || !playerToken) {
    return (
      <div>
        <PokerLobby onRoomJoined={handleRoomJoined} />
        {error && (
          <div style={{ color: '#ff4444', textAlign: 'center', padding: '8px', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  if (!gameState) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Connecting to room {roomCode}...</p>
      </div>
    );
  }

  return (
    <div>
      <PokerTable
        gameState={gameState}
        roomCode={roomCode}
        roomStatus={roomStatus}
        playerToken={playerToken}
        onAction={handleAction}
        onStart={handleStart}
        onLeave={handleLeave}
      />
      {error && (
        <div style={{ color: '#ff4444', textAlign: 'center', padding: '8px', fontSize: '14px' }}>
          {error}
        </div>
      )}
    </div>
  );
}
