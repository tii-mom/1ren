-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    tg_id TEXT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    referrer_id TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    revoked_at TEXT NULL
);

-- Asset Accounts Table
CREATE TABLE IF NOT EXISTS asset_accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    balance REAL NOT NULL DEFAULT 0,
    locked_balance REAL NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    UNIQUE(user_id, asset_type)
);

-- Ledger Entries Table
CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    amount REAL NOT NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- System Events Table
CREATE TABLE IF NOT EXISTS system_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NULL,
    event_type TEXT NOT NULL,
    payload_json TEXT NULL,
    created_at TEXT NOT NULL
);

-- Devices Table
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    device_type TEXT NOT NULL,
    base_hashpower REAL NOT NULL,
    rent_usdt REAL NOT NULL DEFAULT 0,
    rent_r1 REAL NOT NULL DEFAULT 0,
    duration_seconds INTEGER NULL,
    duration_days INTEGER NULL,
    is_demo INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    display_tier TEXT NULL,
    display_order INTEGER DEFAULT 0,
    ref_hardware_name TEXT NULL,
    ref_spec_description TEXT NULL,
    market_price_range TEXT NULL,
    suitable_scenarios TEXT NULL,
    api_scenarios TEXT NULL,
    daily_ai_token_yield REAL DEFAULT 0,
    yield_multiplier REAL DEFAULT 1.0,
    purchase_limit INTEGER DEFAULT 5,
    stock_count INTEGER DEFAULT 999,
    is_featured INTEGER DEFAULT 0,
    disclaimer_text TEXT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Device Orders Table
CREATE TABLE IF NOT EXISTS device_orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    order_type TEXT NOT NULL,
    status TEXT NOT NULL,
    paid_asset TEXT NULL,
    paid_amount REAL NOT NULL DEFAULT 0,
    starts_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Mining Records Table
CREATE TABLE IF NOT EXISTS mining_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_order_id TEXT NULL,
    record_type TEXT NOT NULL,
    ai_token_delta REAL NOT NULL DEFAULT 0,
    hashpower_snapshot REAL NOT NULL DEFAULT 0,
    note TEXT NULL,
    created_at TEXT NOT NULL
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_accounts_user_id ON asset_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_id ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_system_events_user_id ON system_events(user_id);
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);

CREATE INDEX IF NOT EXISTS idx_devices_code ON devices(code);
CREATE INDEX IF NOT EXISTS idx_device_orders_user_id ON device_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_device_orders_status ON device_orders(status);
CREATE INDEX IF NOT EXISTS idx_device_orders_expires_at ON device_orders(expires_at);
CREATE INDEX IF NOT EXISTS idx_mining_records_user_id ON mining_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mining_records_created_at ON mining_records(created_at);

-- System Configs Table
CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

