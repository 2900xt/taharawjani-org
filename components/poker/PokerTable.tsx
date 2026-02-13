'use client';

import { useState, useEffect } from 'react';
import { ClientGameState, ClientPlayer, Card, ActionType } from '@/lib/poker/types';

interface PokerTableProps {
  gameState: ClientGameState;
  roomCode: string;
  roomStatus: string;
  playerToken: string;
  onAction: (action: ActionType, amount?: number) => void;
  onStart: () => void;
  onLeave: () => void;
}

const SUIT_SYMBOLS: Record<string, string> = {
  h: '\u2665',
  d: '\u2666',
  c: '\u2663',
  s: '\u2660',
};

const SUIT_COLORS: Record<string, string> = {
  h: '#ff4444',
  d: '#ff4444',
  c: '#000',
  s: '#000',
};

function CardDisplay({ card, faceDown }: { card?: Card | null; faceDown?: boolean }) {
  if (faceDown || !card) {
    return (
      <span style={{
        display: 'inline-block',
        width: '36px',
        height: '50px',
        border: '2px solid #000',
        borderRadius: '4px',
        background: '#6a5acd',
        margin: '0 2px',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '18px',
        }}>?</span>
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '50px',
      border: '2px solid #000',
      borderRadius: '4px',
      background: '#fff',
      margin: '0 2px',
      color: SUIT_COLORS[card.suit],
      fontSize: '14px',
      fontWeight: 'bold',
      lineHeight: 1,
    }}>
      <span>{card.rank}</span>
      <span style={{ fontSize: '16px' }}>{SUIT_SYMBOLS[card.suit]}</span>
    </span>
  );
}

// Seat positions for a 6-max table (arranged in an oval)
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '78%', left: '50%' },   // 0 - bottom center (you)
  { top: '60%', left: '8%' },    // 1 - bottom left
  { top: '15%', left: '8%' },    // 2 - top left
  { top: '2%', left: '50%' },    // 3 - top center
  { top: '15%', left: '92%' },   // 4 - top right
  { top: '60%', left: '92%' },   // 5 - bottom right
];

function PlayerSeat({ player, isDealer, isActive, isSelf, seatIndex }: {
  player: ClientPlayer | null;
  isDealer: boolean;
  isActive: boolean;
  isSelf: boolean;
  seatIndex: number;
}) {
  const pos = SEAT_POSITIONS[seatIndex];

  if (!player) {
    return (
      <div style={{
        position: 'absolute',
        top: pos.top,
        left: pos.left,
        transform: 'translate(-50%, -50%)',
        width: '100px',
        textAlign: 'center',
        opacity: 0.3,
        fontSize: '12px',
      }}>
        [Empty]
      </div>
    );
  }

  const hasCards = player.holeCards !== null || player.status === 'active' || player.status === 'all-in';

  return (
    <div style={{
      position: 'absolute',
      top: pos.top,
      left: pos.left,
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      zIndex: 2,
    }}>
      {/* Cards */}
      <div style={{ marginBottom: '4px', minHeight: '54px', display: 'flex', justifyContent: 'center' }}>
        {player.status === 'folded' ? null : (
          player.holeCards ? (
            <>
              <CardDisplay card={player.holeCards[0]} />
              <CardDisplay card={player.holeCards[1]} />
            </>
          ) : hasCards ? (
            <>
              <CardDisplay faceDown />
              <CardDisplay faceDown />
            </>
          ) : null
        )}
      </div>

      {/* Player info box */}
      <div style={{
        border: `2px solid ${isActive ? '#ffcc00' : isSelf ? '#7b68ee' : '#000'}`,
        background: player.status === 'folded' ? '#666' : (isSelf ? '#2d1b69' : '#000'),
        color: '#fff',
        padding: '4px 8px',
        minWidth: '90px',
        fontSize: '13px',
        position: 'relative',
      }}>
        {isDealer && (
          <span style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            background: '#ffcc00',
            color: '#000',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            border: '1px solid #000',
          }}>D</span>
        )}
        <div style={{ fontWeight: 'bold' }}>
          {player.name}{isSelf ? ' (you)' : ''}
        </div>
        <div style={{ fontSize: '12px' }}>{player.chips} chips</div>
        {player.currentBet > 0 && (
          <div style={{ fontSize: '11px', color: '#ffcc00' }}>Bet: {player.currentBet}</div>
        )}
        {player.lastAction && (
          <div style={{ fontSize: '11px', color: '#aaa' }}>{player.lastAction}</div>
        )}
        {!player.isConnected && (
          <div style={{ fontSize: '10px', color: '#ff4444' }}>disconnected</div>
        )}
      </div>
    </div>
  );
}

export default function PokerTable({ gameState, roomCode, roomStatus, playerToken, onAction, onStart, onLeave }: PokerTableProps) {
  const gs = gameState;
  const myPlayer = gs.players[gs.mySeat];
  const minRaise = gs.currentBet + gs.minRaise;
  const maxRaise = myPlayer ? myPlayer.chips + myPlayer.currentBet : minRaise;

  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  useEffect(() => {
    setRaiseAmount(minRaise);
  }, [minRaise]);

  const isWaiting = roomStatus === 'waiting';
  const isCreator = gs.mySeat === 0;
  const playerCount = gs.players.filter(p => p !== null).length;

  function handleRaise() {
    if (raiseAmount < minRaise) return;
    onAction('raise', raiseAmount);
    setRaiseAmount(minRaise);
  }

  return (
    <div style={{ padding: '10px' }}>
      {/* Header with room code */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Room: </span>
          <span style={{ letterSpacing: '2px', fontSize: '20px', fontWeight: 'bold' }}>{roomCode}</span>
        </div>
        <div style={{ fontSize: '14px' }}>
          Hand #{gs.handNumber} | Blinds: {gs.smallBlind}/{gs.bigBlind}
        </div>
        <button onClick={onLeave} style={{ fontSize: '12px', padding: '4px 8px' }}>Leave</button>
      </div>

      {/* Table area */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '65%',
        background: '#1a5c2a',
        border: '3px solid #333',
        borderRadius: '120px',
        marginBottom: '10px',
        overflow: 'visible',
      }}>
        {/* Inner felt border */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          right: '8px',
          bottom: '8px',
          border: '2px solid #2a7a3a',
          borderRadius: '110px',
        }} />

        {/* Community cards */}
        <div style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: '4px',
          zIndex: 1,
        }}>
          {gs.communityCards.map((card, i) => (
            <CardDisplay key={i} card={card} />
          ))}
        </div>

        {/* Pot display */}
        {gs.pot > 0 && (
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffcc00',
            fontWeight: 'bold',
            fontSize: '16px',
            zIndex: 1,
            textShadow: '1px 1px 2px #000',
          }}>
            Pot: {gs.pot}
          </div>
        )}

        {/* Phase indicator */}
        <div style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#aaa',
          fontSize: '12px',
          textTransform: 'uppercase',
          zIndex: 1,
        }}>
          {gs.phase}
        </div>

        {/* Player seats */}
        {gs.players.map((player, i) => (
          <PlayerSeat
            key={i}
            player={player}
            isDealer={gs.dealerSeat === i}
            isActive={gs.activePlayerSeat === i}
            isSelf={gs.mySeat === i}
            seatIndex={i}
          />
        ))}
      </div>

      {/* Waiting room / Start */}
      {isWaiting && (
        <div className="stats-box" style={{ marginBottom: '10px', textAlign: 'center' }}>
          <div className="stats-title">Waiting for Players</div>
          <p style={{ margin: '8px 0', fontSize: '14px' }}>
            {playerCount} player{playerCount !== 1 ? 's' : ''} in room
          </p>
          {isCreator && playerCount >= 2 && (
            <button onClick={onStart} style={{ width: '100%' }}>Start Game</button>
          )}
          {isCreator && playerCount < 2 && (
            <p style={{ fontSize: '13px', color: '#666' }}>Need at least 2 players to start</p>
          )}
          {!isCreator && (
            <p style={{ fontSize: '13px', color: '#666' }}>Waiting for host to start...</p>
          )}
        </div>
      )}

      {/* Winners display */}
      {gs.winners && gs.winners.length > 0 && (
        <div className="stats-box" style={{ marginBottom: '10px', textAlign: 'center' }}>
          <div className="stats-title">Results</div>
          {gs.winners.map((w, i) => {
            const p = gs.players[w.seatIndex];
            return (
              <div key={i} style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>{p?.name}</strong> wins {w.amount} with {w.handName}
              </div>
            );
          })}
          {gs.showdownHands && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {gs.showdownHands.map((h, i) => {
                const p = gs.players[h.seatIndex];
                return (
                  <div key={i} style={{ fontSize: '12px' }}>
                    <div>{p?.name}: {h.handName}</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {h.cards.map((c, j) => <CardDisplay key={j} card={c} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {gs.myTurn && gs.availableActions.length > 0 && (
        <div className="stats-box" style={{ marginBottom: '10px' }}>
          <div className="stats-title">Your Turn</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            {gs.availableActions.includes('fold') && (
              <button onClick={() => onAction('fold')} style={{ flex: 1, minWidth: '60px' }}>Fold</button>
            )}
            {gs.availableActions.includes('check') && (
              <button onClick={() => onAction('check')} style={{ flex: 1, minWidth: '60px', background: '#2a7a3a' }}>Check</button>
            )}
            {gs.availableActions.includes('call') && (
              <button onClick={() => onAction('call')} style={{ flex: 1, minWidth: '60px', background: '#2a7a3a' }}>
                Call {gs.callAmount}
              </button>
            )}
            {gs.availableActions.includes('all-in') && (
              <button onClick={() => onAction('all-in')} style={{ flex: 1, minWidth: '60px', background: '#cc4444' }}>All-In</button>
            )}
          </div>
          {gs.availableActions.includes('raise') && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setRaiseAmount(minRaise)}
                  style={{ flex: 1, minWidth: '50px', fontSize: '12px', padding: '4px', background: raiseAmount === minRaise ? '#7b68ee' : undefined }}
                >
                  Min
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, Math.min(Math.floor(gs.pot / 2), maxRaise)))}
                  style={{ flex: 1, minWidth: '50px', fontSize: '12px', padding: '4px' }}
                >
                  &frac12; Pot
                </button>
                <button
                  onClick={() => setRaiseAmount(Math.max(minRaise, Math.min(gs.pot, maxRaise)))}
                  style={{ flex: 1, minWidth: '50px', fontSize: '12px', padding: '4px' }}
                >
                  Pot
                </button>
                <button
                  onClick={() => setRaiseAmount(maxRaise)}
                  style={{ flex: 1, minWidth: '50px', fontSize: '12px', padding: '4px', background: raiseAmount === maxRaise ? '#cc4444' : undefined }}
                >
                  Max
                </button>
              </div>
              <input
                type="range"
                min={minRaise}
                max={maxRaise}
                step={gs.bigBlind}
                value={raiseAmount}
                onChange={e => setRaiseAmount(Number(e.target.value))}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: '#7b68ee',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="number"
                  value={raiseAmount}
                  onChange={e => {
                    const v = Number(e.target.value);
                    if (!isNaN(v)) setRaiseAmount(Math.max(minRaise, Math.min(v, maxRaise)));
                  }}
                  min={minRaise}
                  max={maxRaise}
                  style={{ flex: 1, textAlign: 'center', fontSize: '16px' }}
                />
                <button onClick={handleRaise} style={{ background: '#cc8800', minWidth: '80px' }}>
                  Raise {raiseAmount}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action log */}
      <div className="stats-box">
        <div className="stats-title">Action Log</div>
        <div style={{
          maxHeight: '120px',
          overflowY: 'auto',
          fontSize: '12px',
          padding: '4px',
        }}>
          {gs.actionLog.length === 0 ? (
            <div style={{ color: '#999' }}>No actions yet</div>
          ) : (
            [...gs.actionLog].reverse().map((log, i) => (
              <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid #eee' }}>{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
