
import {
  AllocationItem,
  Asset,
  MarketInsight,
  MarketRegime,
  Portfolio,
  TopMover,
} from "@/types/market";


export const assets: Asset[] = [
  {
    id: "gold",
    symbol: "XAUUSD",
    name: "Gold",
    price: 2684.32,
    changePercent: 1.84,
    currency: "USD",
    category: "commodity",
    color: "#F5B82E",
  },
  {
    id: "bitcoin",
    symbol: "BTCUSD",
    name: "Bitcoin",
    price: 104231.5,
    changePercent: 4.82,
    currency: "USD",
    category: "crypto",
    color: "#F7931A",
  },
  {
    id: "nvidia",
    symbol: "NVDA",
    name: "NVIDIA",
    price: 181.73,
    changePercent: -1.26,
    currency: "USD",
    category: "stock",
    color: "#76B900",
  },
  {
    id: "sp500",
    symbol: "SPX",
    name: "S&P 500",
    price: 5214.36,
    changePercent: 0.92,
    currency: "USD",
    category: "index",
    color: "#EF4444",
  },
];

export const portfolio: Portfolio = {
  totalValue: 689372,
  currency: "USD",
  monthlyChangePercent: 5.12,
};

export const allocation: AllocationItem[] = [
  {
    name: "US Equities",
    percentage: 42,
    color: "#2878FF",
  },
  {
    name: "Commodities",
    percentage: 18,
    color: "#F5B82E",
  },
  {
    name: "Crypto",
    percentage: 15,
    color: "#16B981",
  },
  {
    name: "Global Markets",
    percentage: 15,
    color: "#7567E8",
  },
  {
    name: "Cash",
    percentage: 10,
    color: "#CBD5E1",
  },
];

export const marketRegime: MarketRegime = {
  name: "BULL MARKET",
  confidence: "Moderate Confidence",
  status: "live",
};

export const insights: MarketInsight[] = [
  {
    id: "1",
    title: "Gold continues upward trend",
    description: "Up 1.84% today, driven by USD weakness",
    timeAgo: "2h ago",
    type: "positive",
  },
  {
    id: "2",
    title: "Bitcoin shows strong momentum",
    description: "Breaking key resistance at $104K",
    timeAgo: "4h ago",
    type: "positive",
  },
  {
    id: "3",
    title: "NVIDIA under pressure",
    description: "Down 1.26% amid broader tech rotation",
    timeAgo: "6h ago",
    type: "negative",
  },
];

export const topMovers: TopMover[] = [
  {
    symbol: "NVDA",
    name: "NVIDIA",
    price: 181.73,
    changePercent: -1.26,
    direction: "down",
  },
  {
    symbol: "TSLA",
    name: "Tesla",
    price: 172.63,
    changePercent: 3.72,
    direction: "up",
  },
  {
    symbol: "AAPL",
    name: "Apple",
    price: 198.11,
    changePercent: 2.14,
    direction: "up",
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: 415.32,
    changePercent: 1.83,
    direction: "up",
  },
  {
    symbol: "AMZN",
    name: "Amazon",
    price: 178.24,
    changePercent: -0.92,
    direction: "down",
  },
];