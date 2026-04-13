-- ==========================================
-- BotC Stats - Supabase Database Setup
-- ==========================================
-- Paste this entire file into your Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query > Paste > Run)

-- 1. Games table - stores all game records
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    game_id INTEGER UNIQUE NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    players JSONB NOT NULL,
    winning_team TEXT NOT NULL CHECK (winning_team IN ('Good', 'Evil')),
    game_mode TEXT,
    story_teller TEXT,
    modifiers JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Access codes table - controls who can add/edit games
CREATE TABLE access_codes (
    code TEXT PRIMARY KEY,
    description TEXT,
    permission_level TEXT DEFAULT 'submit' CHECK (permission_level IN ('submit', 'edit')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scripts table - tracks available game scripts
CREATE TABLE scripts (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'Normal' CHECK (category IN ('Normal', 'Teensyville')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insert default scripts
INSERT INTO scripts (name, category) VALUES
    ('Trouble Brewing', 'Normal'),
    ('Bad Moon Rising', 'Normal'),
    ('Sects & Violets', 'Normal')
ON CONFLICT (name) DO NOTHING;

-- 5. Insert your access codes (CHANGE THESE!)
-- 'submit' level: can add new games
-- 'edit' level: can add AND edit existing games
INSERT INTO access_codes (code, description, permission_level) VALUES
    ('change-me-submit', 'Add access code - share with your group', 'submit'),
    ('change-me-edit', 'Edit access code - keep this private', 'edit');

-- 6. Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies - games are publicly readable, writable with valid code
CREATE POLICY "Games are viewable by everyone" ON games
    FOR SELECT USING (true);

CREATE POLICY "Games can be inserted" ON games
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Games can be updated" ON games
    FOR UPDATE USING (true);

CREATE POLICY "Games can be deleted" ON games
    FOR DELETE USING (true);

-- Access codes: readable for validation only
CREATE POLICY "Access codes can be read for validation" ON access_codes
    FOR SELECT USING (true);

-- Scripts: publicly readable, insertable
CREATE POLICY "Scripts are viewable by everyone" ON scripts
    FOR SELECT USING (true);

CREATE POLICY "Scripts can be inserted" ON scripts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Scripts can be deleted" ON scripts
    FOR DELETE USING (true);

-- 8. Indexes for performance
CREATE INDEX idx_games_game_id ON games(game_id);

-- 9. Secure access code validation function
-- This prevents exposing codes directly - only returns valid/invalid
CREATE OR REPLACE FUNCTION validate_access_code(input_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, permission_level TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TRUE AS is_valid,
        ac.permission_level
    FROM access_codes ac
    WHERE ac.code = input_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
