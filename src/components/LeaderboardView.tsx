import React from 'react';
import { LeaderboardUser } from '../types';
import { Trophy, Award, Medal, Flame } from 'lucide-react';

interface LeaderboardViewProps {
  leaderboard: LeaderboardUser[];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ leaderboard }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-2">
          <Trophy className="w-3.5 h-3.5" />
          Arc Testnet Predictors
        </div>
        <h2 className="text-2xl font-black text-white font-display">Top Prediction Market Traders</h2>
        <p className="text-xs text-slate-400 mt-1">
          Leaderboard updated live based on verified Arc Testnet oracle settlements and prediction win rates.
        </p>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">Predictor Address</th>
                <th className="py-3.5 px-4 text-center">Win Rate</th>
                <th className="py-3.5 px-4 text-center">Total Bets</th>
                <th className="py-3.5 px-4 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {leaderboard.map((user) => (
                <tr key={user.address} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 text-center font-bold">
                    {user.rank === 1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-extrabold mx-auto">
                        🥇
                      </span>
                    ) : user.rank === 2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-300 border border-slate-400/40 font-extrabold mx-auto">
                        🥈
                      </span>
                    ) : user.rank === 3 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 font-extrabold mx-auto">
                        🥉
                      </span>
                    ) : (
                      <span className="text-slate-400">#{user.rank}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    {user.address}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                    {user.winRate}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-300">
                    {user.wins} / {user.totalBets}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                    +${user.profitUsdc.toLocaleString()} USDC
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
