export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
] as const;

export const SPORTS_AMM_V2_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'market', type: 'address' },
          { internalType: 'enum IFreeBetsHolder.TicketType', name: 'ticketType', type: 'uint8' },
          { internalType: 'uint256', name: 'position', type: 'uint256' },
          { internalType: 'uint256', name: 'collateralAmount', type: 'uint256' },
          { internalType: 'address', name: 'differentRecipient', type: 'address' },
          { internalType: 'address', name: 'referrer', type: 'address' },
          { internalType: 'address', name: 'collateral', type: 'address' },
          {
            components: [
              { internalType: 'bytes32', name: 'gameId', type: 'bytes32' },
              { internalType: 'uint8', name: 'typeId', type: 'uint8' },
              { internalType: 'uint8', name: 'playerId', type: 'uint8' },
              { internalType: 'int24', name: 'line', type: 'int24' },
              { internalType: 'uint8', name: 'position', type: 'uint8' },
              { internalType: 'uint8', name: 'combinedPositions', type: 'uint8' },
            ],
            internalType: 'struct ISportsAMMV2.TradeData[]',
            name: 'tradeData',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct ISportsAMMV2.TradeDataInput',
        name: '_tradeDataInput',
        type: 'tuple',
      },
    ],
    name: 'trade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const SPORTS_AMM_V2_ADDRESS = '0x76923cDDE21928ddbeC4B8BFDC8143BB6d0841a8' as const;
