import { Card, GameState, Player, PlayerAction, Phase, Rank, Suit, SidePot } from './types';
import { evaluateBestHand, compareHands, cardToString } from './evaluator';

const SUITS: Suit[] = ['h', 'd', 'c', 's'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function createInitialGameState(): GameState {
  return {
    players: [null, null, null, null, null, null],
    deck: [],
    communityCards: [],
    phase: 'preflop',
    pot: 0,
    sidePots: [],
    currentBet: 0,
    dealerSeat: 0,
    activePlayerSeat: -1,
    smallBlind: 10,
    bigBlind: 20,
    handNumber: 0,
    actionLog: [],
    handComplete: false,
    handCompleteAt: null,
    winners: null,
    showdownHands: null,
    lastActionAt: new Date().toISOString(),
    minRaise: 20,
  };
}

function getActivePlayers(state: GameState): Player[] {
  return state.players.filter((p): p is Player => p !== null && p.status !== 'sitting-out');
}

function getInHandPlayers(state: GameState): Player[] {
  return state.players.filter((p): p is Player => p !== null && (p.status === 'active' || p.status === 'all-in'));
}

function getActiveNotAllInPlayers(state: GameState): Player[] {
  return state.players.filter((p): p is Player => p !== null && p.status === 'active');
}

function nextActiveSeat(state: GameState, fromSeat: number): number {
  for (let i = 1; i <= 6; i++) {
    const seat = (fromSeat + i) % 6;
    const player = state.players[seat];
    if (player && player.status === 'active') {
      return seat;
    }
  }
  return -1;
}

function nextInHandSeat(state: GameState, fromSeat: number): number {
  for (let i = 1; i <= 6; i++) {
    const seat = (fromSeat + i) % 6;
    const player = state.players[seat];
    if (player && (player.status === 'active' || player.status === 'all-in')) {
      return seat;
    }
  }
  return -1;
}

export function dealNewHand(state: GameState): GameState {
  const newState = { ...state };
  newState.deck = createDeck();
  newState.communityCards = [];
  newState.pot = 0;
  newState.sidePots = [];
  newState.currentBet = 0;
  newState.handComplete = false;
  newState.handCompleteAt = null;
  newState.winners = null;
  newState.showdownHands = null;
  newState.actionLog = [];
  newState.handNumber += 1;
  newState.minRaise = newState.bigBlind;

  // Reset players
  for (let i = 0; i < 6; i++) {
    const p = newState.players[i];
    if (p) {
      if (p.chips <= 0) {
        p.status = 'sitting-out';
      } else {
        p.status = 'active';
      }
      p.holeCards = [];
      p.currentBet = 0;
      p.lastAction = null;
      p.hasActed = false;
    }
  }

  const activePlayers = getActivePlayers(newState);
  if (activePlayers.length < 2) return newState;

  // Move dealer
  newState.dealerSeat = nextActiveSeat(newState, newState.dealerSeat);

  const isHeadsUp = activePlayers.length === 2;

  // Post blinds
  let sbSeat: number;
  let bbSeat: number;

  if (isHeadsUp) {
    // Heads-up: dealer posts small blind
    sbSeat = newState.dealerSeat;
    bbSeat = nextActiveSeat(newState, sbSeat);
  } else {
    sbSeat = nextActiveSeat(newState, newState.dealerSeat);
    bbSeat = nextActiveSeat(newState, sbSeat);
  }

  const sbPlayer = newState.players[sbSeat]!;
  const bbPlayer = newState.players[bbSeat]!;

  const sbAmount = Math.min(newState.smallBlind, sbPlayer.chips);
  sbPlayer.chips -= sbAmount;
  sbPlayer.currentBet = sbAmount;
  newState.pot += sbAmount;
  if (sbPlayer.chips === 0) sbPlayer.status = 'all-in';

  const bbAmount = Math.min(newState.bigBlind, bbPlayer.chips);
  bbPlayer.chips -= bbAmount;
  bbPlayer.currentBet = bbAmount;
  newState.pot += bbAmount;
  newState.currentBet = bbAmount;
  if (bbPlayer.chips === 0) bbPlayer.status = 'all-in';

  newState.actionLog.push(`${sbPlayer.name} posts small blind (${sbAmount})`);
  newState.actionLog.push(`${bbPlayer.name} posts big blind (${bbAmount})`);

  // Deal hole cards (2 per active player, starting left of dealer)
  let dealSeat = nextActiveSeat(newState, newState.dealerSeat);
  const startSeat = dealSeat;
  for (let round = 0; round < 2; round++) {
    dealSeat = startSeat;
    do {
      const player = newState.players[dealSeat];
      if (player && (player.status === 'active' || player.status === 'all-in')) {
        player.holeCards.push(newState.deck.pop()!);
      }
      dealSeat = nextInHandSeat(newState, dealSeat);
    } while (dealSeat !== startSeat);
  }

  // Set first to act (left of BB preflop)
  newState.activePlayerSeat = nextActiveSeat(newState, bbSeat);
  // If only the BB is active (all others all-in), handle it
  if (getActiveNotAllInPlayers(newState).length <= 1) {
    advanceToShowdownIfNeeded(newState);
  }

  newState.lastActionAt = new Date().toISOString();
  newState.phase = 'preflop';

  return newState;
}

function advanceToShowdownIfNeeded(state: GameState): boolean {
  const inHand = getInHandPlayers(state);
  const activeNotAllIn = getActiveNotAllInPlayers(state);

  // If one or fewer players who can still act, run out remaining cards
  if (inHand.length > 1 && activeNotAllIn.length <= 1) {
    // Check if the one remaining active player has matched the bet or if betting is settled
    if (activeNotAllIn.length === 1) {
      const player = activeNotAllIn[0];
      if (player.currentBet < state.currentBet && player.chips > 0) {
        // Player still needs to act
        state.activePlayerSeat = player.seatIndex;
        return false;
      }
    }
    // Run out remaining community cards
    while (state.communityCards.length < 5) {
      state.deck.pop(); // burn
      state.communityCards.push(state.deck.pop()!);
    }
    resolveShowdown(state);
    return true;
  }

  return false;
}

export function executeAction(state: GameState, seatIndex: number, action: PlayerAction): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;
  const player = newState.players[seatIndex];

  if (!player || newState.activePlayerSeat !== seatIndex) {
    throw new Error('Not your turn');
  }

  if (newState.handComplete) {
    throw new Error('Hand is complete');
  }

  switch (action.type) {
    case 'fold': {
      player.status = 'folded';
      player.lastAction = 'fold';
      newState.actionLog.push(`${player.name} folds`);
      break;
    }
    case 'check': {
      if (player.currentBet < newState.currentBet) {
        throw new Error('Cannot check - must call or raise');
      }
      player.lastAction = 'check';
      player.hasActed = true;
      newState.actionLog.push(`${player.name} checks`);
      break;
    }
    case 'call': {
      const callAmount = Math.min(newState.currentBet - player.currentBet, player.chips);
      if (callAmount <= 0) {
        throw new Error('Nothing to call');
      }
      player.chips -= callAmount;
      player.currentBet += callAmount;
      newState.pot += callAmount;
      player.lastAction = 'call';
      player.hasActed = true;
      if (player.chips === 0) player.status = 'all-in';
      newState.actionLog.push(`${player.name} calls ${callAmount}`);
      break;
    }
    case 'raise': {
      const raiseTotal = action.amount!;
      if (raiseTotal < newState.currentBet + newState.minRaise && raiseTotal < player.chips + player.currentBet) {
        throw new Error(`Minimum raise is ${newState.currentBet + newState.minRaise}`);
      }
      const raiseAmount = Math.min(raiseTotal - player.currentBet, player.chips);
      const actualNewBet = player.currentBet + raiseAmount;
      const raiseBy = actualNewBet - newState.currentBet;
      if (raiseBy > newState.minRaise) {
        newState.minRaise = raiseBy;
      }
      player.chips -= raiseAmount;
      player.currentBet = actualNewBet;
      newState.pot += raiseAmount;
      newState.currentBet = actualNewBet;
      player.lastAction = `raise ${actualNewBet}`;
      player.hasActed = true;
      if (player.chips === 0) player.status = 'all-in';
      // Reset hasActed for other active players since there was a raise
      for (const p of newState.players) {
        if (p && p.seatIndex !== seatIndex && p.status === 'active') {
          p.hasActed = false;
        }
      }
      newState.actionLog.push(`${player.name} raises to ${actualNewBet}`);
      break;
    }
    case 'all-in': {
      const allInAmount = player.chips;
      const newBet = player.currentBet + allInAmount;
      if (newBet > newState.currentBet) {
        const raiseBy = newBet - newState.currentBet;
        if (raiseBy >= newState.minRaise) {
          newState.minRaise = raiseBy;
        }
        newState.currentBet = newBet;
        // Reset hasActed for other active players
        for (const p of newState.players) {
          if (p && p.seatIndex !== seatIndex && p.status === 'active') {
            p.hasActed = false;
          }
        }
      }
      player.chips = 0;
      player.currentBet = newBet;
      newState.pot += allInAmount;
      player.status = 'all-in';
      player.lastAction = `all-in ${newBet}`;
      player.hasActed = true;
      newState.actionLog.push(`${player.name} goes all-in for ${allInAmount}`);
      break;
    }
  }

  newState.lastActionAt = new Date().toISOString();

  // Check if only one player remains in hand
  const inHand = getInHandPlayers(newState);
  if (inHand.length === 1) {
    const winner = inHand[0];
    winner.chips += newState.pot;
    newState.winners = [{ seatIndex: winner.seatIndex, amount: newState.pot, handName: 'Last player standing' }];
    newState.pot = 0;
    newState.handComplete = true;
    newState.handCompleteAt = new Date().toISOString();
    newState.activePlayerSeat = -1;
    newState.actionLog.push(`${winner.name} wins ${newState.winners[0].amount}`);
    return newState;
  }

  // Try to advance to next player or next phase
  advanceAction(newState);

  return newState;
}

function advanceAction(state: GameState): void {
  // Find next active player who hasn't acted
  const activeNotAllIn = getActiveNotAllInPlayers(state);

  if (activeNotAllIn.length === 0) {
    // No one can act, advance to showdown
    advanceToShowdownIfNeeded(state);
    return;
  }

  // Check if betting round is complete
  const allActed = activeNotAllIn.every(p => p.hasActed && p.currentBet === state.currentBet);

  if (allActed) {
    advancePhase(state);
  } else {
    // Find next player who needs to act
    let nextSeat = nextActiveSeat(state, state.activePlayerSeat);
    // Find someone who hasn't acted or hasn't matched the bet
    let checked = 0;
    while (checked < 6) {
      const p = state.players[nextSeat];
      if (p && p.status === 'active' && (!p.hasActed || p.currentBet < state.currentBet)) {
        state.activePlayerSeat = nextSeat;
        return;
      }
      nextSeat = nextActiveSeat(state, nextSeat);
      checked++;
    }
    // Everyone has acted
    advancePhase(state);
  }
}

function advancePhase(state: GameState): void {
  // Build side pots before resetting bets
  buildSidePots(state);

  // Reset bets for new phase
  for (const p of state.players) {
    if (p) {
      p.currentBet = 0;
      p.hasActed = false;
      p.lastAction = null;
    }
  }
  state.currentBet = 0;
  state.minRaise = state.bigBlind;

  const phases: Phase[] = ['preflop', 'flop', 'turn', 'river', 'showdown'];
  const currentIndex = phases.indexOf(state.phase);

  if (currentIndex >= 3) {
    // After river, go to showdown
    resolveShowdown(state);
    return;
  }

  state.phase = phases[currentIndex + 1] as Phase;

  // Deal community cards
  switch (state.phase) {
    case 'flop':
      state.deck.pop(); // burn
      state.communityCards.push(state.deck.pop()!);
      state.communityCards.push(state.deck.pop()!);
      state.communityCards.push(state.deck.pop()!);
      break;
    case 'turn':
      state.deck.pop(); // burn
      state.communityCards.push(state.deck.pop()!);
      break;
    case 'river':
      state.deck.pop(); // burn
      state.communityCards.push(state.deck.pop()!);
      break;
  }

  // Check if we need to go straight to showdown
  if (advanceToShowdownIfNeeded(state)) return;

  // First active player after dealer
  state.activePlayerSeat = nextActiveSeat(state, state.dealerSeat);
  state.lastActionAt = new Date().toISOString();
}

function buildSidePots(state: GameState): void {
  const inHand = getInHandPlayers(state);
  if (inHand.length <= 1) return;

  const allInPlayers = inHand.filter(p => p.status === 'all-in' && p.currentBet > 0);
  if (allInPlayers.length === 0) return;

  // Get unique bet levels from all-in players
  const betLevels = Array.from(new Set(allInPlayers.map(p => p.currentBet))).sort((a, b) => a - b);

  // Only build side pots if there are different bet levels
  const maxBet = Math.max(...inHand.map(p => p.currentBet));
  if (betLevels.length === 0 || (betLevels.length === 1 && betLevels[0] === maxBet)) return;

  // We'll rebuild the pot from scratch using side pot logic
  let prevLevel = 0;
  const pots: SidePot[] = [];
  const allBetLevels = Array.from(new Set(betLevels.concat(maxBet))).sort((a, b) => a - b);

  for (const level of allBetLevels) {
    const contribution = level - prevLevel;
    if (contribution <= 0) continue;

    const eligible = inHand
      .filter(p => p.currentBet >= level)
      .map(p => p.seatIndex);

    const amount = inHand.reduce((sum, p) => {
      const playerContrib = Math.min(p.currentBet, level) - Math.min(p.currentBet, prevLevel);
      return sum + Math.max(0, playerContrib);
    }, 0);

    if (amount > 0) {
      pots.push({ amount, eligible });
    }
    prevLevel = level;
  }

  if (pots.length > 1) {
    // Calculate the total in side pots
    const sidePotTotal = pots.reduce((sum, p) => sum + p.amount, 0);
    // Any remaining pot amount from previous phases
    const previousPot = state.pot - inHand.reduce((sum, p) => sum + p.currentBet, 0);
    if (previousPot > 0) {
      // Add previous pot amount to the first (main) side pot
      pots[0].amount += previousPot;
    }
    state.sidePots = pots;
    state.pot = pots.reduce((sum, p) => sum + p.amount, 0);
  }
}

function resolveShowdown(state: GameState): void {
  state.phase = 'showdown';
  state.handComplete = true;
  state.handCompleteAt = new Date().toISOString();
  state.activePlayerSeat = -1;

  const inHand = getInHandPlayers(state);

  // Evaluate hands
  const handResults = inHand.map(p => {
    const result = evaluateBestHand(p.holeCards, state.communityCards);
    return { player: p, result };
  });

  state.showdownHands = handResults.map(hr => ({
    seatIndex: hr.player.seatIndex,
    cards: hr.player.holeCards,
    handName: hr.result.name,
    bestCards: hr.result.bestCards,
  }));

  const winners: { seatIndex: number; amount: number; handName: string }[] = [];

  if (state.sidePots.length > 0) {
    // Distribute each side pot
    for (const pot of state.sidePots) {
      const eligibleResults = handResults.filter(hr => pot.eligible.includes(hr.player.seatIndex));
      if (eligibleResults.length === 0) continue;

      eligibleResults.sort((a, b) => compareHands(b.result, a.result));
      const best = eligibleResults[0].result;
      const potWinners = eligibleResults.filter(hr => compareHands(hr.result, best) === 0);

      const share = Math.floor(pot.amount / potWinners.length);
      const remainder = pot.amount - share * potWinners.length;

      for (let i = 0; i < potWinners.length; i++) {
        const winAmount = share + (i === 0 ? remainder : 0);
        potWinners[i].player.chips += winAmount;
        const existing = winners.find(w => w.seatIndex === potWinners[i].player.seatIndex);
        if (existing) {
          existing.amount += winAmount;
        } else {
          winners.push({
            seatIndex: potWinners[i].player.seatIndex,
            amount: winAmount,
            handName: potWinners[i].result.name,
          });
        }
      }
    }
  } else {
    // Single pot
    handResults.sort((a, b) => compareHands(b.result, a.result));
    const best = handResults[0].result;
    const potWinners = handResults.filter(hr => compareHands(hr.result, best) === 0);

    const share = Math.floor(state.pot / potWinners.length);
    const remainder = state.pot - share * potWinners.length;

    for (let i = 0; i < potWinners.length; i++) {
      const winAmount = share + (i === 0 ? remainder : 0);
      potWinners[i].player.chips += winAmount;
      winners.push({
        seatIndex: potWinners[i].player.seatIndex,
        amount: winAmount,
        handName: potWinners[i].result.name,
      });
    }
  }

  state.winners = winners;
  state.pot = 0;
  state.sidePots = [];

  for (const w of winners) {
    const player = state.players[w.seatIndex]!;
    const cards = state.showdownHands?.find(h => h.seatIndex === w.seatIndex);
    const handStr = cards ? ` with ${cards.handName}` : '';
    state.actionLog.push(`${player.name} wins ${w.amount}${handStr}`);
  }
}

export function getAvailableActions(state: GameState, seatIndex: number): { actions: string[]; callAmount: number } {
  const player = state.players[seatIndex];
  if (!player || state.activePlayerSeat !== seatIndex || state.handComplete) {
    return { actions: [], callAmount: 0 };
  }

  const actions: string[] = [];
  const callAmount = state.currentBet - player.currentBet;

  actions.push('fold');

  if (callAmount === 0) {
    actions.push('check');
  } else if (callAmount > 0 && player.chips > 0) {
    actions.push('call');
  }

  // Can raise if has enough chips
  if (player.chips > callAmount) {
    actions.push('raise');
  }

  // All-in is always available if player has chips
  if (player.chips > 0) {
    actions.push('all-in');
  }

  return { actions, callAmount: Math.min(callAmount, player.chips) };
}
