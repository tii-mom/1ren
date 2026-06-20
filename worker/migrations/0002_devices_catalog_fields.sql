-- Add spec-anchored configuration fields to devices table for backward compatibility
ALTER TABLE devices ADD COLUMN display_tier TEXT NULL;
ALTER TABLE devices ADD COLUMN display_order INTEGER DEFAULT 0;
ALTER TABLE devices ADD COLUMN ref_hardware_name TEXT NULL;
ALTER TABLE devices ADD COLUMN ref_spec_description TEXT NULL;
ALTER TABLE devices ADD COLUMN market_price_range TEXT NULL;
ALTER TABLE devices ADD COLUMN suitable_scenarios TEXT NULL;
ALTER TABLE devices ADD COLUMN api_scenarios TEXT NULL;
ALTER TABLE devices ADD COLUMN daily_ai_token_yield REAL DEFAULT 0;
ALTER TABLE devices ADD COLUMN yield_multiplier REAL DEFAULT 1.0;
ALTER TABLE devices ADD COLUMN purchase_limit INTEGER DEFAULT 5;
ALTER TABLE devices ADD COLUMN stock_count INTEGER DEFAULT 999;
ALTER TABLE devices ADD COLUMN is_featured INTEGER DEFAULT 0;
ALTER TABLE devices ADD COLUMN disclaimer_text TEXT NULL;
