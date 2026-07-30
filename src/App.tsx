import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketCard } from './components/MarketCard';
import { BetModal } from './components/BetModal';
import { MyBetsView } from './components/MyBetsView';
import { LeaderboardView } from './components/LeaderboardView';
import { FaucetModal } from './components/FaucetModal';
import { INITIAL_MARKETS, INITIAL_LEADERBOARD } from './data/markets';
import { Market, MarketCategory, UserBet } from './types';
import { Search, Filter, Sparkles, TrendingUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'markets' | 'mybets' | 'leaderboard'>('markets');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'ending_soon' | 'newest'>('popular');

  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [usdcBalance, setUsdcBalance] = useState<number>(2500);
  const [arcBalance, setArcBalance] = useState<number>(12.50);

  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [userBets, setUserBets] = useState<UserBet[]>(() => {
    try {
      const saved = localStorage.getItem('betonarc_user_bets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeBetModal, setActiveBetModal] = useState<{ market: Market; outcome: 'YES' | 'NO' } | null>(null);
  const [faucetModalOpen, setFaucetModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('betonarc_user_bets', JSON.stringify(userBets));
    } catch (e) {
      console.error('Failed to save bets', e);
    }
  }, [userBets]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleOpenBetModal = (market: Market, outcome: 'YES' | 'NO') => {
    if (!walletConnected) {
      setWalletConnected(true);
    }
    setActiveBetModal({ market, outcome });
  };

  const handleConfirmBet = async (market: Market, outcome: 'YES' | 'NO', amount: number) => {
    const odds = outcome === 'YES' ? market.oddsYes : market.oddsNo;
    const potentialPayout = amount * odds;
    const randomTxHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // Deduct balance
    setUsdcBalance(prev => Math.max(0, prev - amount));
    setArcBalance(prev => Math.max(0, prev - 0.001));

    // Update market statistics smoothly
    setMarkets(prev => prev.map(m => {
      if (m.id === market.id) {
        return {
          ...m,
          liquidityUsdc: m.liquidityUsdc + amount,
          totalBetsCount: m.totalBetsCount + 1
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

  const handleClaimFaucetTokens = (addedUsdc: number, addedArc: number) => {
    setUsdcBalance(prev => prev + addedUsdc);
    setArcBalance(prev => prev + addedArc);
    triggerToast(`Faucet claimed: +${addedUsdc} USDC & +${addedArc} ARC`);
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
    const matchesSearch = searchQuery === '' || 
      market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'popular') return b.totalBetsCount - a.totalBetsCount;
    if (sortBy === 'ending_soon') return a.endDate.localeCompare(b.endDate);
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
        setWalletConnected={setWalletConnected}
        usdcBalance={usdcBalance}
        arcBalance={arcBalance}
        onOpenFaucet={() => setFaucetModalOpen(true)}
        activeBetsCount={activeBetsCount}
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
            onClaimWinnings={handleClaimWinnings}
            onExploreMarkets={() => setActiveTab('markets')}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView leaderboard={INITIAL_LEADERBOARD} />
        )}

      </main>

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

      {/* Faucet Modal */}
      {faucetModalOpen && (
        <FaucetModal
          onClose={() => setFaucetModalOpen(false)}
          onClaimFaucetTokens={handleClaimFaucetTokens}
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
