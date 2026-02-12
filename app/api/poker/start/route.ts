import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GameState } from '@/lib/poker/types';
import { dealNewHand } from '@/lib/poker/engine';

export async function POST(request: Request) {
  try {
    const { roomCode, playerToken } = await request.json();

    if (!roomCode || !playerToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

    // Verify requester is seat 0 (creator)
    const player = state.players[0];
    if (!player || player.token !== playerToken) {
      return NextResponse.json({ error: 'Only the room creator can start the game' }, { status: 403 });
    }

    // Verify 2+ players
    const activePlayers = state.players.filter(p => p !== null);
    if (activePlayers.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 players to start' }, { status: 400 });
    }

    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    const newState = dealNewHand(state);

    const { error: updateError } = await supabase
      .from('poker_rooms')
      .update({
        state: newState as unknown as Record<string, unknown>,
        status: 'playing',
        last_action_at: new Date().toISOString(),
      })
      .eq('id', room.id)
      .eq('updated_at', room.updated_at);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
