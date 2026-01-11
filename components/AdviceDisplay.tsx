import React from 'react';
import { AIAdvice, ActionType } from '../types';
import { Brain, TrendingUp, RefreshCw } from 'lucide-react';

interface AdviceDisplayProps {
  advice: AIAdvice | null;
  loading: boolean;
  onReset: () => void;
}

const AdviceDisplay: React.FC<AdviceDisplayProps> = ({ advice, loading, onReset }) => {
  if (loading) {
    return (
      <div className="w-full bg-slate-900/80 rounded-xl p-10 flex flex-col items-center justify-center space-y-6 border border-gold/30 min-h-[250px] animate-pulse relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gold/5 animate-shimmer" />
        <Brain className="w-16 h-16 text-gold animate-bounce drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
        <p className="text-gold font-serif text-2xl tracking-wide">Consulting the Oracle...</p>
      </div>
    );
  }

  if (!advice) return null;

  const getActionStyles = (action: ActionType) => {
    switch (action) {
      case ActionType.HIT:
        return {
          bg: 'bg-gradient-to-br from-green-900 via-green-800 to-green-950',
          border: 'border-green-500',
          text: 'text-green-400',
          shadow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]'
        };
      case ActionType.STAND:
        return {
          bg: 'bg-gradient-to-br from-red-900 via-red-800 to-red-950',
          border: 'border-red-500',
          text: 'text-red-400',
          shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]'
        };
      case ActionType.DOUBLE:
        return {
          bg: 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950',
          border: 'border-blue-500',
          text: 'text-blue-400',
          shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
        };
      case ActionType.SPLIT:
        return {
          bg: 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-950',
          border: 'border-purple-500',
          text: 'text-purple-400',
          shadow: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]'
        };
      case ActionType.SURRENDER:
        return {
          bg: 'bg-gradient-to-br from-yellow-900 via-yellow-800 to-yellow-950',
          border: 'border-yellow-500',
          text: 'text-yellow-400',
          shadow: 'shadow-[0_0_30px_rgba(234,179,8,0.3)]'
        };
      case ActionType.BUST:
        return {
          bg: 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
          border: 'border-gray-500',
          text: 'text-gray-400',
          shadow: 'shadow-[0_0_30px_rgba(107,114,128,0.3)]'
        };
      default:
        return {
          bg: 'bg-slate-800',
          border: 'border-slate-600',
          text: 'text-slate-300',
          shadow: ''
        };
    }
  };

  const style = getActionStyles(advice.action);

  return (
    <div className={`w-full relative rounded-2xl overflow-hidden shadow-2xl animate-slide-up ring-1 ring-white/10 ${style.shadow}`} style={{ animationDuration: '0.6s' }}>

      {/* Header Section */}
      <div className={`p-10 text-center border-b-2 ${style.bg} ${style.border} relative overflow-hidden backdrop-blur-xl`}>
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />

        <h2 className="text-xs font-bold uppercase tracking-[0.4em] mb-4 text-white/70 relative z-10">Oracle Recommends</h2>
        <h1 className="text-7xl font-black tracking-tighter drop-shadow-2xl scale-y-110 text-white relative z-10 animate-fade-in">
          {advice.action}
        </h1>
      </div>

      {/* Body Section */}
      <div className="p-8 space-y-8 bg-slate-900/90 backdrop-blur-md">

        {/* Win Probability / Confidence Meter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${style.text}`} />
              <h4 className="font-bold text-slate-300 text-sm uppercase tracking-wider">
                {advice.winProbability !== undefined ? 'Win Probability' : 'Confidence'}
              </h4>
            </div>
            <span className={`text-xl font-mono font-bold ${advice.winProbability !== undefined
              ? advice.winProbability >= 55 ? 'text-green-400'
                : advice.winProbability <= 45 ? 'text-red-400'
                  : 'text-yellow-400'
              : style.text
              }`}>
              {advice.winProbability !== undefined ? advice.winProbability : advice.confidence}%
            </span>
          </div>

          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div
              className={`h-full transition-all duration-1000 ease-out bg-current shadow-[0_0_15px_currentColor] ${advice.winProbability !== undefined
                ? advice.winProbability >= 55 ? 'text-green-500'
                  : advice.winProbability <= 45 ? 'text-red-500'
                    : 'text-yellow-500'
                : style.text
                }`}
              style={{ width: `${advice.winProbability !== undefined ? advice.winProbability : advice.confidence}%` }}
            />
          </div>
        </div>

        {/* Reasoning */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 relative">
          <div className="absolute -top-3 left-4 bg-slate-900 px-2 flex items-center gap-2 text-gold">
            <Brain className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Analysis</span>
          </div>
          <p className="text-slate-200 text-lg leading-relaxed font-serif italic">
            "{advice.explanation}"
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/40 border-t border-white/5 flex justify-center">
        <button
          onClick={onReset}
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-semibold"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset Table</span>
        </button>
      </div>
    </div>
  );
};

export default AdviceDisplay;
