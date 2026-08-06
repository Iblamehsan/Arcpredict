import { Market, LeaderboardUser, NewsAnnouncement } from '../types';

export const INITIAL_MARKETS: Market[] = [
  // Crypto
  {
    id: 'btc-120k-2026',
    title: 'Will Bitcoin surpass $120,000 before December 2026?',
    category: 'Crypto',
    iconName: 'Bitcoin',
    endDate: 'Dec 31, 2026',
    probYes: 72,
    oddsYes: 1.39,
    oddsNo: 3.57,
    liquidityUsdc: 128500,
    totalBetsCount: 1420,
    featured: true,
    resolutionSource: 'Binance / CoinGecko BTC Spot Price',
    history: [45, 52, 58, 63, 60, 68, 72],
    status: 'active',
    newsTrigger: {
      headline: 'Binance & CoinGecko BTC/USD spot index confirms Bitcoin breached $120,450 level.',
      source: 'Binance / CoinGecko Spot Feed',
      time: 'Just now',
      outcome: 'YES'
    }
  },
  {
    id: 'eth-layer2-tvl-100b',
    title: 'Will Ethereum Layer-2 Total Value Locked reach $100 Billion in 2026?',
    category: 'Crypto',
    iconName: 'Coins',
    endDate: 'Dec 31, 2026',
    probYes: 61,
    oddsYes: 1.64,
    oddsNo: 2.56,
    liquidityUsdc: 84200,
    totalBetsCount: 890,
    featured: true,
    resolutionSource: 'L2Beat TVL Aggregate Data',
    history: [38, 42, 49, 53, 58, 55, 61],
    status: 'active',
    newsTrigger: {
      headline: 'L2Beat Official Data: Combined Ethereum Layer-2 TVL crosses $102.4 Billion milestone.',
      source: 'L2Beat Official Analytics',
      time: '12 mins ago',
      outcome: 'YES'
    }
  },
  {
    id: 'solana-sol-350',
    title: 'Will Solana (SOL) reach $350 before December 2026?',
    category: 'Crypto',
    iconName: 'Zap',
    endDate: 'Dec 01, 2026',
    probYes: 48,
    oddsYes: 2.08,
    oddsNo: 1.92,
    liquidityUsdc: 62000,
    totalBetsCount: 710,
    resolutionSource: 'Pyth Oracle SOL/USD Feed',
    history: [30, 35, 42, 51, 46, 50, 48],
    status: 'active',
    newsTrigger: {
      headline: 'Pyth Network SOL/USD Oracle Feed validates maximum 24h high of $354.20.',
      source: 'Pyth Network Oracle On-Chain',
      time: '5 mins ago',
      outcome: 'YES'
    }
  },
  {
    id: 'arc-mainnet-launch',
    title: 'Will Arc Protocol Mainnet launch before Q4 2026?',
    category: 'Crypto',
    iconName: 'Layers',
    endDate: 'Nov 30, 2026',
    probYes: 100,
    oddsYes: 1.00,
    oddsNo: 0,
    liquidityUsdc: 195000,
    totalBetsCount: 2310,
    featured: true,
    resolutionSource: 'Arc Official Foundation Announcement',
    history: [50, 62, 70, 75, 80, 92, 100],
    status: 'resolved',
    winningOutcome: 'YES',
    resolvedAt: 'Aug 05, 2026',
    resolutionHeadline: 'BREAKING: Arc Foundation Official Press Release confirms Arc Mainnet Genesis Block launch.',
    resolutionTxHash: '0x4f92c1a883e0129b441c092a831e98bb4f2',
    newsTrigger: {
      headline: 'BREAKING: Arc Foundation Official Press Release confirms Arc Mainnet Genesis Block launch.',
      source: 'Arc Protocol Official Press',
      time: 'Official Release',
      outcome: 'YES'
    }
  },

  // AI & Tech
  {
    id: 'gpt5-release-2026',
    title: 'Will OpenAI release GPT-5 or equivalent flagship AI model in 2026?',
    category: 'AI & Tech',
    iconName: 'Cpu',
    endDate: 'Dec 15, 2026',
    probYes: 79,
    oddsYes: 1.27,
    oddsNo: 4.76,
    liquidityUsdc: 110400,
    totalBetsCount: 1650,
    featured: true,
    resolutionSource: 'OpenAI Official Blog / Keynote',
    history: [55, 60, 68, 71, 74, 76, 79],
    status: 'active',
    newsTrigger: {
      headline: 'OFFICIAL: OpenAI publishes blog post launching Next-Gen Frontier Model GPT-5.',
      source: 'OpenAI Official Press & Keynote',
      time: '2 hours ago',
      outcome: 'YES'
    }
  },
  {
    id: 'spacex-starship-mars',
    title: 'Will SpaceX Starship complete an uncrewed Mars orbital landing test in 2026?',
    category: 'AI & Tech',
    iconName: 'Rocket',
    endDate: 'Dec 31, 2026',
    probYes: 38,
    oddsYes: 2.63,
    oddsNo: 1.61,
    liquidityUsdc: 49000,
    totalBetsCount: 620,
    resolutionSource: 'NASA / SpaceX Mission Control',
    history: [25, 28, 32, 30, 36, 35, 38],
    status: 'active',
    newsTrigger: {
      headline: 'SpaceX Mission Control statement reschedules uncrewed Mars launch window to early 2027.',
      source: 'SpaceX / NASA Mission Bulletin',
      time: '1 hour ago',
      outcome: 'NO'
    }
  },
  {
    id: 'apple-foldable-device',
    title: 'Will Apple officially announce a foldable iPhone or Smart Glasses in 2026?',
    category: 'AI & Tech',
    iconName: 'Smartphone',
    endDate: 'Nov 15, 2026',
    probYes: 42,
    oddsYes: 2.38,
    oddsNo: 1.72,
    liquidityUsdc: 38500,
    totalBetsCount: 530,
    resolutionSource: 'Apple WWDC / Special Keynote Event',
    history: [20, 25, 30, 38, 40, 45, 42],
    status: 'active',
    newsTrigger: {
      headline: 'Apple Special Event Keynote confirms announcement of Apple Glass AI Smart Glasses.',
      source: 'Apple Newsroom Press Release',
      time: '45 mins ago',
      outcome: 'YES'
    }
  },

  // Sports
  {
    id: 'premier-league-2027-champion',
    title: 'Will Manchester City or Arsenal win the 2026/2027 English Premier League title?',
    category: 'Sports',
    iconName: 'Trophy',
    endDate: 'May 23, 2027',
    probYes: 62,
    oddsYes: 1.61,
    oddsNo: 2.63,
    liquidityUsdc: 142000,
    totalBetsCount: 1890,
    featured: true,
    resolutionSource: 'Premier League Official Standings & Trophy Presentation',
    history: [50, 52, 55, 58, 57, 60, 62],
    status: 'active'
  },
  {
    id: 'champions-league-2027',
    title: 'Will Real Madrid or Manchester City win the 2026/2027 UEFA Champions League?',
    category: 'Sports',
    iconName: 'Medal',
    endDate: 'May 29, 2027',
    probYes: 54,
    oddsYes: 1.85,
    oddsNo: 2.17,
    liquidityUsdc: 76000,
    totalBetsCount: 940,
    resolutionSource: 'UEFA Official Final Scoreboard',
    history: [48, 50, 52, 51, 53, 52, 54],
    status: 'active'
  },
  {
    id: 'nba-championship-2027',
    title: 'Will the Boston Celtics win the 2026/2027 NBA Championship?',
    category: 'Sports',
    iconName: 'Trophy',
    endDate: 'Jun 20, 2027',
    probYes: 45,
    oddsYes: 2.22,
    oddsNo: 1.82,
    liquidityUsdc: 65000,
    totalBetsCount: 810,
    resolutionSource: 'NBA Official Finals Box Score',
    history: [35, 38, 40, 42, 41, 43, 45],
    status: 'active'
  },

  // Stocks & Macro
  {
    id: 'fed-interest-rate-cut',
    title: 'Will US Federal Reserve cut benchmark interest rates below 3.50% before 2027?',
    category: 'Stocks & Macro',
    iconName: 'TrendingUp',
    endDate: 'Dec 18, 2026',
    probYes: 58,
    oddsYes: 1.72,
    oddsNo: 2.38,
    liquidityUsdc: 92000,
    totalBetsCount: 1120,
    resolutionSource: 'Federal Reserve FOMC Policy Statement',
    history: [40, 45, 50, 52, 55, 56, 58],
    status: 'active',
    newsTrigger: {
      headline: 'FOMC Statement: US Federal Reserve reduces target federal funds rate range down to 3.25%-3.50%.',
      source: 'Federal Reserve Official FOMC Release',
      time: '30 mins ago',
      outcome: 'YES'
    }
  },
  {
    id: 'nvidia-market-cap-4t',
    title: 'Will Nvidia market capitalization exceed $4.5 Trillion before December 2026?',
    category: 'Stocks & Macro',
    iconName: 'BarChart3',
    endDate: 'Dec 31, 2026',
    probYes: 73,
    oddsYes: 1.37,
    oddsNo: 3.70,
    liquidityUsdc: 105000,
    totalBetsCount: 1340,
    resolutionSource: 'NASDAQ / Bloomberg Terminal Market Cap',
    history: [50, 58, 62, 67, 70, 71, 73],
    status: 'active',
    newsTrigger: {
      headline: 'NASDAQ Closing Bell: Nvidia (NVDA) market cap officially reaches $4.52 Trillion.',
      source: 'NASDAQ / Bloomberg Terminal Verified',
      time: '15 mins ago',
      outcome: 'YES'
    }
  },

  // Politics
  {
    id: 'us-midterm-elections-2026',
    title: 'Will Republicans retain control of the US House of Representatives in November 2026?',
    category: 'Politics',
    iconName: 'Vote',
    endDate: 'Nov 05, 2026',
    probYes: 52,
    oddsYes: 1.92,
    oddsNo: 2.08,
    liquidityUsdc: 88000,
    totalBetsCount: 1050,
    resolutionSource: 'AP News Certified Election Returns',
    history: [48, 50, 51, 52, 53, 51, 52],
    status: 'active'
  }
];

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, address: '0x8f2a...910d', wins: 48, totalBets: 52, profitUsdc: 14250, winRate: '92.3%' },
  { rank: 2, address: '0x3c1b...44a1', wins: 39, totalBets: 45, profitUsdc: 9820, winRate: '86.7%' },
  { rank: 3, address: '0x7e4f...118c', wins: 34, totalBets: 41, profitUsdc: 7410, winRate: '82.9%' },
  { rank: 4, address: '0x9a2d...883b', wins: 29, totalBets: 36, profitUsdc: 5120, winRate: '80.5%' },
  { rank: 5, address: '0x12bc...66d9', wins: 24, totalBets: 31, profitUsdc: 3890, winRate: '77.4%' }
];

