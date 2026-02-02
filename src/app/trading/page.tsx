"use client";

import { useEffect, useState } from "react";

interface Position {
  mint: string;
  symbol?: string;
  name?: string;
  amount: number | string;
  priceUsd?: number;
  valueUsd?: number;
  pnlPercent?: number;
  liquidity?: number;
}

interface TradingData {
  wallet: string;
  solBalance: number;
  solBalanceUsd: number;
  positionCount: number;
  positionValue: number;
  positionValueUsd: number;
  totalPortfolio: number;
  totalPortfolioUsd: number;
  positions: Position[];
  pnl: {
    totalSpent: number;
    totalReceived: number;
    netPnl: number;
    netPnlPercent: string;
  };
  today: {
    netPnl: number;
    netPnlUsd: number;
    tradeCount: number;
  };
  lastUpdated: string;
}

// Known token symbols (we can expand this)
const KNOWN_TOKENS: Record<string, { symbol: string; name: string }> = {
  "HcWZLqRLUuX1oVXDeAgyBpbQrmtcJP7AyNcHCvUZpump": { symbol: "PUMP", name: "Pump Token" },
  "BLJjLD57w4uuNYkRm4wNuRJ1fSd2j9SSHLN8s35Mvpuq": { symbol: "AUTARDIO", name: "Autardio" },
};

export default function TradingPage() {
  const [data, setData] = useState<TradingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/trading");
        if (!res.ok) throw new Error("Failed to fetch");
        const tradingData = await res.json();
        
        // Enrich positions with known token info
        if (tradingData.positions) {
          tradingData.positions = tradingData.positions.map((pos: Position) => ({
            ...pos,
            symbol: KNOWN_TOKENS[pos.mint]?.symbol || pos.symbol,
            name: KNOWN_TOKENS[pos.mint]?.name || pos.name,
          }));
        }
        
        setData(tradingData);
        setError(null);
      } catch (err) {
        setError("Failed to load trading data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading trading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-xl p-5">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  const formatMint = (mint: string) => `${mint.slice(0, 4)}...${mint.slice(-4)}`;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">📈 Trading Dashboard</h1>
          <p className="text-gray-500">Solana Memecoin Bot</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Last updated: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : "--"}</p>
          <p className="font-mono text-xs">{data?.wallet ? `${data.wallet.slice(0,8)}...${data.wallet.slice(-6)}` : ""}</p>
        </div>
      </div>

      {/* Balance & P&L */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">SOL Balance</p>
          <p className="text-2xl font-bold font-mono">{data?.solBalance?.toFixed(4) || "0"} SOL</p>
          <p className="text-gray-500 text-sm">${data?.solBalanceUsd?.toFixed(2) || "0"}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">All-Time P&L</p>
          <p className={`text-2xl font-bold font-mono ${data && data.pnl.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {data && data.pnl.netPnl >= 0 ? "+" : ""}{data?.pnl.netPnl?.toFixed(4) || "0"} SOL
          </p>
          <p className={`text-sm ${data && data.pnl.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {data && data.pnl.netPnl >= 0 ? "+" : ""}{data?.pnl.netPnlPercent || "0"}%
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <p className="text-gray-400 text-sm mb-1">Today&apos;s P&L</p>
          <p className={`text-2xl font-bold font-mono ${data && data.today.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
            {data && data.today.netPnl >= 0 ? "+" : ""}{data?.today.netPnl?.toFixed(4) || "0"} SOL
          </p>
          <p className="text-gray-500 text-sm">
            {data?.today.tradeCount || 0} transactions today
          </p>
        </div>
      </div>

      {/* Open Positions - Detailed */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📊 Open Positions ({data?.positionCount || 0})</h2>
          <span className="text-sm text-gray-500">
            Est. Value: ~${data?.positionValueUsd?.toFixed(2) || "0"}
          </span>
        </div>
        
        {data && data.positions && data.positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                  <th className="pb-3 pl-2">Token</th>
                  <th className="pb-3">Contract</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-right">Value (USD)</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.positions.map((pos, i) => {
                  const amount = parseFloat(String(pos.amount));
                  const isKnown = pos.symbol && pos.symbol !== pos.mint;
                  
                  return (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-3 pl-2">
                        <div>
                          <span className="font-semibold text-white">
                            {pos.symbol || "Unknown"}
                          </span>
                          {pos.name && (
                            <p className="text-xs text-gray-500">{pos.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <a
                          href={`https://solscan.io/token/${pos.mint}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-blue-400 hover:underline"
                        >
                          {formatMint(pos.mint)}
                        </a>
                      </td>
                      <td className="py-3 text-right font-mono text-sm">
                        {amount > 1000000 
                          ? `${(amount / 1000000).toFixed(2)}M`
                          : amount > 1000 
                            ? `${(amount / 1000).toFixed(2)}K`
                            : amount.toFixed(2)
                        }
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-gray-400">
                        {pos.priceUsd ? `$${pos.priceUsd.toFixed(8)}` : "--"}
                      </td>
                      <td className="py-3 text-right font-mono text-sm">
                        {pos.valueUsd ? (
                          <span className="text-green-400">${pos.valueUsd.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-500">--</span>
                        )}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <a
                          href={`https://dexscreener.com/solana/${pos.mint}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                        >
                          Chart
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No open positions</p>
        )}
      </div>

      {/* Portfolio Breakdown & P&L */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">💰 Portfolio Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Available SOL</span>
              <span className="font-mono">{data?.solBalance?.toFixed(4) || "0"} SOL</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">In Positions ({data?.positionCount || 0})</span>
              <span className="font-mono">~{data?.positionValue?.toFixed(4) || "0"} SOL</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-900/30 rounded-lg border border-green-800">
              <span className="font-semibold">Total</span>
              <span className="font-mono font-bold">{data?.totalPortfolio?.toFixed(4) || "0"} SOL</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h2 className="text-lg font-semibold mb-4">📊 P&L Breakdown</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Total Spent</span>
              <span className="font-mono text-red-400">-{data?.pnl.totalSpent?.toFixed(4) || "0"} SOL</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <span className="text-gray-400">Total Received</span>
              <span className="font-mono text-green-400">+{data?.pnl.totalReceived?.toFixed(4) || "0"} SOL</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg border ${
              data && data.pnl.netPnl >= 0 
                ? "bg-green-900/30 border-green-800" 
                : "bg-red-900/30 border-red-800"
            }`}>
              <span className="font-semibold">Net P&L</span>
              <span className={`font-mono font-bold ${data && data.pnl.netPnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                {data && data.pnl.netPnl >= 0 ? "+" : ""}{data?.pnl.netPnl?.toFixed(4) || "0"} SOL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Status */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h2 className="text-lg font-semibold mb-4">🛡️ Risk Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">Daily Loss Limit</p>
            <p className="font-mono font-bold">$300</p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">Today&apos;s Loss</p>
            <p className={`font-mono font-bold ${data && data.today.netPnlUsd < 0 ? "text-red-400" : "text-green-400"}`}>
              ${Math.abs(data?.today.netPnlUsd || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400 text-sm">Runway</p>
            <p className="font-mono font-bold text-green-400">
              ${(300 - Math.abs(data?.today.netPnlUsd || 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
