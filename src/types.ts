export type MarketCategory = 'All' | 'Crypto' | 'AI & Tech' | 'Sports' | 'Stocks & Macro' | 'Politics';

export interface Market {
  id: string;
  title: string;
  category: MarketCategory;
  iconName: string;
  endDate: string;
  probYes: number; // e.g. 68 for 68%
  oddsYes: number; // e.g. 1.47
  oddsNo: number;  // e.g. 2.95
  liquidityUsdc: number; // Real pool liquidity in USDC e.g. 45000
  totalBetsCount: number;
  featured?: boolean;
  resolutionSource: string;
  history: number[]; // 7 points representing probability trend 0-100
  // Automated Early Resolution Fields
  status?: 'active' | 'resolved';
  winningOutcome?: 'YES' | 'NO';
  resolvedAt?: string;
  resolutionHeadline?: string;
  resolutionTxHash?: string;
  newsTrigger?: {
    headline: string;
    source: string;
    time: string;
    outcome: 'YES' | 'NO';
  };
}

export interface NewsAnnouncement {
  id: string;
  marketId: string;
  marketTitle: string;
  headline: string;
  source: string;
  timestamp: string;
  outcome: 'YES' | 'NO';
  txHash: string;
  isResolved: boolean;
}

export interface UserBet {
  id: string;
  marketId: string;
  marketTitle: string;
  outcome: 'YES' | 'NO';
  amount: number; // USDC
  odds: number;
  potentialPayout: number;
  timestamp: string;
  txHash: string;
  status: 'ACTIVE' | 'WON' | 'LOST' | 'CLAIMED';
}

export interface LeaderboardUser {
  rank: number;
  address: string;
  wins: number;
  totalBets: number;
  profitUsdc: number;
  winRate: string;
}

