import { Card, Rank, Suit } from './types';

const RANK_ORDER: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

function rankValue(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

const HAND_RANKS = {
  ROYAL_FLUSH: 9,
  STRAIGHT_FLUSH: 8,
  FOUR_OF_A_KIND: 7,
  FULL_HOUSE: 6,
  FLUSH: 5,
  STRAIGHT: 4,
  THREE_OF_A_KIND: 3,
  TWO_PAIR: 2,
  ONE_PAIR: 1,
  HIGH_CARD: 0,
} as const;

const HAND_NAMES: Record<number, string> = {
  9: 'Royal Flush',
  8: 'Straight Flush',
  7: 'Four of a Kind',
  6: 'Full House',
  5: 'Flush',
  4: 'Straight',
  3: 'Three of a Kind',
  2: 'Two Pair',
  1: 'Pair',
  0: 'High Card',
};

export interface HandResult {
  rank: number;
  tiebreakers: number[];
  name: string;
  bestCards: Card[];
}

function evaluateFiveCards(cards: Card[]): HandResult {
  const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
  const ranks = sorted.map(c => rankValue(c.rank));
  const suits = sorted.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);

  // Check for straight
  let isStraight = false;
  let straightHigh = ranks[0];

  // Normal straight check
  if (ranks[0] - ranks[4] === 4 && new Set(ranks).size === 5) {
    isStraight = true;
    straightHigh = ranks[0];
  }

  // Wheel (A-2-3-4-5)
  if (ranks[0] === 12 && ranks[1] === 3 && ranks[2] === 2 && ranks[3] === 1 && ranks[4] === 0) {
    isStraight = true;
    straightHigh = 3; // 5-high straight
  }

  // Count rank occurrences
  const counts: Map<number, number> = new Map();
  for (const r of ranks) {
    counts.set(r, (counts.get(r) || 0) + 1);
  }

  const groups = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || b[0] - a[0]);

  // Royal flush
  if (isFlush && isStraight && straightHigh === 12) {
    return { rank: HAND_RANKS.ROYAL_FLUSH, tiebreakers: [straightHigh], name: 'Royal Flush', bestCards: sorted };
  }

  // Straight flush
  if (isFlush && isStraight) {
    return { rank: HAND_RANKS.STRAIGHT_FLUSH, tiebreakers: [straightHigh], name: 'Straight Flush', bestCards: sorted };
  }

  // Four of a kind
  if (groups[0][1] === 4) {
    const quadRank = groups[0][0];
    const kicker = groups[1][0];
    return { rank: HAND_RANKS.FOUR_OF_A_KIND, tiebreakers: [quadRank, kicker], name: 'Four of a Kind', bestCards: sorted };
  }

  // Full house
  if (groups[0][1] === 3 && groups[1][1] === 2) {
    return { rank: HAND_RANKS.FULL_HOUSE, tiebreakers: [groups[0][0], groups[1][0]], name: 'Full House', bestCards: sorted };
  }

  // Flush
  if (isFlush) {
    return { rank: HAND_RANKS.FLUSH, tiebreakers: ranks, name: 'Flush', bestCards: sorted };
  }

  // Straight
  if (isStraight) {
    return { rank: HAND_RANKS.STRAIGHT, tiebreakers: [straightHigh], name: 'Straight', bestCards: sorted };
  }

  // Three of a kind
  if (groups[0][1] === 3) {
    const tripRank = groups[0][0];
    const kickers = groups.slice(1).map(g => g[0]).sort((a, b) => b - a);
    return { rank: HAND_RANKS.THREE_OF_A_KIND, tiebreakers: [tripRank, ...kickers], name: 'Three of a Kind', bestCards: sorted };
  }

  // Two pair
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const highPair = Math.max(groups[0][0], groups[1][0]);
    const lowPair = Math.min(groups[0][0], groups[1][0]);
    const kicker = groups[2][0];
    return { rank: HAND_RANKS.TWO_PAIR, tiebreakers: [highPair, lowPair, kicker], name: 'Two Pair', bestCards: sorted };
  }

  // One pair
  if (groups[0][1] === 2) {
    const pairRank = groups[0][0];
    const kickers = groups.slice(1).map(g => g[0]).sort((a, b) => b - a);
    return { rank: HAND_RANKS.ONE_PAIR, tiebreakers: [pairRank, ...kickers], name: 'Pair', bestCards: sorted };
  }

  // High card
  return { rank: HAND_RANKS.HIGH_CARD, tiebreakers: ranks, name: 'High Card', bestCards: sorted };
}

function combinations(cards: Card[], k: number): Card[][] {
  const result: Card[][] = [];
  function combine(start: number, current: Card[]) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < cards.length; i++) {
      current.push(cards[i]);
      combine(i + 1, current);
      current.pop();
    }
  }
  combine(0, []);
  return result;
}

export function evaluateBestHand(holeCards: Card[], communityCards: Card[]): HandResult {
  const allCards = [...holeCards, ...communityCards];
  const fiveCardCombos = combinations(allCards, 5);

  let best: HandResult | null = null;

  for (const combo of fiveCardCombos) {
    const result = evaluateFiveCards(combo);
    if (!best || compareHands(result, best) > 0) {
      best = result;
    }
  }

  return best!;
}

export function compareHands(a: HandResult, b: HandResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < Math.min(a.tiebreakers.length, b.tiebreakers.length); i++) {
    if (a.tiebreakers[i] !== b.tiebreakers[i]) {
      return a.tiebreakers[i] - b.tiebreakers[i];
    }
  }
  return 0;
}

export function cardToString(card: Card): string {
  const suitSymbols: Record<Suit, string> = { h: '\u2665', d: '\u2666', c: '\u2663', s: '\u2660' };
  return `${card.rank}${suitSymbols[card.suit]}`;
}

export function handName(rank: number): string {
  return HAND_NAMES[rank] || 'Unknown';
}
