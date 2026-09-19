const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/* =========================================================
   SYMBOL NORMALIZATION HELPERS
========================================================= */

export function normalizeSymbolToBackend(symbol: string): string {
  if (!symbol) return "NVDA";
  const upper = symbol.toUpperCase().trim();
  if (upper === "BTCUSD" || upper === "BITCOIN") return "BTC-USD";
  if (upper === "XAUUSD" || upper === "GOLD") return "GC=F";
  if (upper === "SPX" || upper === "SP500" || upper === "S&P 500" || upper === "MARKET COMPOSITE") return "SPX";
  if (upper === "NVIDIA") return "NVDA";
  return upper;
}

export function normalizeSymbolToFrontend(symbol: string): string {
  if (!symbol) return "NVDA";
  const upper = symbol.toUpperCase().trim();
  if (upper === "BTC-USD") return "BTCUSD";
  if (upper === "GC=F") return "XAUUSD";
  return upper;
}

/* =========================================================
   TYPE DEFINITIONS (FASTAPI ALIGNED)
========================================================= */

export interface AssetOverview {
  symbol: string;
  name: string;
  asset_type: string;
  currency: string;
  latest_price: number;
  previous_price: number | null;
  change_percent: number | null;
  data_start: string;
  data_end: string;
}

export interface AssetOverviewResponse {
  assets: AssetOverview[];
}

export interface MarketDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
}

export interface MarketDataResponse {
  symbol: string;
  timeframe: string;
  start_date: string;
  end_date: string;
  data: MarketDataPoint[];
}

export interface IndicatorParameters {
  sma_fast: number;
  sma_slow: number;
  ema_fast: number;
  ema_slow: number;
  rolling_window: number;
  volatility_window: number;
}

export interface IndicatorLatest {
  timestamp: string;
  price: number | null;
  sma_fast: number | null;
  sma_slow: number | null;
  ema_fast: number | null;
  ema_slow: number | null;
  daily_return: number | null;
  cumulative_return: number | null;
  rolling_return: number | null;
  historical_volatility: number | null;
  annualized_volatility: number | null;
  rolling_annualized_volatility: number | null;
}

export interface IndicatorPoint {
  timestamp: string;
  price: number | null;
  sma_fast: number | null;
  sma_slow: number | null;
  ema_fast: number | null;
  ema_slow: number | null;
  daily_return: number | null;
  cumulative_return: number | null;
  rolling_return: number | null;
  historical_volatility: number | null;
  annualized_volatility: number | null;
}

export interface IndicatorResponse {
  symbol: string;
  observations: number;
  parameters: IndicatorParameters;
  latest: IndicatorLatest;
  series: IndicatorPoint[];
}

export interface RiskMetricsResponse {
  symbol: string;
  observations: number;
  mean_daily_return: number | null;
  annualized_return: number | null;
  historical_volatility: number | null;
  annualized_volatility: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
}

export interface CorrelationResponse {
  method: string;
  assets: string[];
  observations: number;
  matrix: Record<string, Record<string, number | null>>;
}

export interface RollingCorrelationPoint {
  timestamp: string;
  correlation: number;
}

export interface RollingCorrelationResponse {
  asset_a: string;
  asset_b: string;
  window: number;
  observations: number;
  data: RollingCorrelationPoint[];
}

export interface StrategyInfo {
  name: string;
}

export interface StrategyListResponse {
  strategies: StrategyInfo[];
}

export interface StrategySignalRequest {
  symbol: string;
  strategy: string;
  parameters?: Record<string, unknown>;
}

export interface StrategySignalPoint {
  timestamp: string;
  signal: number;
  close: number;
}

export interface SignalCounts {
  buy_or_long: number;
  hold_or_no_position: number;
  sell_or_short: number;
}

export interface StrategySignalResponse {
  symbol: string;
  strategy: string;
  parameters: Record<string, unknown>;
  observations: number;
  latest_signal: number;
  signal_counts: SignalCounts;
  signals: StrategySignalPoint[];
}

export interface BacktestRequest {
  symbol: string;
  strategy: string;
  parameters?: Record<string, unknown>;
  initial_capital?: number;
  transaction_cost?: number;
  slippage?: number;
  risk_free_rate?: number;
}

export interface TradeResponse {
  side: string;
  quantity: number;
  entry_price: number;
  entry_time: string;
  exit_price: number | null;
  exit_time: string | null;
  fees: number;
  pnl: number | null;
}

export interface BacktestMetrics {
  initial_capital: number;
  final_capital: number;
  total_return: number;
  annualized_return: number;
  annualized_volatility: number;
  sharpe_ratio: number;
  maximum_drawdown: number;
  trade_count: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  average_trade_pnl: number;
  gross_profit: number;
  gross_loss: number;
  profit_factor: number;
}

export interface BacktestConfig {
  initial_capital: number;
  final_capital: number;
  total_return: number;
  transaction_cost: number;
  slippage: number;
  start_date: string;
  end_date: string;
}

export interface BenchmarkResponse {
  name: string;
  initial_capital: number;
  final_capital: number;
  total_return: number;
  equity_curve: number[];
}

export interface ComparisonResponse {
  strategy_metrics: Record<string, unknown>;
  benchmark_metrics: Record<string, unknown>;
  return_difference: number;
  final_capital_difference: number;
  strategy_outperformed: boolean;
}

export interface BacktestResponse {
  experiment_id: number;
  symbol: string;
  strategy: { name: string; parameters: Record<string, unknown> };
  backtest: BacktestConfig;
  metrics: BacktestMetrics;
  trades: TradeResponse[];
  equity_curve: number[];
  benchmark: BenchmarkResponse;
  comparison: ComparisonResponse;
}

export interface RobustnessRequest {
  symbol: string;
  strategy: string;
  parameter_grid: Record<string, unknown[]>;
  transaction_costs?: number[];
  slippages?: number[];
  initial_capital?: number;
}

export interface RobustnessExperiment {
  parameters: Record<string, unknown>;
  transaction_cost: number;
  slippage: number;
  final_capital: number;
  total_return: number;
  annualized_return: number;
  annualized_volatility: number;
  sharpe_ratio: number;
  maximum_drawdown: number;
  trade_count: number;
}

export interface SensitivityStatistics {
  experiment_count: number;
  mean_return: number;
  median_return: number;
  minimum_return: number;
  maximum_return: number;
}

export interface RobustnessResponse {
  symbol: string;
  strategy: string;
  initial_capital: number;
  experiment_count: number;
  parameter_grid: Record<string, unknown[]>;
  transaction_costs: number[];
  slippages: number[];
  return_statistics: {
    minimum: number;
    maximum: number;
    mean: number;
    median: number;
    standard_deviation: number;
  };
  best_by_return: RobustnessExperiment | null;
  worst_by_return: RobustnessExperiment | null;
  best_by_sharpe: RobustnessExperiment | null;
  lowest_drawdown: RobustnessExperiment | null;
  results: RobustnessExperiment[];
}

export interface RegimeParameters {
  return_window: number;
  volatility_window: number;
}

export interface RegimeDistributionItem {
  periods: number;
  percentage: number;
}

export interface RegimePerformanceItem {
  periods: number;
  total_return: number;
  average_return: number;
  volatility: number;
  positive_periods: number;
  negative_periods: number;
}

export interface RegimePoint {
  timestamp: string;
  regime: string;
  price: number;
}

export interface RegimeResponse {
  symbol: string;
  observations: number;
  parameters: RegimeParameters;
  latest_regime: string | null;
  distribution: Record<string, RegimeDistributionItem>;
  performance: Record<string, RegimePerformanceItem>;
  series: RegimePoint[];
}

/* =========================================================
   GENERIC API REQUEST WRAPPER
========================================================= */

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
}

/* =========================================================
   API CLIENT FUNCTIONS
========================================================= */

export async function getAssets(): Promise<AssetOverviewResponse> {
  return apiRequest<AssetOverviewResponse>("/api/v1/assets/overview");
}

export async function getAssetOverview(symbol: string): Promise<AssetOverview> {
  const backendSymbol = normalizeSymbolToBackend(symbol);
  return apiRequest<AssetOverview>(`/api/v1/assets/${encodeURIComponent(backendSymbol)}`);
}

export async function getMarketData(symbol: string): Promise<MarketDataResponse> {
  const backendSymbol = normalizeSymbolToBackend(symbol);
  return apiRequest<MarketDataResponse>(`/api/v1/market-data/${encodeURIComponent(backendSymbol)}`);
}

export async function getRiskMetrics(symbol: string): Promise<RiskMetricsResponse> {
  const backendSymbol = normalizeSymbolToBackend(symbol);
  return apiRequest<RiskMetricsResponse>(`/api/v1/risk/${encodeURIComponent(backendSymbol)}`);
}

export async function getTechnicalIndicators(
  symbol: string,
  params?: {
    smaFast?: number;
    smaSlow?: number;
    emaFast?: number;
    emaSlow?: number;
    rollingWindow?: number;
    volatilityWindow?: number;
  }
): Promise<IndicatorResponse> {
  const backendSymbol = normalizeSymbolToBackend(symbol);
  const query = new URLSearchParams();
  if (params?.smaFast) query.set("sma_fast", params.smaFast.toString());
  if (params?.smaSlow) query.set("sma_slow", params.smaSlow.toString());
  if (params?.emaFast) query.set("ema_fast", params.emaFast.toString());
  if (params?.emaSlow) query.set("ema_slow", params.emaSlow.toString());
  if (params?.rollingWindow) query.set("rolling_window", params.rollingWindow.toString());
  if (params?.volatilityWindow) query.set("volatility_window", params.volatilityWindow.toString());

  const queryString = query.toString();
  const endpoint = `/api/v1/indicators/${encodeURIComponent(backendSymbol)}${queryString ? `?${queryString}` : ""}`;
  return apiRequest<IndicatorResponse>(endpoint);
}

export async function getCorrelationMatrix(
  symbols: string[] = ["NVDA", "BTC-USD", "GC=F"],
  method: string = "pearson"
): Promise<CorrelationResponse> {
  const backendSymbols = symbols.map(normalizeSymbolToBackend).join(",");
  const query = new URLSearchParams({
    symbols: backendSymbols,
    method,
  });
  return apiRequest<CorrelationResponse>(`/api/v1/correlation?${query.toString()}`);
}

export async function getRollingCorrelation(
  assetA: string,
  assetB: string,
  window: number = 30
): Promise<RollingCorrelationResponse> {
  const backendA = normalizeSymbolToBackend(assetA);
  const backendB = normalizeSymbolToBackend(assetB);
  const query = new URLSearchParams({
    asset_a: backendA,
    asset_b: backendB,
    window: window.toString(),
  });
  return apiRequest<RollingCorrelationResponse>(`/api/v1/correlation/rolling?${query.toString()}`);
}

export async function getAvailableStrategies(): Promise<StrategyListResponse> {
  return apiRequest<StrategyListResponse>("/api/v1/strategies");
}

export async function generateStrategySignals(
  req: StrategySignalRequest
): Promise<StrategySignalResponse> {
  const payload = {
    ...req,
    symbol: normalizeSymbolToBackend(req.symbol),
  };
  return apiRequest<StrategySignalResponse>("/api/v1/strategies/signals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runBacktest(
  req: BacktestRequest
): Promise<BacktestResponse> {
  const payload = {
    ...req,
    symbol: normalizeSymbolToBackend(req.symbol),
  };
  return apiRequest<BacktestResponse>("/api/v1/backtests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function runRobustness(
  req: RobustnessRequest
): Promise<RobustnessResponse> {
  const payload = {
    ...req,
    symbol: normalizeSymbolToBackend(req.symbol),
  };
  return apiRequest<RobustnessResponse>("/api/v1/robustness", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRegimeAnalysis(
  symbol: string,
  returnWindow: number = 20,
  volatilityWindow: number = 20
): Promise<RegimeResponse> {
  const backendSymbol = normalizeSymbolToBackend(symbol);
  const query = new URLSearchParams({
    return_window: returnWindow.toString(),
    volatility_window: volatilityWindow.toString(),
  });
  return apiRequest<RegimeResponse>(`/api/v1/regimes/${encodeURIComponent(backendSymbol)}?${query.toString()}`);
}