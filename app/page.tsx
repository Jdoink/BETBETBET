'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { loadDailyMarket, DailyMarket } from '@/lib/dailyConfig';
import { getQuote, QuoteResponse, TradeData } from '@/lib/overtime';
import { parseUSDC, formatUSDC, buildTradeDataInput } from '@/lib/trade';
import { ERC20_ABI, SPORTS_AMM_V2_ABI, USDC_ADDRESS, SPORTS_AMM_V2_ADDRESS } from '@/lib/abis';
import OperatorPanel from '@/components/OperatorPanel';

type SelectedSide = 'A' | 'B' | null;

export default function Home() {
  const { address, isConnected } = useAccount();
  const [operatorMode, setOperatorMode] = useState(false);
  const [configUrl, setConfigUrl] = useState<string | null>(null);
  const [market, setMarket] = useState<DailyMarket | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<SelectedSide>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string>('');

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, SPORTS_AMM_V2_ADDRESS] : undefined,
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: trade, data: tradeHash } = useWriteContract();

  const { isLoading: isApproving, isSuccess: approveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isTrading, isSuccess: tradeSuccess } = useWaitForTransactionReceipt({
    hash: tradeHash,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setOperatorMode(params.get('operator') === '1');
      setConfigUrl(params.get('configUrl'));
    }
  }, []);

  const loadMarketData = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await loadDailyMarket(configUrl);
      setMarket(data);
    } catch (error: any) {
      setLoadError(error.message);
    }
  }, [configUrl]);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  const fetchQuote = useCallback(async (amount: string, tradeData: TradeData) => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    setQuoteLoading(true);
    setQuoteError(null);

    try {
      const amountInWei = parseUSDC(amount);
      const quoteResponse = await getQuote({
        chainId: 8453,
        tradeData: [tradeData],
        buyInAmount: amountInWei.toString(),
        collateral: 'USDC',
      });
      setQuote(quoteResponse);
    } catch (error: any) {
      setQuoteError(error.message);
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (selectedSide && market) {
      const tradeData = selectedSide === 'A' ? market.tradeDataA : market.tradeDataB;
      debounceTimeout.current = setTimeout(() => {
        fetchQuote(stakeAmount, tradeData);
      }, 600);
    } else {
      setQuote(null);
      setQuoteError(null);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [stakeAmount, selectedSide, market, fetchQuote]);

  useEffect(() => {
    if (approveSuccess) {
      setTxStatus('Approval successful! Ready to place bet.');
      refetchAllowance();
    }
  }, [approveSuccess, refetchAllowance]);

  useEffect(() => {
    if (tradeSuccess) {
      setTxStatus('Bet placed successfully!');
      setStakeAmount('');
      setSelectedSide(null);
      setQuote(null);
      refetchBalance();
      refetchAllowance();
    }
  }, [tradeSuccess, refetchBalance, refetchAllowance]);

  const handleApprove = async () => {
    if (!address) return;

    const amount = parseUSDC(stakeAmount);
    setTxStatus('Requesting approval...');

    try {
      approve({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SPORTS_AMM_V2_ADDRESS, amount],
      });
    } catch (error: any) {
      setTxStatus(`Approval failed: ${error.message}`);
    }
  };

  const handlePlaceBet = async () => {
    if (!address || !market || !selectedSide) return;

    const amount = parseUSDC(stakeAmount);
    const needsApproval = !allowance || (allowance as bigint) < amount;

    if (needsApproval) {
      handleApprove();
      return;
    }

    const tradeData = selectedSide === 'A' ? market.tradeDataA : market.tradeDataB;
    const tradeDataInput = buildTradeDataInput(
      market.market as `0x${string}`,
      USDC_ADDRESS,
      amount,
      tradeData,
      address
    );

    setTxStatus('Placing bet...');

    try {
      trade({
        address: SPORTS_AMM_V2_ADDRESS,
        abi: SPORTS_AMM_V2_ABI,
        functionName: 'trade',
        args: [tradeDataInput],
      });
    } catch (error: any) {
      setTxStatus(`Trade failed: ${error.message}`);
    }
  };

  const needsApproval = () => {
    if (!allowance || !stakeAmount) return false;
    const amount = parseUSDC(stakeAmount);
    return (allowance as bigint) < amount;
  };

  if (loadError) {
    return (
      <main className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-200 mb-2">Failed to load market</h2>
          <p className="text-red-300 text-sm">{loadError}</p>
          <button onClick={loadMarketData} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!market) {
    return (
      <main className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading market...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="casino-border rounded-xl p-6 mb-6 bg-gray-900">
          <h1 className="text-4xl md:text-5xl font-black text-center tracking-wider text-yellow-400">
            BETBETBET
          </h1>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Bet on the Big Game!</h2>
            <ConnectButton />
          </div>

          {balance !== undefined && (
            <p className="text-sm text-gray-400">
              Balance: {formatUSDC(balance as bigint)} USDC
            </p>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">{market.title}</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setSelectedSide('A')}
              className={`p-6 rounded-xl font-bold text-lg transition-all ${
                selectedSide === 'A'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {market.teamA}
            </button>
            <button
              onClick={() => setSelectedSide('B')}
              className={`p-6 rounded-xl font-bold text-lg transition-all ${
                selectedSide === 'B'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {market.teamB}
            </button>
          </div>

          {selectedSide && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stake Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="10.00"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="input-field"
                />
              </div>

              {quoteLoading && (
                <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                  Fetching quote...
                </div>
              )}

              {quoteError && (
                <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-sm text-red-300">
                  {quoteError}
                </div>
              )}

              {quote && !quoteLoading && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Odds:</span>
                    <span className="font-bold">{parseFloat(quote.totalQuote).toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential Payout:</span>
                    <span className="font-bold text-green-400">
                      {formatUSDC(BigInt(quote.payout))} USDC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Potential Profit:</span>
                    <span className="font-bold text-green-400">
                      {formatUSDC(BigInt(quote.payout) - parseUSDC(stakeAmount))} USDC
                    </span>
                  </div>
                  {quote.fees && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fees:</span>
                      <span className="text-gray-500">{formatUSDC(BigInt(quote.fees))} USDC</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handlePlaceBet}
                disabled={
                  !isConnected ||
                  !stakeAmount ||
                  parseFloat(stakeAmount) <= 0 ||
                  !quote ||
                  isApproving ||
                  isTrading
                }
                className="bet-button w-full"
              >
                {!isConnected
                  ? 'Connect Wallet'
                  : isApproving
                  ? 'Approving...'
                  : isTrading
                  ? 'Placing Bet...'
                  : needsApproval()
                  ? 'Approve USDC'
                  : 'Place Bet (Real)'}
              </button>

              {txStatus && (
                <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 text-sm text-blue-200">
                  {txStatus}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center">
          <button onClick={loadMarketData} className="btn-secondary">
            Refresh Game
          </button>
        </div>
      </div>

      {operatorMode && <OperatorPanel onConfigUpdate={loadMarketData} />}
    </main>
  );
}
