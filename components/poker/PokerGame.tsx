'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ClientGameState, ActionType } from '@/lib/poker/types';
import { createClient } from '@/lib/supabase/client';
import PokerLobby from './PokerLobby';
import PokerTable from './PokerTable';

const HEARTBEAT_INTERVAL = 15000; // 15s heartbeat for auto-fold/auto-deal

export default function PokerGame() {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerToken, setPlayerToken] = useState<string | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [roomStatus, setRoomStatus] = useState('waiting');
  const [error, setError] = useState('');
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const lastActionAtRef = useRef<string | null>(null);

  // Read-only state fetch (no DB writes, no timer side effects)
  const fetchState = useCallback(async () => {
    if (!roomCode || !playerToken) return;
    try {
      const res = await fetch('/api/poker/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, playerToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403 || res.status === 404) {
          handleLeaveState();
          setError(data.error || 'Disconnected from room');
        }
        return;
      }
      const data = await res.json();
      setGameState(data.gameState);
      setRoomStatus(data.roomStatus);
      lastActionAtRef.current = data.lastActionAt;
    } catch {
      // Network error - will retry on next event
    }
  }, [roomCode, playerToken]);

  // Heartbeat: handles auto-fold/auto-deal timers + connection tracking
  const heartbeat = useCallback(async () => {
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
          handleLeaveState();
          setError(data.error || 'Disconnected from room');
        }
        return;
      }
      const data = await res.json();
      setGameState(data.gameState);
      setRoomStatus(data.roomStatus);
    } catch {
      // Network error
    }
  }, [roomCode, playerToken]);

  // Set up Realtime subscription + heartbeat when in a room
  useEffect(() => {
    if (!roomCode || !playerToken) return;

    // Fetch state immediately
    fetchState();

    // Start 15s heartbeat for auto-fold/auto-deal
    heartbeatRef.current = setInterval(heartbeat, HEARTBEAT_INTERVAL);

    // Subscribe to Realtime Postgres Changes
    const supabase = createClient();
    supabaseRef.current = supabase;

    const channel = supabase
      .channel(`poker-room:${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'poker_rooms',
          filter: `code=eq.${roomCode.toUpperCase()}`,
        },
        (payload) => {
          // Only fetch state if last_action_at changed (meaningful update)
          const newActionAt = (payload.new as Record<string, unknown>).last_action_at as string | null;
          if (newActionAt && newActionAt !== lastActionAtRef.current) {
            lastActionAtRef.current = newActionAt;
            fetchState();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current);
      }
    };
  }, [roomCode, playerToken, fetchState, heartbeat]);

  function handleRoomJoined(code: string, token: string, _seat: number) {
    setRoomCode(code);
    setPlayerToken(token);
    setError('');
  }

  function handleLeaveState() {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (channelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(channelRef.current);
    }
    setRoomCode(null);
    setPlayerToken(null);
    setGameState(null);
    setRoomStatus('waiting');
    lastActionAtRef.current = null;
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
      // Fetch state immediately after action
      fetchState();
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
      fetchState();
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
