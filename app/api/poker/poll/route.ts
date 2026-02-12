import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GameState } from '@/lib/poker/types';
import { sanitizeGameState } from '@/lib/poker/sanitize';
import { dealNewHand, executeAction } from '@/lib/poker/engine';

const TURN_TIMEOUT = 30000; // 30 seconds
const HAND_COMPLETE_DELAY = 5000; // 5 seconds

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

    let state = room.state as unknown as GameState;

    // Authenticate player
    const player = state.players.find(p => p?.token === playerToken);
    if (!player) {
      return NextResponse.json({ error: 'Invalid player token' }, { status: 403 });
    }

    // Update player's lastPollAt
    player.lastPollAt = new Date().toISOString();

    let stateChanged = false;

    // Auto-fold on turn timeout (30s)
    if (
      state.activePlayerSeat >= 0 &&
      !state.handComplete &&
      state.lastActionAt
    ) {
      const elapsed = Date.now() - new Date(state.lastActionAt).getTime();
      if (elapsed > TURN_TIMEOUT) {
        const activePlayer = state.players[state.activePlayerSeat];
        if (activePlayer && activePlayer.status === 'active') {
          state = executeAction(state, state.activePlayerSeat, { type: 'fold' });
          state.actionLog.push(`(auto-fold: timeout)`);
          stateChanged = true;
        }
      }
    }

    // Auto-deal next hand after hand-complete delay
    if (
      state.handComplete &&
      state.handCompleteAt &&
      room.status === 'playing'
    ) {
      const elapsed = Date.now() - new Date(state.handCompleteAt).getTime();
      if (elapsed > HAND_COMPLETE_DELAY) {
        // Check we still have 2+ active players with chips
        const playersWithChips = state.players.filter(p => p && p.chips > 0 && p.status !== 'sitting-out');
        if (playersWithChips.length >= 2) {
          state = dealNewHand(state);
          stateChanged = true;
        }
      }
    }

    if (stateChanged) {
      await supabase
        .from('poker_rooms')
        .update({
          state: state as unknown as Record<string, unknown>,
          last_action_at: new Date().toISOString(),
        })
        .eq('id', room.id);
    } else {
      // Just update the player's lastPollAt
      await supabase
        .from('poker_rooms')
        .update({
          state: state as unknown as Record<string, unknown>,
        })
        .eq('id', room.id);
    }

    const clientState = sanitizeGameState(state, playerToken);

    return NextResponse.json({
      gameState: clientState,
      roomStatus: room.status,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
