import React, { useState } from 'react';
import { X, Wallet, ShieldCheck, Loader2, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { connectWeb3Account } from '../utils/web3';

interface ConnectWalletModalProps {
  onClose: () => void;
  onConnect: (address: string) => void;
  reason?: string;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  onClose,
  onConnect,
  reason,
}) => {
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [successProvider, setSuccessProvider] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const walletProviders = [
    {
      id: 'metamask',
      name: 'MetaMask',
      badge: 'RECOMMENDED',
      icon: '🦊',
      description: 'Connect using MetaMask Web3 browser extension',
    },
    {
      id: 'okx',
      name: 'OKX Wallet',
      badge: 'POPULAR',
      icon: '⬛',
      description: 'Connect using OKX Web3 multi-chain wallet',
    },
    {
      id: 'phantom',
      name: 'Phantom Wallet',
      badge: '',
      icon: '👻',
      description: 'Connect using Phantom multi-chain wallet',
    },
    {
      id: 'trust',
      name: 'Trust Wallet',
      badge: '',
      icon: '🛡️',
      description: 'Connect using Trust Wallet EVM extension or mobile app',
    },
  ];

  const handleSelectProvider = async (id: string) => {
    setConnectingProvider(id);
    setConnectError(null);

    try {
      const realAddress = await connectWeb3Account(id);
      setSuccessProvider(id);
      setConnectingProvider(null);
      setTimeout(() => {
        onConnect(realAddress);
      }, 500);
    } catch (err: any) {
      setConnectingProvider(null);
      const msg = err.message || 'Failed to connect Web3 wallet';
      setConnectError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel rounded-2xl border border-amber-500/30 p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center pb-4 mb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Wallet className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white font-display">Connect Web3 Wallet</h3>
          <p className="text-xs text-slate-400 mt-1">
            {reason || 'Connect your real non-custodial wallet to sign transactions safely on Arc Testnet (Chain ID: 4192).'}
          </p>
        </div>

        {/* Providers List */}
        <div className="space-y-2.5">
          {walletProviders.map((provider) => {
            const isConnecting = connectingProvider === provider.id;
            const isSuccess = successProvider === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => handleSelectProvider(provider.id)}
                disabled={!!connectingProvider || !!successProvider}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                  isSuccess
                    ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : isConnecting
                    ? 'bg-amber-950/60 border-amber-500/80 text-amber-300'
                    : 'bg-slate-900/70 hover:bg-slate-800/90 border-slate-800 hover:border-amber-500/40 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono">{provider.name}</span>
                      {provider.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {provider.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {provider.description}
                    </span>
                  </div>
                </div>

                <div>
                  {isConnecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Error Alert */}
        {connectError && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="leading-relaxed font-mono text-[11px]">
              {connectError}
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% On-Chain & Non-Custodial
          </span>
          <span className="text-slate-400">Arc EVM Chain ID: <strong className="text-white">4192</strong></span>
        </div>

      </div>
    </div>
  );
};

