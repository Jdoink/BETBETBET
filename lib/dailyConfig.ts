import { TradeData } from './overtime';

export interface DailyMarket {
  title: string;
  teamA: string;
  teamB: string;
  tradeDataA: TradeData;
  tradeDataB: TradeData;
  market: string;
}

const STORAGE_KEY = 'betbetbet_operator_config';

export function saveOperatorConfig(config: DailyMarket): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

export function getOperatorConfig(): DailyMarket | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function clearOperatorConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function loadDailyMarket(configUrl?: string | null): Promise<DailyMarket> {
  const operatorConfig = getOperatorConfig();
  if (operatorConfig) {
    return operatorConfig;
  }

  const url = configUrl || '/dailyMarket.json';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load config from ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to load daily market:', error);
    throw error;
  }
}
