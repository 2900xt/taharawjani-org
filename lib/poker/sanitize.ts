import { GameState, ClientGameState, ClientPlayer, ActionType } from './types';
import { getAvailableActions } from './engine';

const DISCONNECT_THRESHOLD = 15000; // 15 seconds

export function sanitizeGameState(state: GameState, playerToken: string): ClientGameState {
  const requestingPlayer = state.players.find(p => p?.token === playerToken);
  const mySeat = requestingPlayer?.seatIndex ?? -1;
  const isShowdown = state.phase === 'showdown' || state.handComplete;

  const players: (ClientPlayer | null)[] = state.players.map(p => {
    if (!p) return null;

    const isMe = p.token === playerToken;
    const showCards = isMe || (isShowdown && (p.status === 'active' || p.status === 'all-in'));

    const isConnected = p.lastPollAt
      ? Date.now() - new Date(p.lastPollAt).getTime() < DISCONNECT_THRESHOLD
      : true;

    return {
      name: p.name,
      seatIndex: p.seatIndex,
      chips: p.chips,
      holeCards: showCards ? p.holeCards : (p.holeCards.length > 0 ? null : null),
      status: p.status,
      currentBet: p.currentBet,
      lastAction: p.lastAction,
      isConnected,
    };
  });

  // Determine available actions
  const { actions, callAmount } = mySeat >= 0
    ? getAvailableActions(state, mySeat)
    : { actions: [], callAmount: 0 };

  return {
    players,
    communityCards: state.communityCards,
    phase: state.phase,
    pot: state.pot,
    sidePots: state.sidePots,
    currentBet: state.currentBet,
    dealerSeat: state.dealerSeat,
    activePlayerSeat: state.activePlayerSeat,
    smallBlind: state.smallBlind,
    bigBlind: state.bigBlind,
    handNumber: state.handNumber,
    actionLog: state.actionLog.slice(-20),
    handComplete: state.handComplete,
    winners: state.winners,
    showdownHands: isShowdown ? state.showdownHands : null,
    mySeat,
    myTurn: state.activePlayerSeat === mySeat && !state.handComplete,
    availableActions: actions as ActionType[],
    minRaise: state.minRaise,
    callAmount,
  };
}
