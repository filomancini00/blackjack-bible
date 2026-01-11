import React from 'react';
import { Card, Suit } from '../types';

interface PlayingCardProps {
  card?: Card;
  onClick?: () => void;
  isPlaceholder?: boolean;
  label?: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  onClick,
  isPlaceholder = false,
  label,
  selected = false,
  size = 'md'
}) => {

  const isRed = card?.suit === Suit.HEARTS || card?.suit === Suit.DIAMONDS;

  // Adjusted sizes for better proportions
  const sizeClasses = {
    sm: 'w-14 h-20 text-xs',
    md: 'w-28 h-40 text-lg',
    lg: 'w-36 h-52 text-2xl',
  };

  const centerSuitSizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-7xl',
  };

  const baseClasses = `
    relative rounded-xl border flex flex-col items-center justify-center 
    select-none transition-all duration-500 transform-style-3d backface-hidden
    ${sizeClasses[size]}
  `;

  if (isPlaceholder) {
    return (
      <div
        onClick={onClick}
        className={`
          ${baseClasses} 
          border-dashed border-gold/30 bg-white/5 
          hover:bg-white/10 hover:border-gold hover:shadow-gold-glow
          cursor-pointer group backdrop-blur-sm
          ${selected ? 'ring-2 ring-gold border-gold bg-gold/10' : ''}
        `}
      >
        <div className="transform transition-transform duration-300 group-hover:scale-110 flex flex-col items-center">
          <span className="text-white/20 group-hover:text-gold font-light text-4xl transition-colors mb-2">+</span>
          {label && (
            <span className="text-white/40 group-hover:text-gold text-[0.6em] uppercase tracking-[0.2em] font-bold transition-colors text-center px-1">
              {label}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="perspective-1000 group">
      <div
        onClick={onClick}
        className={`
            ${baseClasses} 
            bg-card-gradient border-slate-300
            cursor-pointer shadow-card-float
            ${selected
            ? 'ring-4 ring-gold ring-offset-2 ring-offset-felt-dark -translate-y-6 z-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            : 'hover:-translate-y-3 hover:shadow-2xl hover:rotate-1 z-10'
          }
            animate-deal-card
        `}
      >
        {/* Card Texture/Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] pointer-events-none rounded-xl" />

        {/* Inner Border for classic look */}
        <div className="absolute inset-x-[6%] inset-y-[4%] border border-slate-100 rounded-[6px] pointer-events-none" />

        {/* Top Left Rank/Suit */}
        <div className={`absolute top-1 left-1.5 flex flex-col items-center leading-none ${isRed ? 'text-card-red' : 'text-card-black'}`}>
          <span className="font-bold text-[1.2em] font-serif tracking-tight">{card.rank}</span>
          <span className="text-[0.8em]">{card.suit}</span>
        </div>

        {/* Center Suit */}
        <div className={`${centerSuitSizes[size]} ${isRed ? 'text-card-red' : 'text-card-black'} drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300`}>
          {card.suit}
        </div>

        {/* Bottom Right Rank/Suit (Rotated) */}
        <div className={`absolute bottom-1 right-1.5 flex flex-col items-center leading-none transform rotate-180 ${isRed ? 'text-card-red' : 'text-card-black'}`}>
          <span className="font-bold text-[1.2em] font-serif tracking-tight">{card.rank}</span>
          <span className="text-[0.8em]">{card.suit}</span>
        </div>

        {/* Dynamic Shine effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ mixBlendMode: 'overlay' }} />
      </div>
    </div>
  );
};

export default PlayingCard;
