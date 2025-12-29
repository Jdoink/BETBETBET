import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'BetBetBet',
  projectId: '3fbf04dd4e08e90c396c75810f9bb71e',
  chains: [base],
  ssr: true,
});
