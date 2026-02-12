import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GameState } from '@/lib/poker/types';
import { sanitizeGameState } from '@/lib/poker/sanitize';

export async function POST(request: Request) {
  try {
    const { roomCode, playerToken } = await request.json();

    if (!roomCode || !playerToken) {
      return NextResponse.json({ error: 'Missing roomCode or playerToken' }, { status: 400 });
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

    const player = state.players.find(p => p?.token === playerToken);
    if (!player) {
      return NextResponse.json({ error: 'Invalid player token' }, { status: 403 });
    }

    const clientState = sanitizeGameState(state, playerToken);

    return NextResponse.json({
      gameState: clientState,
      roomStatus: room.status,
      lastActionAt: room.last_action_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
