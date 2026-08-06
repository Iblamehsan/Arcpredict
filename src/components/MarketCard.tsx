import React from 'react';
import { Market } from '../types';
import { 
  Bitcoin, Coins, Zap, Layers, Cpu, Rocket, Smartphone, 
  Trophy, Medal, TrendingUp, BarChart3, Vote, ShieldCheck, Clock,
  CheckCircle2, AlertCircle, Newspaper, ArrowUpRight
} from 'lucide-react';

interface MarketCardProps {
  market: Market;
  onPlaceBet: (market: Market, outcome: 'YES' | 'NO') => void;
  onEarlyResolve?: (market: Market) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market, onPlaceBet, onEarlyResolve }) => {
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

  const isResolved = market.status === 'resolved';
  const probNo = 100 - market.probYes;

  // Generate SVG path for sparkline chart
  const generateSparklineD = (history: number[]) => {
    if (!history || history.length === 0) return '';
    const width = 120;
    const height = 24;
    const min = Math.min(...history) - 5;
    const max = Math.max(...history) + 5;
    const range = max - min || 1;
    const denominator = history.length > 1 ? history.length - 1 : 1;

    return history.map((val, idx) => {
      const x = (idx / denominator) * width;
      const y = height - ((val - min) / range) * height;
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  return (
    <div className={`glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group transition-all ${
      isResolved ? 'border-amber-500/50 bg-amber-950/10' : ''
    }`}>
      
      {/* Featured Ribbon */}
      {market.featured && !isResolved && (
        <div className="absolute -right-8 top-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-[9px] uppercase tracking-wider py-0.5 px-8 rotate-45 shadow-sm">
          HOT
        </div>
      )}

      {/* Top Header Row */}
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

          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            {isResolved ? (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                RESOLVED {market.winningOutcome}
              </span>
            ) : (
              <span className="text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{market.endDate}</span>
              </span>
            )}
          </div>
        </div>

        {/* Market Title */}
        <h3 className="text-base font-bold text-white leading-snug mb-3 group-hover:text-amber-200 transition-colors">
          {market.title}
        </h3>
      </div>

      {/* Main Body */}
      <div className="space-y-4">
        
        {/* Probability Progress Bar */}
        <div>
          <div className="flex justify-between items-center text-xs font-mono font-bold mb-1.5">
            <span className={`${market.winningOutcome === 'YES' ? 'text-emerald-300 font-extrabold' : 'text-emerald-400'} flex items-center gap-1`}>
              YES {market.probYes}% {market.winningOutcome === 'YES' && '✓ WINNER'}
            </span>
            <span className={`${market.winningOutcome === 'NO' ? 'text-rose-300 font-extrabold' : 'text-rose-400'} flex items-center gap-1`}>
              NO {probNo}% {market.winningOutcome === 'NO' && '✓ WINNER'}
            </span>
          </div>
          
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
            <div 
              className={`h-full rounded-l-full transition-all duration-500 ${
                isResolved && market.winningOutcome === 'YES'
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              }`}
              style={{ width: `${market.probYes}%` }}
            ></div>
            <div 
              className={`h-full rounded-r-full transition-all duration-500 ${
                isResolved && market.winningOutcome === 'NO'
                  ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600'
              }`}
              style={{ width: `${probNo}%` }}
            ></div>
          </div>
        </div>

        {/* Resolved News Banner or Oracle Source */}
        {isResolved && market.resolutionHeadline ? (
          <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
              <span className="flex items-center gap-1 font-bold">
                <Newspaper className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL ANNOUNCEMENT
              </span>
              <span>{market.resolvedAt}</span>
            </div>
            <p className="text-white font-medium leading-relaxed text-[11px]">
              "{market.resolutionHeadline}"
            </p>
            {market.resolutionTxHash && (
              <div className="pt-1 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Arc Testnet Settlement:</span>
                <span className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5"
                      onClick={() => alert(`Arc On-Chain Settlement Tx:\n${market.resolutionTxHash}`)}>
                  {market.resolutionTxHash.slice(0, 12)}... <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Trend Sparkline & Resolution Oracle Info */
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
        )}

        {/* Action Bet Buttons or Resolved Status */}
        {isResolved ? (
          <div className="w-full py-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center text-xs font-mono text-emerald-300 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Market Closed & Settled on Arc Testnet ({market.winningOutcome} Wins)</span>
          </div>
        ) : (
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
        )}

        {/* Activity Footer */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
          {isResolved ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Early Resolution Complete
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Market
            </span>
          )}
        </div>

      </div>

    </div>
  );
};

