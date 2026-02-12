import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GameState, PlayerAction } from '@/lib/poker/types';
import { executeAction } from '@/lib/poker/engine';

const MAX_RETRIES = 3;

export async function POST(request: Request) {
  try {
    const { roomCode, playerToken, action } = await request.json() as {
      roomCode: string;
      playerToken: string;
      action: PlayerAction;
    };

    if (!roomCode || !playerToken || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['fold', 'check', 'call', 'raise', 'all-in'].includes(action.type)) {
      return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    if (action.type === 'raise' && (typeof action.amount !== 'number' || action.amount <= 0)) {
      return NextResponse.json({ error: 'Raise requires a positive amount' }, { status: 400 });
    }

    const supabase = createAdminClient();

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const { data: room, error: fetchError } = await supabase
        .from('poker_rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (fetchError || !room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      const state = room.state as unknown as GameState;

      // Authenticate
      const player = state.players.find(p => p?.token === playerToken);
      if (!player) {
        return NextResponse.json({ error: 'Invalid player token' }, { status: 403 });
      }

      // Validate it's this player's turn
      if (state.activePlayerSeat !== player.seatIndex) {
        return NextResponse.json({ error: 'Not your turn' }, { status: 400 });
      }

      if (state.handComplete) {
        return NextResponse.json({ error: 'Hand is complete' }, { status: 400 });
      }

      try {
        const newState = executeAction(state, player.seatIndex, action);

        // Optimistic concurrency lock
        const { data: updated, error: updateError } = await supabase
          .from('poker_rooms')
          .update({
            state: newState as unknown as Record<string, unknown>,
            last_action_at: new Date().toISOString(),
          })
          .eq('id', room.id)
          .eq('updated_at', room.updated_at)
          .select();

        if (updateError) {
          if (attempt < MAX_RETRIES - 1) continue;
          return NextResponse.json({ error: 'Concurrency conflict, try again' }, { status: 409 });
        }

        if (!updated || updated.length === 0) {
          if (attempt < MAX_RETRIES - 1) continue;
          return NextResponse.json({ error: 'Concurrency conflict, try again' }, { status: 409 });
        }

        return NextResponse.json({ success: true });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Invalid action';
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Failed after retries' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
