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
          border-dashed border-neon-cyan/30 bg-casino-purple/20 
          hover:bg-casino-purple/40 hover:border-neon-cyan hover:shadow-neon-cyan
          cursor-pointer group backdrop-blur-xl
          ${selected ? 'ring-2 ring-neon-cyan border-neon-cyan bg-neon-cyan/10' : ''}
        `}
      >
        <div className="transform transition-transform duration-300 group-hover:scale-110 flex flex-col items-center">
          <span className="text-neon-cyan/30 group-hover:text-neon-cyan font-light text-4xl transition-colors mb-2">+</span>
          {label && (
            <span className="text-neon-cyan/50 group-hover:text-neon-cyan text-[0.6em] uppercase tracking-[0.2em] font-bold transition-colors text-center px-1">
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
            bg-white border-slate-200
            cursor-pointer shadow-premium-depth
            ${selected
            ? 'ring-4 ring-neon-cyan ring-offset-2 ring-offset-casino-dark -translate-y-6 z-20 shadow-neon-cyan'
            : 'hover:-translate-y-3 hover:shadow-card-float hover:rotate-1 z-10'
          }
        `}
      >
        {/* Card Texture/Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] pointer-events-none rounded-xl" />

        {/* Inner Border for classic look */}
        <div className="absolute inset-x-[6%] inset-y-[4%] border border-slate-100 rounded-[6px] pointer-events-none" />

        {/* Top Left Rank */}
        <div className={`absolute top-2 left-2 flex flex-col items-center leading-none ${isRed ? 'text-card-red' : 'text-card-black'}`}>
          <span className="font-bold text-[1.4em] font-serif tracking-tight">{card.rank}</span>
        </div>

        {/* Center Suit */}
        <div className={`${centerSuitSizes[size]} ${isRed ? 'text-card-red' : 'text-card-black'} drop-shadow-sm transform group-hover:scale-110 transition-transform duration-300`}>
          {card.suit}
        </div>

        {/* Bottom Right Rank (Rotated) */}
        <div className={`absolute bottom-2 right-2 flex flex-col items-center leading-none transform rotate-180 ${isRed ? 'text-card-red' : 'text-card-black'}`}>
          <span className="font-bold text-[1.4em] font-serif tracking-tight">{card.rank}</span>
        </div>

        {/* Dynamic Shine effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ mixBlendMode: 'overlay' }} />
      </div>
    </div>
  );
};

export default PlayingCard;
