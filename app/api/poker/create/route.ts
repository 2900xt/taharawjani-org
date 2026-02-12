import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createInitialGameState } from '@/lib/poker/engine';
import { GameState } from '@/lib/poker/types';
import { randomUUID } from 'crypto';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 20) {
      return NextResponse.json({ error: 'Name must be 1-20 characters' }, { status: 400 });
    }

    const playerToken = randomUUID();
    const roomCode = generateRoomCode();
    const state = createInitialGameState();

    const player = {
      name: name.trim(),
      seatIndex: 0,
      token: playerToken,
      chips: 1000,
      holeCards: [],
      status: 'active' as const,
      currentBet: 0,
      lastAction: null,
      lastPollAt: new Date().toISOString(),
      hasActed: false,
    };

    state.players[0] = player;

    const supabase = createAdminClient();
    const { error } = await supabase.from('poker_rooms').insert({
      code: roomCode,
      state: state as unknown as Record<string, unknown>,
      status: 'waiting',
    });

    if (error) {
      console.error('Failed to create room:', error);
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }

    return NextResponse.json({
      roomCode,
      playerToken,
      seatIndex: 0,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
