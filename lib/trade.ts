import { parseUnits } from 'viem';
import { TradeData } from './overtime';

export const USDC_DECIMALS = 6;

export function parseUSDC(amount: string): bigint {
  try {
    return parseUnits(amount, USDC_DECIMALS);
  } catch {
    return 0n;
  }
}

export function formatUSDC(amount: bigint): string {
  const str = amount.toString();
  const len = str.length;

  if (len <= USDC_DECIMALS) {
    return '0.' + '0'.repeat(USDC_DECIMALS - len) + str;
  }

  const intPart = str.slice(0, len - USDC_DECIMALS);
  const decPart = str.slice(len - USDC_DECIMALS);

  return intPart + '.' + decPart.replace(/0+$/, '') || intPart;
}

export interface TradeDataInput {
  market: `0x${string}`;
  ticketType: number;
  position: bigint;
  collateralAmount: bigint;
  differentRecipient: `0x${string}`;
  referrer: `0x${string}`;
  collateral: `0x${string}`;
  tradeData: {
    gameId: `0x${string}`;
    typeId: number;
    playerId: number;
    line: number;
    position: number;
    combinedPositions: number;
  }[];
}

export function buildTradeDataInput(
  marketAddress: `0x${string}`,
  collateralAddress: `0x${string}`,
  amountInWei: bigint,
  tradeData: TradeData,
  userAddress: `0x${string}`
): TradeDataInput {
  return {
    market: marketAddress,
    ticketType: 0,
    position: BigInt(tradeData.position),
    collateralAmount: amountInWei,
    differentRecipient: '0x0000000000000000000000000000000000000000',
    referrer: '0x0000000000000000000000000000000000000000',
    collateral: collateralAddress,
    tradeData: [
      {
        gameId: tradeData.gameId as `0x${string}`,
        typeId: tradeData.typeId,
        playerId: tradeData.playerId,
        line: tradeData.line,
        position: tradeData.position,
        combinedPositions: tradeData.combinedPositions,
      },
    ],
  };
}
