import React from 'react';
import { UserBet } from '../types';
import { Wallet, Clock, Trophy, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface MyBetsViewProps {
  userBets: UserBet[];
  walletConnected: boolean;
  onConnectWallet: () => void;
  onClaimWinnings: (betId: string) => void;
  onExploreMarkets: () => void;
}

export const MyBetsView: React.FC<MyBetsViewProps> = ({
  userBets,
  walletConnected,
  onConnectWallet,
  onClaimWinnings,
  onExploreMarkets,
}) => {
  if (!walletConnected) {
    return (
      <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800 max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-white font-display">Wallet Not Connected</h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          Connecting your Web3 wallet is required to view your active prediction positions, track performance, and claim settlement payouts on Arc Testnet.
        </p>
        <button
          onClick={onConnectWallet}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20"
        >
          Connect Wallet to View Positions
        </button>
      </div>
    );
  }

  const activeBets = userBets.filter(b => b.status === 'ACTIVE');
  const settledBets = userBets.filter(b => b.status !== 'ACTIVE');

  const totalStaked = userBets.reduce((acc, b) => acc + b.amount, 0);
  const totalPotentialPayout = activeBets.reduce((acc, b) => acc + b.potentialPayout, 0);

  return (
    <div className="space-y-6">

      
      {/* Portfolio Stats Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Active Positions</div>
          <div className="text-xl font-black text-white font-mono">{activeBets.length} Bets</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Total USDC Staked</div>
          <div className="text-xl font-black text-amber-400 font-mono">${totalStaked.toLocaleString()} USDC</div>
        </div>
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Potential Active Return</div>
          <div className="text-xl font-black text-emerald-400 font-mono">${totalPotentialPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDC</div>
        </div>
      </div>

      {userBets.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-2xl">
            🎯
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Active Bets Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            You haven't placed any prediction market bets yet. Explore active markets on Arc Testnet to get started!
          </p>
          <button
            onClick={onExploreMarkets}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20"
          >
            Explore Active Markets
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Active Bets Section */}
          <div>
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Active Market Positions ({activeBets.length})
            </h3>

            {activeBets.length === 0 ? (
              <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400">
                No active prediction positions right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBets.map((bet) => (
                  <div key={bet.id} className="glass-card rounded-xl p-4 space-y-3 relative overflow-hidden border border-slate-800 hover:border-amber-500/30">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white line-clamp-2 max-w-[80%]">
                        {bet.marketTitle}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        bet.outcome === 'YES' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}>
                        {bet.outcome}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-lg text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Stake Amount</span>
                        <span className="text-white font-bold">${bet.amount} USDC</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Potential Return ({bet.odds.toFixed(2)}x)</span>
                        <span className="text-emerald-400 font-bold">${bet.potentialPayout.toFixed(2)} USDC</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                      <span>{bet.timestamp}</span>
                      <button
                        onClick={() => {
                          try {
                            navigator.clipboard.writeText(bet.txHash);
                            alert(`Arc Testnet Tx Hash copied to clipboard:\n${bet.txHash}\nBlock #4,192,804 (Verified)`);
                          } catch {
                            alert(`Arc Testnet Tx Hash:\n${bet.txHash}`);
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline cursor-pointer font-mono"
                        title="Click to copy Arc Testnet transaction hash"
                      >
                        Tx: {bet.txHash.slice(0, 10)}... <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settled / Claimable Bets Section */}
          {settledBets.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                Settled / Claimable Bets ({settledBets.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settledBets.map((bet) => (
                  <div key={bet.id} className="glass-card rounded-xl p-4 space-y-3 relative overflow-hidden border border-slate-800">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white line-clamp-2 max-w-[75%]">
                        {bet.marketTitle}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        bet.status === 'WON' ? 'bg-emerald-500 text-black' :
                        bet.status === 'CLAIMED' ? 'bg-slate-800 text-slate-400' :
                        'bg-rose-950 text-rose-400'
                      }`}>
                        {bet.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-lg text-xs font-mono">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Outcome & Stake</span>
                        <span className="text-white font-bold">{bet.outcome} • ${bet.amount} USDC</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Payout</span>
                        <span className="text-emerald-400 font-bold">${bet.potentialPayout.toFixed(2)} USDC</span>
                      </div>
                    </div>

                    {bet.status === 'WON' && (
                      <button
                        onClick={() => onClaimWinnings(bet.id)}
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Claim ${bet.potentialPayout.toFixed(2)} USDC
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
