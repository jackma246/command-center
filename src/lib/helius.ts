/**
 * Helius API client for Solana chain data
 */

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '158c8bc9-72a0-4cf6-92ed-f66548704bf0';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS || '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc';

export interface WalletBalance {
  sol: number;
  usd: number;
}

export interface Position {
  mint: string;
  symbol: string;
  price: number;
  pnlPercent: number;
  liquidity: number;
}

export interface Trade {
  signature: string;
  timestamp: Date;
  type: 'buy' | 'sell';
  amount: number;
  pnl: number;
}

export interface PnLSummary {
  totalSpent: number;
  totalReceived: number;
  netPnl: number;
  netPnlPercent: number;
}

/**
 * Fetch SOL balance for the trading wallet
 */
export async function getWalletBalance(): Promise<WalletBalance> {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [WALLET_ADDRESS],
    }),
  });

  const data = await response.json();
  const solBalance = (data.result?.value || 0) / 1e9;
  
  // Approximate USD value (could fetch from API)
  const solPrice = 100; // TODO: Fetch real price
  
  return {
    sol: solBalance,
    usd: solBalance * solPrice,
  };
}

/**
 * Fetch recent transactions for P&L calculation
 */
export async function getRecentTransactions(limit: number = 50): Promise<Trade[]> {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [WALLET_ADDRESS, { limit }],
    }),
  });

  const data = await response.json();
  const signatures = data.result || [];

  // For each signature, we'd fetch full transaction details
  // This is a simplified version
  return signatures.map((sig: { signature: string; blockTime: number }) => ({
    signature: sig.signature,
    timestamp: new Date(sig.blockTime * 1000),
    type: 'buy' as const, // Would need to analyze transaction
    amount: 0,
    pnl: 0,
  }));
}

/**
 * Calculate P&L from chain data
 * Filters to only include trades after startDate
 */
export async function calculatePnL(startDate?: Date): Promise<PnLSummary> {
  // This would implement the chain-pnl.js logic
  // For now, return mock data structure
  const defaultStart = new Date('2026-02-01');
  const filterDate = startDate || defaultStart;

  // TODO: Implement actual chain P&L calculation
  // Reuse logic from solana-trader/chain-pnl.js
  
  return {
    totalSpent: 0,
    totalReceived: 0,
    netPnl: 0,
    netPnlPercent: 0,
  };
}

/**
 * Validate wallet address format
 */
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded and 32-44 characters
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Format SOL amount with proper decimals
 */
export function formatSol(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}

/**
 * Format USD amount
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}
