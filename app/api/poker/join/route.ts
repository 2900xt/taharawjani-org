import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GameState } from '@/lib/poker/types';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { roomCode, name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 20) {
      return NextResponse.json({ error: 'Name must be 1-20 characters' }, { status: 400 });
    }

    if (!roomCode || typeof roomCode !== 'string') {
      return NextResponse.json({ error: 'Room code is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: room, error: fetchError } = await supabase
      .from('poker_rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single();

    if (fetchError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const state = room.state as unknown as GameState;

    // Find first empty seat
    const emptySeat = state.players.findIndex(p => p === null);
    if (emptySeat === -1) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    // Check for duplicate names
    const nameExists = state.players.some(p => p && p.name.toLowerCase() === name.trim().toLowerCase());
    if (nameExists) {
      return NextResponse.json({ error: 'Name already taken in this room' }, { status: 400 });
    }

    const playerToken = randomUUID();

    state.players[emptySeat] = {
      name: name.trim(),
      seatIndex: emptySeat,
      token: playerToken,
      chips: 1000,
      holeCards: [],
      status: 'active',
      currentBet: 0,
      lastAction: null,
      lastPollAt: new Date().toISOString(),
      hasActed: false,
    };

    const { error: updateError } = await supabase
      .from('poker_rooms')
      .update({
        state: state as unknown as Record<string, unknown>,
        updated_at: room.updated_at,
        last_action_at: new Date().toISOString(),
      })
      .eq('id', room.id)
      .eq('updated_at', room.updated_at);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to join room, try again' }, { status: 500 });
    }

    return NextResponse.json({
      playerToken,
      seatIndex: emptySeat,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
