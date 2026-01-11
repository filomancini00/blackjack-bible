import React from 'react';
import { Rank, Suit, Card } from '../types';
import PlayingCard from './PlayingCard';
import { X } from 'lucide-react';

interface CardPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (card: Card) => void;
}

const ranks = Object.values(Rank);
const suits = Object.values(Suit);

const CardPicker: React.FC<CardPickerProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" style={{ animationDuration: '0.2s' }}>
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-slide-up" style={{ animationDuration: '0.3s' }}>

        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <h3 className="text-white font-serif text-lg tracking-wide">Select a Card</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1 custom-scrollbar bg-slate-900/50">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 place-items-center">
            {ranks.map((rank) => (
              <div key={`${rank}-HEARTS`} className="transform transition hover:scale-110 hover:z-10">
                <PlayingCard
                  card={{ rank, suit: Suit.HEARTS, id: 'picker' }}
                  size="sm"
                  onClick={() => onSelect({ rank, suit: Suit.HEARTS, id: Math.random().toString(36).substr(2, 9) })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 text-center text-xs text-slate-400">
          Tap a card to add it to your hand
        </div>
      </div>
    </div>
  );
};

export default CardPicker;
