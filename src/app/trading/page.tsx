"use client";

import { useEffect, useState } from "react";

interface Position {
  mint: string;
  symbol?: string;
  name?: string;
  amount: number | string;
  priceUsd?: number;
  valueUsd?: number;
  entryPriceSol?: number;
  entryValueUsd?: number;
  entryDate?: string;
  pnlUsd?: number;
  pnlPercent?: number;
  priceChange24h?: number;
  volume24h?: number;
  liquidity?: number;
  pairAddress?: string;
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
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-800">
                  <th className="pb-3 pl-2">Token</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-right">Entry</th>
                  <th className="pb-3 text-right">Current</th>
                  <th className="pb-3 text-right">Value</th>
                  <th className="pb-3 text-right">P&L</th>
                  <th className="pb-3 text-right">24h</th>
                  <th className="pb-3 text-right">Liquidity</th>
                  <th className="pb-3 text-right pr-2">Links</th>
                </tr>
              </thead>
              <tbody>
                {data.positions.map((pos, i) => {
                  const amount = parseFloat(String(pos.amount));
                  const pnlPositive = (pos.pnlPercent || 0) >= 0;
                  const change24hPositive = (pos.priceChange24h || 0) >= 0;
                  
                  // Format time held
                  const entryDate = pos.entryDate ? new Date(pos.entryDate) : null;
                  const hoursHeld = entryDate ? Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60)) : null;
                  const timeHeldStr = hoursHeld !== null 
                    ? hoursHeld < 24 ? `${hoursHeld}h` : `${Math.floor(hoursHeld / 24)}d`
                    : null;
                  
                  return (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      {/* Token */}
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-semibold text-white">
                              {pos.symbol || "???"}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <a
                                href={`https://solscan.io/token/${pos.mint}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono hover:text-blue-400"
                              >
                                {formatMint(pos.mint)}
                              </a>
                              {timeHeldStr && (
                                <span className="text-gray-600">• {timeHeldStr}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Amount */}
                      <td className="py-3 text-right font-mono">
                        {amount > 1000000 
                          ? `${(amount / 1000000).toFixed(1)}M`
                          : amount > 1000 
                            ? `${(amount / 1000).toFixed(1)}K`
                            : amount.toFixed(0)
                        }
                      </td>
                      
                      {/* Entry Price */}
                      <td className="py-3 text-right font-mono text-gray-400">
                        {pos.entryValueUsd ? (
                          <span>${pos.entryValueUsd.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-600">--</span>
                        )}
                      </td>
                      
                      {/* Current Price */}
                      <td className="py-3 text-right font-mono text-gray-400">
                        {pos.priceUsd ? `$${pos.priceUsd < 0.0001 ? pos.priceUsd.toExponential(2) : pos.priceUsd.toFixed(6)}` : "--"}
                      </td>
                      
                      {/* Value (USD) */}
                      <td className="py-3 text-right font-mono font-semibold">
                        {pos.valueUsd ? (
                          <span className="text-white">${pos.valueUsd.toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-600">--</span>
                        )}
                      </td>
                      
                      {/* P&L */}
                      <td className="py-3 text-right font-mono">
                        {pos.pnlPercent !== null && pos.pnlPercent !== undefined ? (
                          <div>
                            <span className={pnlPositive ? "text-green-400" : "text-red-400"}>
                              {pnlPositive ? "+" : ""}{pos.pnlPercent.toFixed(1)}%
                            </span>
                            {pos.pnlUsd !== null && pos.pnlUsd !== undefined && (
                              <p className={`text-xs ${pnlPositive ? "text-green-400/60" : "text-red-400/60"}`}>
                                {pnlPositive ? "+" : ""}${pos.pnlUsd.toFixed(2)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">--</span>
                        )}
                      </td>
                      
                      {/* 24h Change */}
                      <td className="py-3 text-right font-mono text-xs">
                        {pos.priceChange24h !== null && pos.priceChange24h !== undefined ? (
                          <span className={change24hPositive ? "text-green-400" : "text-red-400"}>
                            {change24hPositive ? "+" : ""}{pos.priceChange24h.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-600">--</span>
                        )}
                      </td>
                      
                      {/* Liquidity */}
                      <td className="py-3 text-right font-mono text-xs text-gray-400">
                        {pos.liquidity ? (
                          pos.liquidity >= 1000000 
                            ? `$${(pos.liquidity / 1000000).toFixed(1)}M`
                            : pos.liquidity >= 1000
                              ? `$${(pos.liquidity / 1000).toFixed(0)}K`
                              : `$${pos.liquidity.toFixed(0)}`
                        ) : "--"}
                      </td>
                      
                      {/* Links */}
                      <td className="py-3 text-right pr-2">
                        <div className="flex justify-end gap-1">
                          <a
                            href={`https://dexscreener.com/solana/${pos.pairAddress || pos.mint}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                            title="DexScreener"
                          >
                            📊
                          </a>
                          <a
                            href={`https://birdeye.so/token/${pos.mint}?chain=solana`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                            title="Birdeye"
                          >
                            🦅
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Volume footer */}
            <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
              <span>24h Volume: ${data.positions.reduce((sum, p) => sum + (p.volume24h || 0), 0).toLocaleString()}</span>
              <span>Total Liquidity: ${data.positions.reduce((sum, p) => sum + (p.liquidity || 0), 0).toLocaleString()}</span>
            </div>
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
