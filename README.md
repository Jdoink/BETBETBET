# BetBetBet - Sports Betting dApp on Base

A production-ready MVP for sports betting on Base mainnet using Overtime Markets.

## Features

- **Single-page mobile-first UI** with casino-style design
- **Base mainnet only** (Chain ID: 8453)
- **USDC betting** (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Overtime SportsAMMV2 integration** (0x76923cDDE21928ddbeC4B8BFDC8143BB6d0841a8)
- **Real-time quote fetching** with 600ms debounce
- **Automatic USDC approval** handling
- **Dynamic market loading** from JSON
- **Operator mode** for testing with custom configs

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- RainbowKit + Wagmi + Viem
- Overtime Markets API

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Configuration

### Daily Market JSON

The app loads market data from JSON at runtime. Configure via:

1. **URL Parameter** (preferred): `?configUrl=https://your-domain.com/dailyMarket.json`
2. **Local file**: Place `dailyMarket.json` in the `/public` directory

#### JSON Format

```json
{
  "title": "Today's Big Game",
  "teamA": "Team A Name",
  "teamB": "Team B Name",
  "market": "0x...",
  "tradeDataA": {
    "gameId": "0x...",
    "typeId": 0,
    "playerId": 0,
    "line": 0,
    "position": 0,
    "combinedPositions": 0
  },
  "tradeDataB": {
    "gameId": "0x...",
    "typeId": 0,
    "playerId": 0,
    "line": 0,
    "position": 1,
    "combinedPositions": 0
  }
}
```

### Operator Mode

For testing, add `?operator=1` to the URL to enable operator mode:

1. Opens a panel at the bottom of the page
2. Paste custom JSON configuration
3. Config saves to localStorage
4. Takes precedence over URL/file configs
5. Clear with "Clear Config" button

Example: `http://localhost:3000?operator=1`

### WalletConnect Project ID

Hardcoded in `lib/wagmi.ts`:
- Current: `3fbf04dd4e08e90c396c75810f9bb71e`
- To change: Edit `lib/wagmi.ts` line 6

## How It Works

1. **Connect Wallet**: User connects via RainbowKit (Base mainnet only)
2. **Select Team**: Choose Team A or Team B
3. **Enter Stake**: Input USDC amount
4. **Get Quote**: Auto-fetches odds and potential payout from Overtime API
5. **Approve USDC**: One-time approval for SportsAMMV2 contract
6. **Place Bet**: Execute trade on-chain

## API Integration

### Overtime Markets Quote API

- **Endpoint**: `POST https://api.overtime.io/overtime-v2/networks/8453/quote`
- **Debounce**: 600ms to avoid excessive calls
- **Auto-cancels**: Previous requests on stake change

## Smart Contracts

- **USDC**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **SportsAMMV2**: `0x76923cDDE21928ddbeC4B8BFDC8143BB6d0841a8`
- **Network**: Base Mainnet (8453)

## Deployment

This app is ready to deploy on:

- Vercel (recommended)
- Netlify
- Any Next.js hosting provider

### Environment Variables

No environment variables required! The app works out of the box.

## File Structure

```
/app
  /page.tsx           # Main betting UI
  /layout.tsx         # Root layout with providers
  /providers.tsx      # RainbowKit/Wagmi setup
  /globals.css        # Tailwind styles
/components
  /OperatorPanel.tsx  # Operator mode UI
/lib
  /wagmi.ts           # Wagmi config (Base only)
  /abis.ts            # Contract ABIs
  /overtime.ts        # Overtime API integration
  /dailyConfig.ts     # JSON config loading
  /trade.ts           # Trading utilities
/public
  /dailyMarket.json   # Sample market data
```

## Notes

- No database required
- No backend/API routes needed
- All data loads from JSON at runtime
- RLS and authentication not needed (on-chain betting)
- Works 100% client-side

## License

MIT
