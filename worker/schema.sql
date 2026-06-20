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

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_asset_accounts_user_id ON asset_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_user_id ON ledger_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_system_events_user_id ON system_events(user_id);
CREATE INDEX IF NOT EXISTS idx_users_invite_code ON users(invite_code);
