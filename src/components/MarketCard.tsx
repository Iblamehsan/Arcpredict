import React from 'react';
import { Market } from '../types';
import { 
  Bitcoin, Coins, Zap, Layers, Cpu, Rocket, Smartphone, 
  Trophy, Medal, TrendingUp, BarChart3, Vote, ShieldCheck, Clock
} from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onPlaceBet: (market: Market, outcome: 'YES' | 'NO') => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onPlaceBet }) => {
  // Dynamic Lucide Icon Mapper
  const renderIcon = (name: string) => {
    const props = { className: "w-4 h-4 text-amber-400" };
    switch (name) {
      case 'Bitcoin': return <Bitcoin {...props} />;
      case 'Coins': return <Coins {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Layers': return <Layers {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Rocket': return <Rocket {...props} />;
      case 'Smartphone': return <Smartphone {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Medal': return <Medal {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'BarChart3': return <BarChart3 {...props} />;
      case 'Vote': return <Vote {...props} />;
      default: return <TrendingUp {...props} />;
    }
  };

  const probNo = 100 - market.probYes;

  // Generate SVG path for sparkline chart
  const generateSparklineD = (history: number[]) => {
    if (!history || history.length === 0) return '';
    const width = 120;
    const height = 24;
    const min = Math.min(...history) - 5;
    const max = Math.max(...history) + 5;
    const range = max - min || 1;

    return history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Featured Ribbon */}
      {market.featured && (
        <div className="absolute -right-8 top-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[9px] uppercase tracking-wider py-0.5 px-8 rotate-45 shadow-sm">
          HOT
        </div>
      )}

      {/* Top Header Row - Clean Category & Resolution Date (No bloated volume line!) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              {renderIcon(market.iconName)}
            </div>
            <span className="text-xs font-semibold text-amber-400/90 font-mono tracking-wide uppercase">
              {market.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{market.endDate}</span>
          </div>
        </div>

        {/* Market Title */}
        <h3 className="text-base font-bold text-white leading-snug mb-4 group-hover:text-amber-200 transition-colors">
          {market.title}
        </h3>
      </div>

      {/* Main Body: Probability Bar & Odds */}
      <div className="space-y-4">
        
        {/* Probability Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono font-bold mb-1.5">
            <span className="text-emerald-400 flex items-center gap-1">
              YES {market.probYes}%
            </span>
            <span className="text-rose-400 flex items-center gap-1">
              NO {probNo}%
            </span>
          </div>
          
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${market.probYes}%` }}
            ></div>
            <div 
              className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-r-full transition-all duration-500"
              style={{ width: `${probNo}%` }}
            ></div>
          </div>
        </div>

        {/* Trend Sparkline & Resolution Oracle Info */}
        <div className="flex items-center justify-between pt-1 pb-1 border-t border-b border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-1 text-slate-400 font-mono truncate max-w-[170px]" title={market.resolutionSource}>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
            <span className="truncate">{market.resolutionSource}</span>
          </div>

          {/* Sparkline chart */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase">7d Trend</span>
            <svg className="w-[80px] h-[20px] overflow-visible">
              <path
                d={generateSparklineD(market.history)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Action Bet Buttons (YES / NO) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => onPlaceBet(market, 'YES')}
            className="flex flex-col items-center justify-center py-2.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400 rounded-xl transition-all group/btn"
          >
            <span className="text-[10px] font-mono text-emerald-400/80 font-bold tracking-wider">
              BET YES
            </span>
            <span className="text-sm font-black text-emerald-300 group-hover/btn:scale-105 transition-transform">
              {market.oddsYes.toFixed(2)}x
            </span>
          </button>

          <button
            onClick={() => onPlaceBet(market, 'NO')}
            className="flex flex-col items-center justify-center py-2.5 px-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 hover:border-rose-400 rounded-xl transition-all group/btn"
          >
            <span className="text-[10px] font-mono text-rose-400/80 font-bold tracking-wider">
              BET NO
            </span>
            <span className="text-sm font-black text-rose-300 group-hover/btn:scale-105 transition-transform">
              {market.oddsNo.toFixed(2)}x
            </span>
          </button>
        </div>

        {/* Activity Footer */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
          <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Market
          </span>
        </div>

      </div>

    </div>
  );
};
