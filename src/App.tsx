import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketCard } from './components/MarketCard';
import { BetModal } from './components/BetModal';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { MyBetsView } from './components/MyBetsView';
import { LeaderboardView } from './components/LeaderboardView';
import { INITIAL_MARKETS, INITIAL_LEADERBOARD } from './data/markets';
import { Market, MarketCategory, UserBet } from './types';
import { Search, Filter, Sparkles, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'markets' | 'mybets' | 'leaderboard'>('markets');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'ending_soon' | 'newest'>('popular');

  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [connectedAddress, setConnectedAddress] = useState<string>(() => {
    try {
      const savedAddr = localStorage.getItem('betonarc_address');
      if (savedAddr) return savedAddr;
    } catch {}
    return '0x7a23b109c1d0ef4890c2834b9e43df124f8b';
  });
  const [connectWalletModalOpen, setConnectWalletModalOpen] = useState<boolean>(false);
  const [pendingBetModal, setPendingBetModal] = useState<{ market: Market; outcome: 'YES' | 'NO' } | null>(null);

  const [usdcBalance, setUsdcBalance] = useState<number>(() => {
    try {
      const savedBal = localStorage.getItem('betonarc_usdc_balance');
      if (savedBal !== null && savedBal !== undefined) {
        return parseFloat(savedBal);
      }
    } catch {}
    return 2500;
  });

  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [userBets, setUserBets] = useState<UserBet[]>(() => {
    try {
      const saved = localStorage.getItem('betonarc_user_bets');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return [
      {
        id: 'bet_demo_1',
        marketId: 'btc-120k-2026',
        marketTitle: 'Will Bitcoin surpass $120,000 before December 2026?',
        outcome: 'YES',
        amount: 100,
        odds: 1.39,
        potentialPayout: 139,
        timestamp: 'Today, 10:15 AM',
        txHash: '0x8f199c2a71e843b019df018247ca811b',
        status: 'ACTIVE'
      },
      {
        id: 'bet_demo_2',
        marketId: 'arc-mainnet-launch',
        marketTitle: 'Will Arc Protocol Mainnet launch before Q4 2026?',
        outcome: 'YES',
        amount: 200,
        odds: 1.19,
        potentialPayout: 238,
        timestamp: 'Yesterday, 04:30 PM',
        txHash: '0x3e421092ab7c4129b80144f81c9a12a4',
        status: 'WON'
      }
    ];
  });

  const [activeBetModal, setActiveBetModal] = useState<{ market: Market; outcome: 'YES' | 'NO' } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('betonarc_user_bets', JSON.stringify(userBets));
      localStorage.setItem('betonarc_usdc_balance', usdcBalance.toString());
      localStorage.setItem('betonarc_address', connectedAddress);
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [userBets, usdcBalance, connectedAddress]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenBetModal = (market: Market, outcome: 'YES' | 'NO') => {
    if (!walletConnected) {
      setPendingBetModal({ market, outcome });
      setConnectWalletModalOpen(true);
      return;
    }
    setActiveBetModal({ market, outcome });
  };

  const handleWalletConnectedSuccess = (address?: string) => {
    const targetAddress = address || '0x7a23b109c1d0ef4890c2834b9e43df124f8b';
    setConnectedAddress(targetAddress);
    setWalletConnected(true);
    setConnectWalletModalOpen(false);
    const shortAddr = targetAddress.length > 12 ? `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}` : targetAddress;
    triggerToast(`EVM Wallet Connected: ${shortAddr} (Arc Testnet Chain 4192)`);
    if (pendingBetModal) {
      setActiveBetModal(pendingBetModal);
      setPendingBetModal(null);
    }
  };

  const handleConfirmBet = async (market: Market, outcome: 'YES' | 'NO', amount: number) => {
    const odds = outcome === 'YES' ? market.oddsYes : market.oddsNo;
    const potentialPayout = amount * odds;
    const randomTxHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // Deduct balance
    setUsdcBalance(prev => Math.max(0, prev - amount));

    // Dynamically calculate probability shift based on stake amount
    const deltaProb = Math.max(1, Math.min(5, Math.round(amount / 50)));
    const shift = outcome === 'YES' ? deltaProb : -deltaProb;
    const currentProb = market.probYes;
    const newProb = Math.max(1, Math.min(99, currentProb + shift));

    // Recalculate odds based on exact formula
    const newOddsYes = Number((100 / newProb).toFixed(2));
    const newOddsNo = Number((100 / (100 - newProb)).toFixed(2));

    // Update market statistics smoothly
    setMarkets(prev => prev.map(m => {
      if (m.id === market.id) {
        return {
          ...m,
          probYes: newProb,
          oddsYes: newOddsYes,
          oddsNo: newOddsNo,
          liquidityUsdc: m.liquidityUsdc + amount,
          totalBetsCount: m.totalBetsCount + 1,
          history: [...m.history, newProb]
        };
      }
      return m;
    }));

    // Add to user bets
    const newBet: UserBet = {
      id: 'bet_' + Date.now(),
      marketId: market.id,
      marketTitle: market.title,
      outcome,
      amount,
      odds,
      potentialPayout,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      txHash: randomTxHash,
      status: 'ACTIVE'
    };

    setUserBets(prev => [newBet, ...prev]);
    triggerToast(`Bet placed on ${outcome} for $${amount} USDC!`);
  };

  const handleClaimWinnings = (betId: string) => {
    const bet = userBets.find(b => b.id === betId);
    if (!bet) return;

    setUsdcBalance(prev => prev + bet.potentialPayout);
    setUserBets(prev => prev.map(b => b.id === betId ? { ...b, status: 'CLAIMED' } : b));
    triggerToast(`Claimed $${bet.potentialPayout.toFixed(2)} USDC to wallet!`);
  };

  // Filter & Sort Markets
  const categories: MarketCategory[] = ['All', 'Crypto', 'AI & Tech', 'Sports', 'Stocks & Macro', 'Politics'];

  const filteredMarkets = markets.filter(market => {
    const matchesCategory = selectedCategory === 'All' || market.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      market.title.toLowerCase().includes(query) ||
      market.category.toLowerCase().includes(query) ||
      market.resolutionSource.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.totalBetsCount - a.totalBetsCount;
    if (sortBy === 'ending_soon') {
      const dateA = new Date(a.endDate).getTime() || 0;
      const dateB = new Date(b.endDate).getTime() || 0;
      return dateA - dateB;
    }
    return 0;
  });

  const activeBetsCount = userBets.filter(b => b.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletConnected={walletConnected}
        setWalletConnected={(connected) => {
          if (connected) {
            setConnectWalletModalOpen(true);
          } else {
            setWalletConnected(false);
            triggerToast('Wallet disconnected');
          }
        }}
        usdcBalance={usdcBalance}
        activeBetsCount={activeBetsCount}
        connectedAddress={connectedAddress}
      />


      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 rounded-xl shadow-2xl backdrop-blur-md animate-bounce text-xs font-mono font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Banner Overview */}
        <section className="relative overflow-hidden glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/25 shadow-2xl">
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              Decentralized Arc Testnet Oracle
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Predict Real-World Outcomes with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Arc Speed & Precision</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Place non-custodial prediction bets across Crypto, AI, Sports, Macro, and World Events. Instant settlements with transparent oracle resolution on Arc.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Slashing Oracles</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Sub-Second Settlement</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Views */}
        {activeTab === 'markets' && (
          <div className="space-y-6">
            
            {/* Filter Controls Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 glass-card p-3.5 rounded-2xl border border-slate-800">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Sort */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prediction markets..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-slate-400">
                  <Filter className="w-3.5 h-3.5 text-amber-400" />
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="popular">Most Active</option>
                    <option value="ending_soon">Ending Soon</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Markets Grid */}
            {filteredMarkets.length === 0 ? (
              <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800">
                <p className="text-slate-400 text-sm">No prediction markets match your filter criteria.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 rounded-xl"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMarkets.map((market) => (
                  <MarketCard
                    key={market.id}
                    market={market}
                    onPlaceBet={handleOpenBetModal}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {activeTab === 'mybets' && (
          <MyBetsView
            userBets={userBets}
            walletConnected={walletConnected}
            onConnectWallet={() => setConnectWalletModalOpen(true)}
            onClaimWinnings={handleClaimWinnings}
            onExploreMarkets={() => setActiveTab('markets')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView leaderboard={INITIAL_LEADERBOARD} />
        )}

      </main>

      {/* Connect Wallet Modal */}
      {connectWalletModalOpen && (
        <ConnectWalletModal
          onClose={() => {
            setConnectWalletModalOpen(false);
            setPendingBetModal(null);
          }}
          onConnect={handleWalletConnectedSuccess}
          reason={pendingBetModal ? "You must connect your Web3 wallet before placing a prediction bet." : undefined}
        />
      )}

      {/* Bet Modal */}
      {activeBetModal && (
        <BetModal
          market={activeBetModal.market}
          outcome={activeBetModal.outcome}
          onClose={() => setActiveBetModal(null)}
          usdcBalance={usdcBalance}
          onConfirmBet={handleConfirmBet}
        />
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#030712] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">BETONARC</span>
            <span>• Arc Testnet Non-Custodial Prediction Protocol</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com/iblamehsan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-bold"
            >
              Created by Ehsan
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
