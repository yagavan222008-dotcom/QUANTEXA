import { Asset } from "@/types/market";

export type AnalysisPeriod =
  | "1M"
  | "3M"
  | "6M"
  | "1Y"
  | "3Y"
  | "5Y"
  | "MAX"
  | "CUSTOM";

export type AnalysisPoint = {
  label: string;
  value: number;
};

export type BenchmarkPoint = {
  label: string;
  asset: number;
  benchmark: number;
};

export type QuantitativeAnalysis = {
  returns: number;
  volatility: number;
  sharpe: number;
  maxDrawdown: number;
  correlation: number;
};

export type TechnicalAnalysis = {
  sma20: number;
  sma50: number;
  ema20: number;
  ema50: number;
  rsi: number;

  smaSignal: "Bullish" | "Bearish" | "Neutral";
  emaSignal: "Bullish" | "Bearish" | "Neutral";
  rsiSignal: "Overbought" | "Oversold" | "Neutral";
};

export type IntelligenceAnalysis = {
  trend: "Bullish" | "Bearish" | "Neutral";
  momentum: "Strong" | "Moderate" | "Weak";
  risk: "Low" | "Moderate" | "High";
  movingAverage: "Bullish" | "Bearish" | "Neutral";
  rsi: "Overbought" | "Oversold" | "Neutral";
};

const periodMultipliers: Record<AnalysisPeriod, number> = {
  "1M": 0.35,
  "3M": 0.55,
  "6M": 0.75,
  "1Y": 1,
  "3Y": 1.35,
  "5Y": 1.65,
  MAX: 2,
  CUSTOM: 1,
};

const assetProfiles: Record<
  string,
  {
    returnBase: number;
    volatilityBase: number;
    sharpeBase: number;
    drawdownBase: number;
    correlationBase: number;
    momentumBase: number;
  }
> = {
  bitcoin: {
    returnBase: 31,
    volatilityBase: 42,
    sharpeBase: 1.18,
    drawdownBase: -28,
    correlationBase: 0.42,
    momentumBase: 1.25,
  },

  gold: {
    returnBase: 12,
    volatilityBase: 16,
    sharpeBase: 0.91,
    drawdownBase: -9,
    correlationBase: 0.18,
    momentumBase: 0.82,
  },

  nvidia: {
    returnBase: 24,
    volatilityBase: 34,
    sharpeBase: 1.04,
    drawdownBase: -22,
    correlationBase: 0.71,
    momentumBase: 0.94,
  },

  sp500: {
    returnBase: 15,
    volatilityBase: 18,
    sharpeBase: 0.88,
    drawdownBase: -11,
    correlationBase: 1,
    momentumBase: 0.88,
  },
};

const assetChartProfiles: Record<
  string,
  number[]
> = {
  bitcoin: [-10, -3, 8, 18, 15, 25, 31],
  gold: [-8, -5, -3, 4, 8, 6, 12],
  nvidia: [-15, -8, -4, 3, 9, 16, 24],
  sp500: [-7, -4, 0, 4, 7, 10, 15],
};

const benchmarkData: Record<string, number[]> = {
  bitcoin: [-4, 1, 4, 8, 7, 11, 14],
  gold: [-4, 1, 4, 8, 7, 11, 14],
  nvidia: [-4, 1, 4, 8, 7, 11, 14],
  sp500: [-4, 1, 4, 8, 7, 11, 14],
};

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function getAnalysisPeriod(
  startDate: string,
  endDate: string
): AnalysisPeriod {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const days =
    Math.max(
      1,
      Math.round(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

  if (days <= 45) return "1M";
  if (days <= 120) return "3M";
  if (days <= 240) return "6M";
  if (days <= 550) return "1Y";
  if (days <= 1300) return "3Y";
  if (days <= 2100) return "5Y";

  return "MAX";
}

export function getPeriodMultiplier(
  startDate: string,
  endDate: string
) {
  const period = getAnalysisPeriod(startDate, endDate);

  return {
    period,
    multiplier: periodMultipliers[period],
  };
}

export function getPerformanceData(
  asset: Asset,
  startDate: string,
  endDate: string
): AnalysisPoint[] {
  const base =
    assetChartProfiles[asset.id] ??
    assetChartProfiles.sp500;

  const { multiplier } = getPeriodMultiplier(
    startDate,
    endDate
  );

  return base.map((value, index) => ({
    label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"][
      index
    ],
    value: round(value * multiplier),
  }));
}

export function getBenchmarkData(
  asset: Asset,
  startDate: string,
  endDate: string
): BenchmarkPoint[] {
  const assetValues =
    assetChartProfiles[asset.id] ??
    assetChartProfiles.sp500;

  const benchmarkValues =
    benchmarkData[asset.id] ??
    benchmarkData.sp500;

  const { multiplier } = getPeriodMultiplier(
    startDate,
    endDate
  );

  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
  ];

  return labels.map((label, index) => ({
    label,
    asset: round(
      assetValues[index] * multiplier
    ),
    benchmark: round(
      benchmarkValues[index] * multiplier
    ),
  }));
}

export function getQuantitativeAnalysis(
  asset: Asset,
  startDate: string,
  endDate: string
): QuantitativeAnalysis {
  const profile =
    assetProfiles[asset.id] ??
    assetProfiles.sp500;

  const { multiplier } = getPeriodMultiplier(
    startDate,
    endDate
  );

  return {
    returns: round(
      profile.returnBase * multiplier
    ),

    volatility: round(
      profile.volatilityBase *
        Math.sqrt(multiplier)
    ),

    sharpe: round(
      profile.sharpeBase /
        Math.max(0.75, Math.sqrt(multiplier))
    ),

    maxDrawdown: round(
      profile.drawdownBase *
        Math.sqrt(multiplier)
    ),

    correlation: round(
      Math.min(
        1,
        Math.max(
          0,
          profile.correlationBase +
            (multiplier - 1) * 0.04
        )
      ),
      2
    ),
  };
}

export function getTechnicalAnalysis(
  asset: Asset,
  startDate: string,
  endDate: string
): TechnicalAnalysis {
  const { multiplier } = getPeriodMultiplier(
    startDate,
    endDate
  );

  const profile =
    assetProfiles[asset.id] ??
    assetProfiles.sp500;

  const currentPrice = asset.price;

  /*
   * SMA 20
   *
   * Shorter moving average reacts more closely
   * to the current price.
   */
  const sma20 =
    currentPrice *
    (1 -
      profile.momentumBase *
        multiplier *
        0.012);

  /*
   * SMA 50
   *
   * Longer moving average is intentionally
   * smoother than SMA 20.
   */
  const sma50 =
    currentPrice *
    (1 -
      profile.momentumBase *
        multiplier *
        0.022);

  /*
   * EMA 20
   *
   * EMA reacts slightly faster than SMA.
   */
  const ema20 =
    currentPrice *
    (1 -
      profile.momentumBase *
        multiplier *
        0.009);

  /*
   * EMA 50
   *
   * Longer-term exponential average.
   */
  const ema50 =
    currentPrice *
    (1 -
      profile.momentumBase *
        multiplier *
        0.018);

  /*
   * RSI
   */
  let rsi =
    50 +
    profile.momentumBase * 12;

  if (asset.id === "bitcoin") {
    rsi += 8;
  }

  if (asset.id === "nvidia") {
    rsi -= 15;
  }

  /*
   * Keep RSI inside a realistic display range.
   */
  rsi = Math.min(
    85,
    Math.max(15, rsi)
  );

  /*
   * SMA signal
   */
  const smaSignal =
    currentPrice > sma20 &&
    sma20 > sma50
      ? "Bullish"
      : currentPrice < sma20 &&
          sma20 < sma50
        ? "Bearish"
        : "Neutral";

  /*
   * EMA signal
   */
  const emaSignal =
    currentPrice > ema20 &&
    ema20 > ema50
      ? "Bullish"
      : currentPrice < ema20 &&
          ema20 < ema50
        ? "Bearish"
        : "Neutral";

  /*
   * RSI signal
   */
  const rsiSignal =
    rsi >= 70
      ? "Overbought"
      : rsi <= 30
        ? "Oversold"
        : "Neutral";

  return {
    sma20: round(sma20),
    sma50: round(sma50),

    ema20: round(ema20),
    ema50: round(ema50),

    rsi: round(rsi),

    smaSignal,
    emaSignal,
    rsiSignal,
  };
}

export function getIntelligenceAnalysis(
  asset: Asset,
  startDate: string,
  endDate: string
): IntelligenceAnalysis {
  const metrics = getQuantitativeAnalysis(
    asset,
    startDate,
    endDate
  );

  const technical = getTechnicalAnalysis(
    asset,
    startDate,
    endDate
  );

  let trend:
    | "Bullish"
    | "Bearish"
    | "Neutral" = "Neutral";

  if (
    technical.smaSignal === "Bullish" &&
    technical.emaSignal === "Bullish"
  ) {
    trend = "Bullish";
  } else if (
    technical.smaSignal === "Bearish" &&
    technical.emaSignal === "Bearish"
  ) {
    trend = "Bearish";
  }

  let momentum:
    | "Strong"
    | "Moderate"
    | "Weak" = "Moderate";

  if (
    metrics.returns > 20 &&
    technical.rsi > 55
  ) {
    momentum = "Strong";
  } else if (
    metrics.returns < 0 ||
    technical.rsi < 40
  ) {
    momentum = "Weak";
  }

  let risk:
    | "Low"
    | "Moderate"
    | "High" = "Moderate";

  if (metrics.volatility >= 30) {
    risk = "High";
  } else if (metrics.volatility <= 18) {
    risk = "Low";
  }

  return {
    trend,
    momentum,
    risk,
    movingAverage: technical.emaSignal,
    rsi: technical.rsiSignal,
  };
}