// ... imports
import React, { useState, useEffect } from 'react';
import { Card, SelectionMode, AIAdvice } from './types';
import PlayingCard from './components/PlayingCard';
import CardPicker from './components/CardPicker';
import AdviceDisplay from './components/AdviceDisplay';
import { getBasicStrategyAdvice } from './services/rulesService';
import { RefreshCw, Zap, Shield, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [dealerCard, setDealerCard] = useState<Card | null>(null);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(false);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('PLAYER');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(-1); // -1 for new add, 0+ for replacing specific index

  const handleOpenPicker = (mode: SelectionMode, index: number = -1) => {
    setSelectionMode(mode);
    setActiveSlotIndex(index);
    setIsPickerOpen(true);
  };

  const handleSelectCard = (card: Card) => {
    if (selectionMode === 'DEALER') {
      setDealerCard(card);
    } else {
      setPlayerCards(prev => {
        const newCards = [...prev];
        if (activeSlotIndex >= 0 && activeSlotIndex < newCards.length) {
          newCards[activeSlotIndex] = card;
        } else {
          // Limit to 3 cards max
          if (newCards.length < 3) newCards.push(card);
        }
        return newCards;
      });
    }
    // Don't close immediately if we are filling the initial hand, maybe? 
    // No, better to close for clarity. User can click again.
    setIsPickerOpen(false);

    // Clear advice when state changes so user knows to re-ask
    if (advice) setAdvice(null);
  };

  const removePlayerCard = (index: number) => {
    setPlayerCards(prev => prev.filter((_, i) => i !== index));
    setAdvice(null);
  };

  const resetGame = () => {
    setDealerCard(null);
    setPlayerCards([]);
    setAdvice(null);
    setLoading(false);
  };

  const getAdvice = async () => {
    if (!dealerCard || playerCards.length < 2) return;

    setLoading(true);
    setAdvice(null);
    try {
      // Simulate small delay for effect
      await new Promise(resolve => setTimeout(resolve, 500));
      const result = await getBasicStrategyAdvice(dealerCard, playerCards);
      setAdvice(result);
    } catch (error) {
      console.error(error);
      alert('Failed to get advice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom when advice appears
  useEffect(() => {
    if (advice) {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [advice]);

  const canAsk = dealerCard && playerCards.length >= 2;

  return (
    <div className="min-h-screen pb-20 bg-felt-gradient text-white font-sans selection:bg-gold selection:text-black overflow-x-hidden">
      {/* Background Texture */}
      <div className="fixed inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none mix-blend-overlay" />

      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-gold-gradient text-black p-2 rounded shadow-gold-glow font-bold text-xl border border-white/20">BJ</div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-white drop-shadow-md">
            Blackjack<span className="text-gold">Bible</span>.ai
          </h1>
        </div>
        <button
          onClick={resetGame}
          className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white hover:rotate-180 duration-500 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          title="Reset Table"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-12 mt-8 relative z-10">

        {/* Dealer Section */}
        <section className="flex flex-col items-center space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-gold/90 uppercase tracking-[0.2em] text-xs font-bold shadow-black drop-shadow-md bg-black/30 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
            <Shield size={14} className="text-gold" /> Dealer's Upcard
          </div>
          <div className="flex justify-center w-full perspective-1000">
            <PlayingCard
              card={dealerCard || undefined}
              isPlaceholder={!dealerCard}
              label="Select Dealer"
              onClick={() => handleOpenPicker('DEALER')}
              size="lg" // Increased size for impact
            />
          </div>
        </section>

        {/* Player Section */}
        <section className="flex flex-col items-center space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 text-gold/90 uppercase tracking-[0.2em] text-xs font-bold drop-shadow-md bg-black/30 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
            <Zap size={14} className="text-gold" /> Your Hand
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 w-full min-h-[190px] perspective-1000">
            {playerCards.map((card, index) => (
              <div key={card.id} className="animate-deal-card" style={{ animationDelay: `${index * 0.15}s` }}>
                <PlayingCard
                  card={card}
                  onClick={() => handleOpenPicker('PLAYER', index)}
                  size="md"
                />
              </div>
            ))}
            {playerCards.length < 3 && (
              <PlayingCard
                isPlaceholder
                label={playerCards.length === 0 ? "First Card" : playerCards.length === 1 ? "Second Card" : "Hit Card"}
                onClick={() => handleOpenPicker('PLAYER', -1)}
                size="md"
              />
            )}
          </div>
          {playerCards.length >= 2 && (
            <button
              onClick={() => setPlayerCards([])}
              className="text-[10px] text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest font-semibold opacity-60 hover:opacity-100 mt-2"
            >
              Clear Hand
            </button>
          )}
        </section>

        {/* Action Button */}
        <section className="pt-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {!advice && (
            <div className="relative group">
              {/* Button Glow Effect */}
              <div className={`absolute -inset-1 bg-gradient-to-r from-gold via-yellow-300 to-gold rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 ${canAsk ? 'animate-pulse' : 'hidden'}`}></div>

              <button
                disabled={!canAsk || loading}
                onClick={getAdvice}
                className={`
                  relative w-full py-6 rounded-2xl font-bold text-xl tracking-[0.1em] uppercase shadow-2xl
                  flex items-center justify-center gap-4 transition-all duration-300 transform
                  ${canAsk
                    ? 'bg-gold-gradient text-black shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] border border-white/40' // Bright gold gradient
                    : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-800'}
                `}
              >
                <div className="relative z-10 flex items-center gap-3">
                  <span className={loading ? 'animate-pulse' : ''}>{loading ? 'Consulting Oracle...' : 'Ask the Oracle'}</span>
                  {!loading && canAsk && <BrainIcon />}
                </div>
              </button>
            </div>
          )}

          {!canAsk && !loading && (
            <p className="text-center text-slate-500 text-xs mt-6 animate-pulse font-mono">
              [ Select Dealer's card + 2 Player cards ]
            </p>
          )}
        </section>

        {/* Result Display */}
        <div id="results" className="scroll-mt-32 pb-10">
          <AdviceDisplay advice={advice} loading={loading} onReset={resetGame} />
        </div>

      </main>

      <CardPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectCard}
      />
    </div>
  );
};

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

export default App;