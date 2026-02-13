import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { GameState } from '@/lib/poker/types';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data: rooms, error } = await supabase
      .from('poker_rooms')
      .select('code, status, state, last_action_at, created_at')
      .gte('last_action_at', fiveMinutesAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch tables:', error);
      return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
    }

    const tables = (rooms ?? []).map(room => {
      const state = room.state as unknown as GameState;
      const activePlayers = state.players.filter(p => p !== null);

      return {
        roomCode: room.code,
        status: room.status as string,
        playerCount: activePlayers.length,
        maxPlayers: state.players.length,
        blinds: `${state.smallBlind}/${state.bigBlind}`,
        playerNames: activePlayers.map(p => p.name),
      };
    });

    return NextResponse.json({ tables });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
