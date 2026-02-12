export type Suit = 'h' | 'd' | 'c' | 's';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type Phase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out';

export interface Player {
  name: string;
  seatIndex: number;
  token: string;
  chips: number;
  holeCards: Card[];
  status: PlayerStatus;
  currentBet: number;
  lastAction: string | null;
  lastPollAt: string | null;
  hasActed: boolean;
}

export interface SidePot {
  amount: number;
  eligible: number[]; // seat indices
}

export interface GameState {
  players: (Player | null)[];
  deck: Card[];
  communityCards: Card[];
  phase: Phase;
  pot: number;
  sidePots: SidePot[];
  currentBet: number;
  dealerSeat: number;
  activePlayerSeat: number;
  smallBlind: number;
  bigBlind: number;
  handNumber: number;
  actionLog: string[];
  handComplete: boolean;
  handCompleteAt: string | null;
  winners: { seatIndex: number; amount: number; handName: string }[] | null;
  showdownHands: { seatIndex: number; cards: Card[]; handName: string }[] | null;
  lastActionAt: string;
  minRaise: number;
}

export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface PlayerAction {
  type: ActionType;
  amount?: number;
}

export interface ClientPlayer {
  name: string;
  seatIndex: number;
  chips: number;
  holeCards: Card[] | null; // null for other players (hidden)
  status: PlayerStatus;
  currentBet: number;
  lastAction: string | null;
  isConnected: boolean;
}

export interface ClientGameState {
  players: (ClientPlayer | null)[];
  communityCards: Card[];
  phase: Phase;
  pot: number;
  sidePots: SidePot[];
  currentBet: number;
  dealerSeat: number;
  activePlayerSeat: number;
  smallBlind: number;
  bigBlind: number;
  handNumber: number;
  actionLog: string[];
  handComplete: boolean;
  winners: { seatIndex: number; amount: number; handName: string }[] | null;
  showdownHands: { seatIndex: number; cards: Card[]; handName: string }[] | null;
  mySeat: number;
  myTurn: boolean;
  availableActions: ActionType[];
  minRaise: number;
  callAmount: number;
}

export interface CreateRoomResponse {
  roomCode: string;
  playerToken: string;
  seatIndex: number;
}

export interface JoinRoomResponse {
  playerToken: string;
  seatIndex: number;
}
