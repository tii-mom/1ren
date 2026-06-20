-- Create system_configs table to persist global variables
CREATE TABLE IF NOT EXISTS system_configs (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
