/**
 * Database connection module for Blood on the Clocktower stats
 *
 * Connects to Supabase for all data access.
 * Falls back to demo data when Supabase is not configured.
 */

import SITE_CONFIG from './site-config.js';
import { DEMO_GAMES } from './demo-data.js';

// ==========================================
// DEMO MODE DETECTION
// ==========================================
const IS_DEMO = !SITE_CONFIG.supabaseUrl || SITE_CONFIG.supabaseUrl === 'YOUR_SUPABASE_URL';

/**
 * Check if the site is running in demo mode.
 */
export function isDemoMode() {
    return IS_DEMO;
}

// ==========================================
// SUPABASE CLIENT
// ==========================================
let supabase = null;

async function initSupabase() {
    if (IS_DEMO) return null;
    if (supabase) return supabase;
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    supabase = createClient(SITE_CONFIG.supabaseUrl, SITE_CONFIG.supabaseAnonKey);
    return supabase;
}

// ==========================================
// DATA ACCESS FUNCTIONS
// ==========================================

/**
 * Fetch all games from the database.
 * Returns demo data when Supabase is not configured.
 * @returns {Promise<Array>} Array of game objects
 */
export async function fetchGames() {
    if (IS_DEMO) {
        return DEMO_GAMES;
    }

    await initSupabase();
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('game_id', { ascending: true });

    if (error) {
        console.error('Error fetching games:', error);
        throw error;
    }

    return data.map(game => ({
        game_id: game.game_id,
        date: game.date,
        players: game.players,
        winning_team: game.winning_team,
        game_mode: game.game_mode,
        story_teller: game.story_teller,
        modifiers: game.modifiers || null
    }));
}

/**
 * Validate an access code using secure RPC function.
 * @param {string} code - The confirmation code to validate
 * @returns {Promise<boolean>} True if code is valid
 */
export async function validateAccessCode(code) {
    if (IS_DEMO) return false;

    await initSupabase();
    const { data, error } = await supabase
        .rpc('validate_access_code', { input_code: code });

    if (error) {
        console.error('Error validating code:', error);
        return false;
    }

    return data && data.length > 0 && data[0].is_valid === true;
}

/**
 * Submit a new game.
 * @param {Object} gameData - The game data to submit
 * @param {string} code - The confirmation code
 * @returns {Promise<Object>} The inserted game record
 */
export async function submitGame(gameData, code) {
    if (IS_DEMO) throw new Error('Demo mode: Configure Supabase in site-config.js to add games.');

    // Validate code first
    const isValid = await validateAccessCode(code);
    if (!isValid) {
        throw new Error('Invalid confirmation code');
    }

    await initSupabase();

    // Get the next game_id
    const { data: maxGame } = await supabase
        .from('games')
        .select('game_id')
        .order('game_id', { ascending: false })
        .limit(1);

    const nextId = (maxGame && maxGame.length > 0) ? maxGame[0].game_id + 1 : 1;

    // Insert the new game
    const { data, error } = await supabase
        .from('games')
        .insert({
            game_id: nextId,
            date: new Date().toISOString(),
            players: gameData.players,
            winning_team: gameData.winning_team,
            game_mode: gameData.game_mode,
            story_teller: gameData.story_teller,
            modifiers: gameData.modifiers
        })
        .select()
        .single();

    if (error) {
        console.error('Error submitting game:', error);
        throw error;
    }

    return data;
}

/**
 * Get the stored confirmation code from localStorage.
 * @returns {string|null} The stored code or null
 */
export function getStoredCode() {
    return localStorage.getItem('botc_access_code');
}

/**
 * Store a confirmation code in localStorage.
 * @param {string} code - The code to store
 */
export function storeCode(code) {
    localStorage.setItem('botc_access_code', code);
}

/**
 * Clear the stored confirmation code.
 */
export function clearStoredCode() {
    localStorage.removeItem('botc_access_code');
    localStorage.removeItem('botc_permission_level');
}

/**
 * Get stored permission level.
 * @returns {string|null} 'submit', 'edit', or null
 */
export function getStoredPermissionLevel() {
    return localStorage.getItem('botc_permission_level');
}

/**
 * Store permission level in localStorage.
 * @param {string} level - 'submit' or 'edit'
 */
export function storePermissionLevel(level) {
    localStorage.setItem('botc_permission_level', level);
}

// ==========================================
// GAME EDITING FUNCTIONS
// ==========================================

/**
 * Validate access code and return permission level using secure RPC function.
 * @param {string} code - The confirmation code to validate
 * @returns {Promise<string|null>} 'submit', 'edit', or null if invalid
 */
export async function validateAccessCodeWithLevel(code) {
    if (IS_DEMO) return null;

    await initSupabase();
    const { data, error } = await supabase
        .rpc('validate_access_code', { input_code: code });

    if (error) {
        console.error('Error validating code:', error);
        return null;
    }

    if (data && data.length > 0 && data[0].is_valid === true) {
        return data[0].permission_level || 'submit';
    }
    return null;
}

/**
 * Search games by game ID, storyteller, or script.
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching games (summary only)
 */
export async function searchGames(query) {
    if (IS_DEMO) {
        const q = query.trim().toLowerCase();
        const gameIdNum = parseInt(q);
        return DEMO_GAMES.filter(g => {
            if (!isNaN(gameIdNum) && q === String(gameIdNum)) return g.game_id === gameIdNum;
            return (g.story_teller || '').toLowerCase().includes(q) ||
                   (g.game_mode || '').toLowerCase().includes(q);
        }).reverse().slice(0, 20).map(g => ({
            game_id: g.game_id, date: g.date, game_mode: g.game_mode,
            story_teller: g.story_teller, winning_team: g.winning_team
        }));
    }

    await initSupabase();

    const trimmedQuery = query.trim();
    const gameIdNum = parseInt(trimmedQuery);

    // Build search - try game_id first if it's a number
    let searchQuery = supabase
        .from('games')
        .select('game_id, date, game_mode, story_teller, winning_team')
        .order('game_id', { ascending: false })
        .limit(20);

    if (!isNaN(gameIdNum) && trimmedQuery === String(gameIdNum)) {
        searchQuery = searchQuery.eq('game_id', gameIdNum);
    } else {
        searchQuery = searchQuery.or(`story_teller.ilike.%${trimmedQuery}%,game_mode.ilike.%${trimmedQuery}%`);
    }

    const { data, error } = await searchQuery;

    if (error) {
        console.error('Error searching games:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get full game data by game_id.
 * @param {number} gameId - The game ID
 * @returns {Promise<Object>} Full game object
 */
export async function getGameById(gameId) {
    if (IS_DEMO) return DEMO_GAMES.find(g => g.game_id === gameId) || null;

    await initSupabase();
    const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('game_id', gameId)
        .single();

    if (error) {
        console.error('Error fetching game:', error);
        throw error;
    }

    return data;
}

/**
 * Update an existing game.
 * @param {number} gameId - The game ID to update
 * @param {Object} gameData - Updated game data
 * @param {string} code - The edit confirmation code
 * @returns {Promise<Object>} The updated game record
 */
export async function updateGame(gameId, gameData, code) {
    if (IS_DEMO) throw new Error('Demo mode: Configure Supabase in site-config.js to edit games.');

    const level = await validateAccessCodeWithLevel(code);
    if (level !== 'edit') {
        throw new Error('Edit access required. Use the edit code.');
    }

    await initSupabase();
    const { data, error } = await supabase
        .from('games')
        .update({
            players: gameData.players,
            winning_team: gameData.winning_team,
            game_mode: gameData.game_mode,
            story_teller: gameData.story_teller,
            modifiers: gameData.modifiers
        })
        .eq('game_id', gameId)
        .select()
        .single();

    if (error) {
        console.error('Error updating game:', error);
        throw error;
    }

    return data;
}

/**
 * Delete a game.
 * @param {number} gameId - The game ID to delete
 * @param {string} code - The edit confirmation code
 */
export async function deleteGame(gameId, code) {
    if (IS_DEMO) throw new Error('Demo mode: Configure Supabase in site-config.js to delete games.');

    const level = await validateAccessCodeWithLevel(code);
    if (level !== 'edit') {
        throw new Error('Edit access required to delete games.');
    }

    await initSupabase();
    const { error } = await supabase
        .from('games')
        .delete()
        .eq('game_id', gameId);

    if (error) {
        console.error('Error deleting game:', error);
        throw error;
    }
}

// ==========================================
// SCRIPTS MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Fetch all scripts from the database.
 * @returns {Promise<Array>} Array of script objects
 */
export async function fetchScripts() {
    if (IS_DEMO) return [];

    await initSupabase();
    const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching scripts:', error);
        return [];
    }

    return data || [];
}

/**
 * Add a new script to the database.
 * @param {Object} scriptData - { name, category }
 * @param {string} code - The edit confirmation code
 * @returns {Promise<Object>} The inserted script
 */
export async function addScript(scriptData, code) {
    if (IS_DEMO) throw new Error('Demo mode: Configure Supabase in site-config.js to add scripts.');

    const level = await validateAccessCodeWithLevel(code);
    if (level !== 'edit' && level !== 'submit') {
        throw new Error('Access code required to add scripts');
    }

    await initSupabase();
    const { data, error } = await supabase
        .from('scripts')
        .insert({
            name: scriptData.name,
            category: scriptData.category
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding script:', error);
        throw error;
    }

    return data;
}

/**
 * Delete a script.
 * @param {string} scriptName - The script name to delete
 * @param {string} code - The edit confirmation code
 */
export async function deleteScript(scriptName, code) {
    if (IS_DEMO) throw new Error('Demo mode: Configure Supabase in site-config.js to delete scripts.');

    const level = await validateAccessCodeWithLevel(code);
    if (level !== 'edit') {
        throw new Error('Edit access required to delete scripts.');
    }

    await initSupabase();
    const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('name', scriptName);

    if (error) {
        console.error('Error deleting script:', error);
        throw error;
    }
}
