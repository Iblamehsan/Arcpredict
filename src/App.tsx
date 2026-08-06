import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketCard } from './components/MarketCard';
import { BetModal } from './components/BetModal';
import { ConnectWalletModal } from './components/ConnectWalletModal';
import { MyBetsView } from './components/MyBetsView';
import { LeaderboardView } from './components/LeaderboardView';
import { INITIAL_MARKETS, INITIAL_LEADERBOARD } from './data/markets';
import { Market, MarketCategory, UserBet } from './types';
import { Search, Filter, Sparkles, TrendingUp, ShieldCheck, CheckCircle2, Newspaper, Radio, Zap, ArrowUpRight } from 'lucide-react';
import { sendArcTestnetBetTransaction } from './utils/web3';

export default function App() {
  const [activeTab, setActiveTab] = useState<'markets' | 'mybets' | 'leaderboard'>('markets');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'ending_soon' | 'newest'>('popular');

  const [connectedAddress, setConnectedAddress] = useState<string>(() => {
    try {
      const savedAddr = localStorage.getItem('betonarc_address');
      if (savedAddr && savedAddr.startsWith('0x') && savedAddr.length === 42) return savedAddr;
    } catch {}
    return '';
  });
  const [walletConnected, setWalletConnected] = useState<boolean>(() => {
    try {
      const savedAddr = localStorage.getItem('betonarc_address');
      return !!(savedAddr && savedAddr.startsWith('0x') && savedAddr.length === 42);
    } catch {
      return false;
    }
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
    } catch {}
    return [];
  });

  const [activeBetModal, setActiveBetModal] = useState<{ market: Market; outcome: 'YES' | 'NO' } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with browser window.ethereum Web3 events
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const provider = (window as any).ethereum;

      provider.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts[0]) {
          setConnectedAddress(accounts[0]);
          setWalletConnected(true);
        }
      }).catch(() => {});

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts && accounts[0]) {
          setConnectedAddress(accounts[0]);
          setWalletConnected(true);
        } else {
          setConnectedAddress('');
          setWalletConnected(false);
          try {
            localStorage.removeItem('betonarc_address');
          } catch {}
        }
      };

      if (provider.on) {
        provider.on('accountsChanged', handleAccountsChanged);
      }

      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('betonarc_user_bets', JSON.stringify(userBets));
      localStorage.setItem('betonarc_usdc_balance', usdcBalance.toString());
      if (connectedAddress) {
        localStorage.setItem('betonarc_address', connectedAddress);
      } else {
        localStorage.removeItem('betonarc_address');
      }
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [userBets, usdcBalance, connectedAddress]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleOpenBetModal = (market: Market, outcome: 'YES' | 'NO') => {
    if (market.status === 'resolved') {
      triggerToast('This prediction market is already resolved and settled.');
      return;
    }
    if (!walletConnected || !connectedAddress) {
      setPendingBetModal({ market, outcome });
      setConnectWalletModalOpen(true);
      return;
    }
    setActiveBetModal({ market, outcome });
  };

  const handleWalletConnectedSuccess = (address: string) => {
    if (!address) return;
    setConnectedAddress(address);
    setWalletConnected(true);
    setConnectWalletModalOpen(false);
    const shortAddr = address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
    triggerToast(`Real Web3 Wallet Connected: ${shortAddr} on Arc Testnet (Chain 4192)`);
    if (pendingBetModal) {
      setActiveBetModal(pendingBetModal);
      setPendingBetModal(null);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setConnectedAddress('');
    try {
      localStorage.removeItem('betonarc_address');
    } catch {}
    triggerToast('Web3 Wallet Disconnected');
  };

  const handleConfirmBet = async (market: Market, outcome: 'YES' | 'NO', amount: number): Promise<string> => {
    if (!connectedAddress) {
      throw new Error('Please connect your Web3 wallet first.');
    }

    const odds = outcome === 'YES' ? market.oddsYes : market.oddsNo;
    const potentialPayout = amount * odds;

    // Execute real Arc Testnet transaction on user's Web3 wallet
    let txHash = '';
    try {
      txHash = await sendArcTestnetBetTransaction(connectedAddress, market.id, outcome, amount);
    } catch (err: any) {
      console.error('Arc transaction error:', err);
      throw new Error(err.message || 'Transaction failed or was rejected in your Web3 wallet.');
    }

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
      txHash: txHash,
      status: 'ACTIVE'
    };

    setUserBets(prev => [newBet, ...prev]);
    triggerToast(`Bet submitted on Arc Testnet! Tx Hash: ${txHash.slice(0, 10)}...`);
    return txHash;
  };

  const handleEarlyResolveMarket = (marketToResolve: Market) => {
    if (marketToResolve.status === 'resolved') return;

    const winningOutcome = marketToResolve.newsTrigger?.outcome || 'YES';
    const randomTxHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const nowTime = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // Update market state
    setMarkets(prev => prev.map(m => {
      if (m.id === marketToResolve.id) {
        return {
          ...m,
          status: 'resolved',
          winningOutcome: winningOutcome,
          resolvedAt: nowTime,
          resolutionHeadline: m.newsTrigger?.headline || 'Official Press Release Verified',
          resolutionTxHash: randomTxHash,
          probYes: winningOutcome === 'YES' ? 100 : 0,
          oddsYes: winningOutcome === 'YES' ? 1.00 : 0,
          oddsNo: winningOutcome === 'NO' ? 1.00 : 0,
          history: [...m.history, winningOutcome === 'YES' ? 100 : 0]
        };
      }
      return m;
    }));

    // Update user bets state for this market
    let totalWonPayout = 0;
    let wonCount = 0;

    setUserBets(prev => prev.map(bet => {
      if (bet.marketId === marketToResolve.id && bet.status === 'ACTIVE') {
        if (bet.outcome === winningOutcome) {
          totalWonPayout += bet.potentialPayout;
          wonCount++;
          return { ...bet, status: 'WON' };
        } else {
          return { ...bet, status: 'LOST' };
        }
      }
      return bet;
    }));

    if (wonCount > 0) {
      triggerToast(`EARLY RESOLUTION: Official News verified! ${winningOutcome} WINS! You have ${wonCount} winning position(s) claimable ($${totalWonPayout.toFixed(2)} USDC)!`);
    } else {
      triggerToast(`EARLY RESOLUTION: Official News verified! Market resolved ${winningOutcome} on Arc Testnet.`);
    }
  };

  const handleAutoResolveAllWithNews = () => {
    const activeWithNews = markets.filter(m => m.status !== 'resolved' && m.newsTrigger);
    if (activeWithNews.length === 0) {
      triggerToast('All news-eligible markets are currently resolved.');
      return;
    }

    activeWithNews.forEach(m => {
      handleEarlyResolveMarket(m);
    });
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
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? (market.status !== 'resolved') :
      (market.status === 'resolved');

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === '' || 
      market.title.toLowerCase().includes(query) ||
      market.category.toLowerCase().includes(query) ||
      market.resolutionSource.toLowerCase().includes(query) ||
      (market.resolutionHeadline && market.resolutionHeadline.toLowerCase().includes(query));

    return matchesCategory && matchesStatus && matchesSearch;
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
  const activeWithNewsCount = markets.filter(m => m.status !== 'resolved' && m.newsTrigger).length;

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
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-amber-950/90 border border-amber-500/80 text-amber-100 rounded-xl shadow-2xl backdrop-blur-md animate-bounce text-xs font-mono font-bold max-w-md">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
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
              Decentralized Arc Testnet Prediction Protocol
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Predict Real-World Outcomes with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Arc Speed & Precision</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Place non-custodial prediction bets across Crypto, AI, Sports, Macro, and World Events. Instant settlements with transparent oracle resolution on Arc Testnet.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Non-Custodial Arc Chain ID 4192</span>
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
              
              {/* Category & Status Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 mr-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      statusFilter === 'all' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({markets.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      statusFilter === 'active' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Active ({markets.filter(m => m.status !== 'resolved').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('resolved')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                      statusFilter === 'resolved' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Resolved ({markets.filter(m => m.status === 'resolved').length})
                  </button>
                </div>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-800 text-amber-400 border border-amber-500/40 font-bold'
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
                    placeholder="Search prediction markets or headlines..."
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
                  onClick={() => { setSelectedCategory('All'); setStatusFilter('all'); setSearchQuery(''); }}
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
                    onEarlyResolve={handleEarlyResolveMarket}
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
            <span>• Arc Testnet Non-Custodial Automated Prediction Protocol</span>
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

