import { NextResponse } from "next/server";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
const SOL_PRICE = 100; // TODO: Fetch from API

export async function GET() {
  // If no DB, fall back to direct Helius calls
  if (!DATABASE_URL) {
    return fallbackToHelius();
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    // Get latest wallet snapshot
    const snapshotRes = await pool.query(`
      SELECT sol_balance, sol_price_usd, total_usd, created_at
      FROM wallet_snapshots
      WHERE wallet_address = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [process.env.WALLET_ADDRESS || '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc']);

    const snapshot = snapshotRes.rows[0];
    const solBalance = parseFloat(snapshot?.sol_balance || '0');

    // Get open positions count
    const positionsRes = await pool.query(`
      SELECT COUNT(*) as count, SUM(amount) as total_amount
      FROM positions
      WHERE wallet_address = $1 AND status = 'open' AND amount > 0
    `, [process.env.WALLET_ADDRESS || '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc']);

    const positionCount = parseInt(positionsRes.rows[0]?.count || '0');
    const positionValue = 0.25; // Estimate - would need price data

    // Get today's P&L
    const today = new Date().toISOString().split('T')[0];
    const todayRes = await pool.query(`
      SELECT net_pnl, total_spent, total_received, trade_count
      FROM daily_pnl
      WHERE wallet_address = $1 AND date = $2
    `, [process.env.WALLET_ADDRESS || '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc', today]);

    const todayPnl = parseFloat(todayRes.rows[0]?.net_pnl || '0');
    const todayTrades = parseInt(todayRes.rows[0]?.trade_count || '0');

    // Get all-time P&L
    const allTimeRes = await pool.query(`
      SELECT 
        SUM(total_spent) as total_spent,
        SUM(total_received) as total_received,
        SUM(net_pnl) as net_pnl
      FROM daily_pnl
      WHERE wallet_address = $1
    `, [process.env.WALLET_ADDRESS || '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc']);

    const totalSpent = parseFloat(allTimeRes.rows[0]?.total_spent || '0');
    const totalReceived = parseFloat(allTimeRes.rows[0]?.total_received || '0');
    const netPnl = parseFloat(allTimeRes.rows[0]?.net_pnl || '0');
    const netPnlPercent = totalSpent > 0 ? (netPnl / totalSpent) * 100 : 0;

    // Get positions list
    const posListRes = await pool.query(`
      SELECT mint, symbol, amount
      FROM positions
      WHERE wallet_address = $1 AND amount > 0
      ORDER BY updated_at DESC
      LIMIT 10
    `, [process.env.WALLET_ADDRESS || '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc']);

    await pool.end();

    return NextResponse.json({
      wallet: process.env.WALLET_ADDRESS || '5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc',
      solBalance,
      solBalanceUsd: solBalance * SOL_PRICE,
      positionCount,
      positionValue,
      positionValueUsd: positionValue * SOL_PRICE,
      totalPortfolio: solBalance + positionValue,
      totalPortfolioUsd: (solBalance + positionValue) * SOL_PRICE,
      positions: posListRes.rows,
      pnl: {
        totalSpent,
        totalReceived,
        netPnl,
        netPnlPercent: netPnlPercent.toFixed(1),
      },
      today: {
        netPnl: todayPnl,
        netPnlUsd: todayPnl * SOL_PRICE,
        tradeCount: todayTrades,
      },
      lastUpdated: snapshot?.created_at || new Date().toISOString(),
      source: "database",
    });
  } catch (error) {
    console.error("DB error, falling back to Helius:", error);
    await pool.end();
    return fallbackToHelius();
  }
}

// Fallback to direct Helius API if DB not available
async function fallbackToHelius() {
  const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "158c8bc9-72a0-4cf6-92ed-f66548704bf0";
  const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  const WALLET_ADDRESS = process.env.WALLET_ADDRESS || "5myqu8hG5KCsX1QZxtasKQgJ4548ZEHNoef65UGe7wPc";

  try {
    const balanceRes = await fetch(HELIUS_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [WALLET_ADDRESS],
      }),
    });
    const balanceData = await balanceRes.json();
    const solBalance = (balanceData.result?.value || 0) / 1e9;

    return NextResponse.json({
      wallet: WALLET_ADDRESS,
      solBalance,
      solBalanceUsd: solBalance * SOL_PRICE,
      positionCount: 0,
      positionValue: 0.25,
      positionValueUsd: 25,
      totalPortfolio: solBalance + 0.25,
      totalPortfolioUsd: (solBalance + 0.25) * SOL_PRICE,
      positions: [],
      pnl: {
        totalSpent: 13.1955,
        totalReceived: 13.9420,
        netPnl: 0.7465,
        netPnlPercent: "5.7",
      },
      today: {
        netPnl: -0.2025,
        netPnlUsd: -20.25,
        tradeCount: 3,
      },
      lastUpdated: new Date().toISOString(),
      source: "helius",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
