const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

export type AnalysisRequest = {
  symbol: string;
  startDate: string;
  endDate: string;
};

export type TechnicalIndicatorsResponse = {
  symbol: string;

  dates: string[];

  prices: number[];

  sma20: number[];

  sma50: number[];

  ema20: number[];

  ema50: number[];

  rsi: number[];
};

export type RiskMetricsResponse = {
  symbol: string;

  returns: number;

  volatility: number;

  sharpeRatio: number;

  maxDrawdown: number;

  correlation: number;
};

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",

        ...(options?.headers || {}),
      },

      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `API Error ${response.status}: ${errorText}`
    );
  }

  return response.json();
}


/* =========================================================
   TECHNICAL INDICATORS
========================================================= */

export async function getTechnicalIndicators(
  request: AnalysisRequest
): Promise<TechnicalIndicatorsResponse> {
  const params = new URLSearchParams({
    symbol: request.symbol,

    start_date: request.startDate,

    end_date: request.endDate,
  });

  return apiRequest<TechnicalIndicatorsResponse>(
    `/api/analysis/technical?${params.toString()}`
  );
}


/* =========================================================
   RISK & PERFORMANCE METRICS
========================================================= */

export async function getRiskMetrics(
  request: AnalysisRequest
): Promise<RiskMetricsResponse> {
  const params = new URLSearchParams({
    symbol: request.symbol,

    start_date: request.startDate,

    end_date: request.endDate,
  });

  return apiRequest<RiskMetricsResponse>(
    `/api/analysis/risk?${params.toString()}`
  );
}