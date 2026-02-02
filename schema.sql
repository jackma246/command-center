-- Command Center Database Schema
-- Run this on Railway Postgres

-- Wallet snapshots (balance over time)
CREATE TABLE IF NOT EXISTS wallet_snapshots (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  sol_balance DECIMAL(20, 9) NOT NULL,
  sol_price_usd DECIMAL(10, 2),
  total_usd DECIMAL(12, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Positions (open token holdings)
CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  mint VARCHAR(50) NOT NULL,
  symbol VARCHAR(20),
  amount DECIMAL(30, 9) NOT NULL,
  entry_price_sol DECIMAL(20, 9),
  entry_date TIMESTAMP,
  current_price_sol DECIMAL(20, 9),
  pnl_percent DECIMAL(10, 2),
  liquidity_usd DECIMAL(12, 2),
  status VARCHAR(20) DEFAULT 'open',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(wallet_address, mint)
);

-- Trade history
CREATE TABLE IF NOT EXISTS trades (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  signature VARCHAR(100) UNIQUE NOT NULL,
  mint VARCHAR(50),
  symbol VARCHAR(20),
  type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  amount_sol DECIMAL(20, 9) NOT NULL,
  amount_tokens DECIMAL(30, 9),
  price_per_token DECIMAL(30, 15),
  pnl_sol DECIMAL(20, 9),
  pnl_percent DECIMAL(10, 2),
  confidence_score INTEGER,
  exit_reason VARCHAR(50),
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily P&L summary
CREATE TABLE IF NOT EXISTS daily_pnl (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  starting_balance DECIMAL(20, 9),
  ending_balance DECIMAL(20, 9),
  total_spent DECIMAL(20, 9),
  total_received DECIMAL(20, 9),
  net_pnl DECIMAL(20, 9),
  net_pnl_percent DECIMAL(10, 2),
  trade_count INTEGER,
  win_count INTEGER,
  loss_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(wallet_address, date)
);

-- Study progress
CREATE TABLE IF NOT EXISTS study_progress (
  id SERIAL PRIMARY KEY,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  topic VARCHAR(200) NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming',
  notes TEXT,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(week, day)
);

-- Today's accomplishments
CREATE TABLE IF NOT EXISTS accomplishments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  time TIME,
  category VARCHAR(20) NOT NULL,
  description VARCHAR(500) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API costs tracking
CREATE TABLE IF NOT EXISTS api_costs (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  cost DECIMAL(10, 4) NOT NULL,
  requests INTEGER,
  tokens INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, provider)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trades_wallet_timestamp ON trades(wallet_address, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(DATE(timestamp));
CREATE INDEX IF NOT EXISTS idx_positions_wallet ON positions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_accomplishments_date ON accomplishments(date);
CREATE INDEX IF NOT EXISTS idx_daily_pnl_wallet_date ON daily_pnl(wallet_address, date DESC);
