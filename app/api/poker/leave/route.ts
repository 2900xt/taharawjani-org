import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GameState } from '@/lib/poker/types';
import { executeAction } from '@/lib/poker/engine';

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

    let state = room.state as unknown as GameState;

    const player = state.players.find(p => p?.token === playerToken);
    if (!player) {
      return NextResponse.json({ error: 'Invalid player token' }, { status: 403 });
    }

    const seatIndex = player.seatIndex;

    // If mid-hand and it's their turn, auto-fold
    if (!state.handComplete && state.activePlayerSeat === seatIndex && player.status === 'active') {
      state = executeAction(state, seatIndex, { type: 'fold' });
    }

    // Remove player
    state.players[seatIndex] = null;
    state.actionLog.push(`${player.name} left the table`);

    // Check if fewer than 2 players remain
    const remaining = state.players.filter(p => p !== null);
    const newStatus = remaining.length < 2 ? 'waiting' : room.status;

    const { error: updateError } = await supabase
      .from('poker_rooms')
      .update({
        state: state as unknown as Record<string, unknown>,
        status: newStatus,
        last_action_at: new Date().toISOString(),
      })
      .eq('id', room.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
