import PokerGame from '@/components/poker/PokerGame';

export default function PokerPage() {
  return (
    <div className="window" style={{ width: '100%' }}>
      <div className="window-title">Texas Hold&apos;em Poker</div>
      <div className="window-content">
        <PokerGame />
      </div>
    </div>
  );
}
