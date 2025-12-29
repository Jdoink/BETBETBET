export interface TradeData {
  gameId: string;
  typeId: number;
  playerId: number;
  line: number;
  position: number;
  combinedPositions: number;
}

export interface QuoteRequest {
  chainId: number;
  tradeData: TradeData[];
  buyInAmount: string;
  collateral: string;
}

export interface QuoteResponse {
  payout: string;
  totalQuote: string;
  fees: string;
  error?: string;
}

let quoteController: AbortController | null = null;

export async function getQuote(request: QuoteRequest): Promise<QuoteResponse> {
  if (quoteController) {
    quoteController.abort();
  }

  quoteController = new AbortController();

  try {
    const response = await fetch(
      `https://api.overtime.io/overtime-v2/networks/${request.chainId}/quote`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tradeData: request.tradeData,
          buyInAmount: request.buyInAmount,
          collateral: request.collateral,
        }),
        signal: quoteController.signal,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Quote failed: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Quote request cancelled');
    }
    throw error;
  } finally {
    quoteController = null;
  }
}
