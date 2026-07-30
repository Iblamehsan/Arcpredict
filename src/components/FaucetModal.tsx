import React, { useState } from 'react';
import { X, Droplets, CheckCircle2, ArrowRight } from 'lucide-react';

interface FaucetModalProps {
  onClose: () => void;
  onClaimFaucetTokens: (usdc: number, arc: number) => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({ onClose, onClaimFaucetTokens }) => {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    onClaimFaucetTokens(1000, 10);
    setClaimed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm glass-panel rounded-2xl border border-cyan-500/30 p-6 shadow-2xl overflow-hidden text-center">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
          <Droplets className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-white font-display">Arc Testnet Faucet</h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          Get free Arc Testnet tokens to test prediction market betting.
        </p>

        {claimed ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              +1,000 USDC & +10 ARC Claimed!
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
            >
              Start Betting Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Testnet USDC:</span>
                <span className="text-amber-400 font-bold">+1,000.00 USDC</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Arc Gas Token:</span>
                <span className="text-cyan-400 font-bold">+10.00 ARC</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-800">
                <span>Cooldown:</span>
                <span>24 Hours</span>
              </div>
            </div>

            <button
              onClick={handleClaim}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              Claim Testnet Tokens
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
