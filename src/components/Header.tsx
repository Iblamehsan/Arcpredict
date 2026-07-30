import React from 'react';
import { Wallet, ExternalLink, Droplets, Trophy, LayoutGrid, Receipt, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'markets' | 'mybets' | 'leaderboard';
  setActiveTab: (tab: 'markets' | 'mybets' | 'leaderboard') => void;
  walletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  usdcBalance: number;
  arcBalance: number;
  onOpenFaucet: () => void;
  activeBetsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  walletConnected,
  setWalletConnected,
  usdcBalance,
  arcBalance,
  onOpenFaucet,
  activeBetsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-amber-500/20 bg-[#030712]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand & Creator Badge */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div 
              onClick={() => setActiveTab('markets')}
              className="cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center font-extrabold text-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
                🎯
              </div>
              <div>
                <span className="text-lg sm:text-xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
                  BETON<span className="text-amber-400">ARC</span>
                </span>
                <span className="hidden sm:block text-[9px] font-mono font-semibold text-amber-400/80 tracking-widest uppercase -mt-1">
                  ARC TESTNET MARKET
                </span>
              </div>
            </div>

            <div className="hidden lg:block h-6 w-px bg-slate-800"></div>

            {/* ARC TESTNET BADGE */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/30 text-[10px] font-mono text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Arc Testnet
            </div>

            {/* CREATOR BADGE -> LINK TO EHSAN'S X PROFILE */}
            <a
              href="https://x.com/iblamehsan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-200 shadow-[0_0_12px_rgba(245,158,11,0.15)] group"
              title="Designed & Created by Ehsan - Visit X Profile"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>
                <span className="hidden sm:inline">Designed & Created by </span>
                <span className="sm:hidden">By </span>
                <strong className="font-bold underline decoration-amber-400/60 group-hover:decoration-amber-300 text-amber-200">
                  Ehsan
                </strong>
              </span>
              <svg className="w-3 h-3 text-amber-400 fill-current group-hover:scale-110 transition-transform ml-0.5" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('markets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'markets'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Markets
            </button>
            <button
              onClick={() => setActiveTab('mybets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'mybets'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              My Bets
              {activeBetsCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'mybets' ? 'bg-black text-amber-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {activeBetsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </button>
          </nav>

          {/* Right Wallet Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Faucet Trigger */}
            <button
              onClick={onOpenFaucet}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 rounded-lg text-xs font-semibold transition-all"
              title="Get Testnet Tokens"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Faucet</span>
            </button>

            {walletConnected ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 p-1 pl-2.5 rounded-xl">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    {usdcBalance.toLocaleString()} USDC
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {arcBalance.toFixed(2)} ARC
                  </div>
                </div>
                <button
                  onClick={() => setWalletConnected(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-lg text-xs font-mono font-medium border border-amber-500/30 transition-all"
                  title="Click to disconnect"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  0x7a...4f8b
                </button>
              </div>
            ) : (
              <button
                onClick={() => setWalletConnected(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform active:scale-95"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('markets')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'markets' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Markets
          </button>
          <button
            onClick={() => setActiveTab('mybets')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold relative ${
              activeTab === 'mybets' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            My Bets
            {activeBetsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-black font-extrabold">
                {activeBetsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
              activeTab === 'leaderboard' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
        </div>

      </div>
    </header>
  );
};
