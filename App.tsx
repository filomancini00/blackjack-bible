// ... imports
import React, { useState, useEffect } from 'react';
import { Card, SelectionMode, AIAdvice } from './types';
import PlayingCard from './components/PlayingCard';
import CardPicker from './components/CardPicker';
import AdviceDisplay from './components/AdviceDisplay';
import Logo from './components/Logo';
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
          // Limit to 10 cards max
          if (newCards.length < 10) newCards.push(card);
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
    <div className="min-h-screen pb-20 bg-casino-gradient text-white font-sans selection:bg-neon-cyan selection:text-black overflow-x-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-neon-cyan/20 bg-black/40 backdrop-blur-2xl sticky top-0 z-30 shadow-premium-depth">
        <div className="flex items-center gap-5">
          <Logo size="lg" />
          <h1 className="text-3xl font-serif font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white via-neon-cyan to-white bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]">
              Blackjack
            </span>
            <span className="bg-gold-gradient bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              Bible
            </span>
            <span className="text-neon-cyan/70 text-xl">.ai</span>
          </h1>
        </div>
        <button
          onClick={resetGame}
          className="p-3 bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 rounded-full hover:from-neon-cyan/20 hover:to-neon-purple/20 transition-all duration-300 text-neon-cyan hover:text-white hover:rotate-180 hover:shadow-neon-cyan border border-neon-cyan/30 hover:border-neon-cyan/60 hover:scale-110"
          title="Reset Table"
        >
          <RefreshCw size={22} />
        </button>
      </header>

      <main className="max-w-xl mx-auto p-6 space-y-12 mt-8 relative z-10">

        {/* Dealer Section */}
        <section className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2 text-neon-cyan uppercase tracking-[0.2em] text-xs font-bold bg-gradient-to-r from-casino-purple/60 to-casino-blue/60 px-5 py-2 rounded-full border border-neon-cyan/40 backdrop-blur-xl shadow-neon-cyan">
            <Shield size={14} className="text-neon-cyan" /> Dealer's Upcard
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
        <section className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-2 text-gold uppercase tracking-[0.2em] text-xs font-bold bg-gradient-to-r from-casino-purple/60 to-casino-blue/60 px-5 py-2 rounded-full border border-gold/40 backdrop-blur-xl shadow-gold-glow">
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
            {playerCards.length < 10 && (
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
              className="text-[10px] text-neon-cyan/60 hover:text-neon-pink transition-colors uppercase tracking-widest font-semibold opacity-60 hover:opacity-100 mt-2 hover:drop-shadow-[0_0_8px_rgba(255,0,110,0.6)]"
            >
              Clear Hand
            </button>
          )}
        </section>

        {/* Action Button */}
        <section className="pt-8">
          {!advice && (
            <div className="relative group">
              {/* Button Glow Effect */}
              <div className={`absolute -inset-1 bg-neon-gradient rounded-2xl blur-lg opacity-30 group-hover:opacity-70 transition duration-500 ${canAsk ? 'animate-glow-pulse' : 'hidden'}`}></div>

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