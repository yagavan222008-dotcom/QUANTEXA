export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  currency: string;
  category: string;
  color: string;
}

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface AssetPerformance {
  assetId: string;
  data: PerformancePoint[];
}

export interface Portfolio {
  totalValue: number;
  currency: string;
  monthlyChangePercent: number;
}

export interface AllocationItem {
  name: string;
  percentage: number;
  color: string;
}

export interface MarketRegime {
  name: string;
  confidence: string;
  status: "live" | "offline";
}

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: "positive" | "neutral" | "negative";
}

export interface TopMover {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  direction: "up" | "down";
}