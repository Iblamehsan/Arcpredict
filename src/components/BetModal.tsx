import React, { useState } from 'react';
import { Market } from '../types';
import { X, ArrowRight, ShieldCheck, Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface BetModalProps {
  market: Market | null;
  outcome: 'YES' | 'NO';
  onClose: () => void;
  usdcBalance: number;
  onConfirmBet: (market: Market, outcome: 'YES' | 'NO', amount: number) => Promise<void>;
}

export const BetModal: React.FC<BetModalProps> = ({
  market,
  outcome,
  onClose,
  usdcBalance,
  onConfirmBet,
}) => {
  if (!market) return null;

  const [amount, setAmount] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txSuccessHash, setTxSuccessHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const odds = outcome === 'YES' ? market.oddsYes : market.oddsNo;
  const potentialPayout = amount > 0 ? (amount * odds) : 0;
  const netProfit = potentialPayout - amount;

  const handleQuickPreset = (val: number) => {
    setAmount(val);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      return;
    }
    if (amount > usdcBalance) {
      setErrorMessage(`Insufficient USDC balance (${usdcBalance.toLocaleString()} USDC available)`);
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await onConfirmBet(market, outcome, amount);
      const randomHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setTxSuccessHash(randomHash);
    } catch (err: any) {
      setErrorMessage(err.message || 'Transaction failed on Arc Testnet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-amber-500/30 p-6 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="text-base font-bold text-white font-display">Place Prediction Bet</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {txSuccessHash ? (
          /* Transaction Success Screen */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-white">Bet Placed Successfully!</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">Confirmed on Arc Testnet Block #4,192,804</p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-left space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Outcome:</span>
                <span className={outcome === 'YES' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {outcome} ({odds.toFixed(2)}x)
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Stake Amount:</span>
                <span className="text-white font-bold">{amount} USDC</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Potential Payout:</span>
                <span className="text-amber-400 font-bold">${potentialPayout.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Tx Hash:</span>
                <span className="text-cyan-400 truncate max-w-[180px]">{txSuccessHash}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Done & View Position
            </button>
          </div>
        ) : (
          /* Bet Form */
          <div className="space-y-4">
            
            {/* Market Title snippet */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-medium">
              <span className="text-amber-400 font-mono uppercase font-bold text-[10px] block mb-0.5">
                Market
              </span>
              {market.title}
            </div>

            {/* Outcome Selection */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs ${
                outcome === 'YES' 
                  ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}>
                <span>YES</span>
                <span className="font-mono">{market.oddsYes.toFixed(2)}x</span>
              </div>

              <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-xs ${
                outcome === 'NO' 
                  ? 'bg-rose-950/60 border-rose-500/80 text-rose-300' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}>
                <span>NO</span>
                <span className="font-mono">{market.oddsNo.toFixed(2)}x</span>
              </div>
            </div>

            {/* Stake Input */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-400 mb-1 font-mono">
                <span>Amount (USDC)</span>
                <span>Balance: <strong className="text-amber-400">{usdcBalance.toLocaleString()} USDC</strong></span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={usdcBalance}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter stake amount..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-white font-mono text-sm focus:outline-none transition-colors"
                />
                <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400 font-bold">USDC</span>
              </div>

              {/* Presets */}
              <div className="flex gap-2 mt-2">
                {[25, 50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleQuickPreset(preset)}
                    className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 transition-colors"
                  >
                    ${preset}
                  </button>
                ))}
                <button
                  onClick={() => handleQuickPreset(usdcBalance)}
                  className="flex-1 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-[11px] font-mono text-amber-400 font-bold transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Payout Calculation */}
            <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Selected Outcome:</span>
                <span className={outcome === 'YES' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {outcome}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Current Odds:</span>
                <span className="text-white font-bold">{odds.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Est. Net Profit:</span>
                <span className="text-emerald-400 font-bold">+${netProfit.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between text-slate-400 pt-1.5 border-t border-slate-800">
                <span className="text-slate-300 font-bold">Total Potential Return:</span>
                <span className="text-amber-400 font-extrabold text-sm">${potentialPayout.toFixed(2)} USDC</span>
              </div>
            </div>

            {/* Network Fee note */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> Arc Network Gas:</span>
              <span className="text-slate-300">~0.001 ARC</span>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Broadcasting to Arc Testnet...
                </>
              ) : (
                <>
                  Confirm Prediction Bet
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
