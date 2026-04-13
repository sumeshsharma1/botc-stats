/**
 * Analytics module for Blood on the Clocktower stats.
 *
 * This module provides:
 * - Script categorization (Normal vs Teensyville)
 * - Character role type lookup
 * - StorytellerAnalytics class for computing per-storyteller stats
 * - Player statistics computation
 */

// ==========================================
// CONFIGURATION (ported from botc_config.py)
// ==========================================

// Scripts considered part of the normal rotation
const NORMAL_SCRIPTS = new Set([
    "trouble brewing",
    "bad moon rising",
    "sects & violets",
    "trouble in violets",
    "trouble in legion",
    "hide & seek",
    "trouble brewing on expert mode",
    "trained killer",
    "irrational behavior",
    "binary supernovae",
    "everybody can play"
]);

// Character role type mapping
const CHARACTER_ROLE_TYPES = {
    // Demons
    "al-hadikhia": "Demons",
    "fang_gu": "Demons",
    "imp": "Demons",
    "kazali": "Demons",
    "legion": "Demons",
    "leviathan": "Demons",
    "lil'_monsta": "Demons",
    "lleech": "Demons",
    "lord_of_typhon": "Demons",
    "no_dashii": "Demons",
    "ojo": "Demons",
    "po": "Demons",
    "pukka": "Demons",
    "riot": "Demons",
    "shabaloth": "Demons",
    "vigormortis": "Demons",
    "vortox": "Demons",
    "yaggababble": "Demons",
    "zombuul": "Demons",
    // Minions
    "assassin": "Minions",
    "baron": "Minions",
    "boffin": "Minions",
    "boomdandy": "Minions",
    "cerenovus": "Minions",
    "devil's_advocate": "Minions",
    "evil_twin": "Minions",
    "fearmonger": "Minions",
    "goblin": "Minions",
    "godfather": "Minions",
    "harpy": "Minions",
    "marionette": "Minions",
    "mastermind": "Minions",
    "mezepheles": "Minions",
    "organ_grinder": "Minions",
    "pit-hag": "Minions",
    "poisoner": "Minions",
    "psychopath": "Minions",
    "scarlet_woman": "Minions",
    "spy": "Minions",
    "summoner": "Minions",
    "vizier": "Minions",
    "widow": "Minions",
    "witch": "Minions",
    "wizard": "Minions",
    "wraith": "Minions",
    "xaan": "Minions",
    // Outsiders
    "barber": "Outsiders",
    "butler": "Outsiders",
    "damsel": "Outsiders",
    "drunk": "Outsiders",
    "golem": "Outsiders",
    "goon": "Outsiders",
    "hatter": "Outsiders",
    "heretic": "Outsiders",
    "hermit": "Outsiders",
    "klutz": "Outsiders",
    "lunatic": "Outsiders",
    "moonchild": "Outsiders",
    "mutant": "Outsiders",
    "ogre": "Outsiders",
    "plague_doctor": "Outsiders",
    "politician": "Outsiders",
    "puzzlemaster": "Outsiders",
    "recluse": "Outsiders",
    "saint": "Outsiders",
    "snitch": "Outsiders",
    "sweetheart": "Outsiders",
    "tinker": "Outsiders",
    "zealot": "Outsiders",
    // Townsfolk
    "acrobat": "Townsfolk",
    "alchemist": "Townsfolk",
    "alsaahir": "Townsfolk",
    "amnesiac": "Townsfolk",
    "artist": "Townsfolk",
    "atheist": "Townsfolk",
    "balloonist": "Townsfolk",
    "banshee": "Townsfolk",
    "bounty_hunter": "Townsfolk",
    "cannibal": "Townsfolk",
    "chambermaid": "Townsfolk",
    "chef": "Townsfolk",
    "choirboy": "Townsfolk",
    "clockmaker": "Townsfolk",
    "courtier": "Townsfolk",
    "cult_leader": "Townsfolk",
    "dreamer": "Townsfolk",
    "empath": "Townsfolk",
    "engineer": "Townsfolk",
    "exorcist": "Townsfolk",
    "farmer": "Townsfolk",
    "fisherman": "Townsfolk",
    "flowergirl": "Townsfolk",
    "fool": "Townsfolk",
    "fortune_teller": "Townsfolk",
    "gambler": "Townsfolk",
    "general": "Townsfolk",
    "gossip": "Townsfolk",
    "grandmother": "Townsfolk",
    "high_priestess": "Townsfolk",
    "huntsman": "Townsfolk",
    "innkeeper": "Townsfolk",
    "investigator": "Townsfolk",
    "juggler": "Townsfolk",
    "king": "Townsfolk",
    "knight": "Townsfolk",
    "librarian": "Townsfolk",
    "lycanthrope": "Townsfolk",
    "magician": "Townsfolk",
    "mathematician": "Townsfolk",
    "mayor": "Townsfolk",
    "minstrel": "Townsfolk",
    "monk": "Townsfolk",
    "nightwatchman": "Townsfolk",
    "noble": "Townsfolk",
    "oracle": "Townsfolk",
    "pacifist": "Townsfolk",
    "philosopher": "Townsfolk",
    "pixie": "Townsfolk",
    "poppy_grower": "Townsfolk",
    "preacher": "Townsfolk",
    "princess": "Townsfolk",
    "professor": "Townsfolk",
    "ravenkeeper": "Townsfolk",
    "sage": "Townsfolk",
    "sailor": "Townsfolk",
    "savant": "Townsfolk",
    "seamstress": "Townsfolk",
    "shugenja": "Townsfolk",
    "slayer": "Townsfolk",
    "snake_charmer": "Townsfolk",
    "soldier": "Townsfolk",
    "steward": "Townsfolk",
    "tea_lady": "Townsfolk",
    "town_crier": "Townsfolk",
    "undertaker": "Townsfolk",
    "village_idiot": "Townsfolk",
    "virgin": "Townsfolk",
    "washerwoman": "Townsfolk",
    // Travellers
    "apprentice": "Travellers",
    "barista": "Travellers",
    "beggar": "Travellers",
    "bishop": "Travellers",
    "bone_collector": "Travellers",
    "bureaucrat": "Travellers",
    "butcher": "Travellers",
    "cacklejack": "Travellers",
    "deviant": "Travellers",
    "gangster": "Travellers",
    "gnome": "Travellers",
    "gunslinger": "Travellers",
    "harlot": "Travellers",
    "judge": "Travellers",
    "matron": "Travellers",
    "scapegoat": "Travellers",
    "thief": "Travellers",
    "voudon": "Travellers"
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Normalize a script name for comparison.
 * @param {string} name - Script name
 * @returns {string} Lowercase, trimmed name
 */
export function normalizeScriptName(name) {
    return (name || '').trim().toLowerCase();
}

/**
 * Categorize a script as 'Normal' or 'Teensyville'.
 * @param {string} name - Script name
 * @returns {string} 'Normal' or 'Teensyville'
 */
export function categorizeScript(name) {
    return NORMAL_SCRIPTS.has(normalizeScriptName(name)) ? 'Normal' : 'Teensyville';
}

/**
 * Normalize a character name for lookup.
 * @param {string} name - Character name
 * @returns {string} Normalized name
 */
export function normalizeCharacterName(name) {
    if (!name) return '';
    return name.replace(/ /g, '_').toLowerCase().trim();
}

/**
 * Get the role type for a character.
 * @param {string} characterName - Character name
 * @returns {string} Role type or 'Unknown'
 */
export function getCharacterRoleType(characterName) {
    const normalized = normalizeCharacterName(characterName);

    // Try exact match
    if (CHARACTER_ROLE_TYPES[normalized]) {
        return CHARACTER_ROLE_TYPES[normalized];
    }

    // Try with hyphen/underscore swaps
    if (normalized.includes('-')) {
        const alt = normalized.replace(/-/g, '_');
        if (CHARACTER_ROLE_TYPES[alt]) return CHARACTER_ROLE_TYPES[alt];
    }
    if (normalized.includes('_')) {
        const alt = normalized.replace(/_/g, '-');
        if (CHARACTER_ROLE_TYPES[alt]) return CHARACTER_ROLE_TYPES[alt];
    }

    return 'Unknown';
}

/**
 * Normalize a name for comparison.
 * @param {string} name - Name to normalize
 * @returns {string} Lowercase, trimmed name
 */
function normalizeName(name) {
    return (name || '').trim().toLowerCase();
}

/**
 * Extract all unique storytellers from games.
 * @param {Array} games - Array of game objects
 * @returns {Array} Sorted array of storyteller names
 */
export function extractStorytellers(games) {
    const storytellers = new Set();
    for (const game of games) {
        const stVal = game.story_teller || '';
        if (stVal) {
            // Split on '+' to handle multiple storytellers
            const parts = stVal.split('+').map(p => p.trim()).filter(p => p);
            parts.forEach(p => storytellers.add(p));
        }
    }
    return Array.from(storytellers).sort();
}

/**
 * Check if a game was storytold by the given storyteller.
 * @param {Object} game - Game object
 * @param {string} storytellerName - Storyteller name to check
 * @returns {boolean} True if match found
 */
function hasStoryteller(game, storytellerName) {
    const stVal = game.story_teller || '';
    if (!stVal) return false;

    const parts = stVal.split('+').map(p => normalizeName(p.trim())).filter(p => p);
    const target = normalizeName(storytellerName);

    return parts.some(part => target.includes(part) || part.includes(target));
}

// ==========================================
// STORYTELLER ANALYTICS CLASS
// ==========================================

/**
 * Check if a game has any modifiers (Fabled or Lorics).
 */
function gameHasModifiers(game) {
    if (!game.modifiers) return false;
    const f = game.modifiers.fabled || [];
    const l = game.modifiers.lorics || [];
    return f.length > 0 || l.length > 0;
}

/**
 * Check if a game has Fabled.
 */
function gameHasFabled(game) {
    return game.modifiers && (game.modifiers.fabled || []).length > 0;
}

/**
 * Check if a game has Lorics.
 */
function gameHasLorics(game) {
    return game.modifiers && (game.modifiers.lorics || []).length > 0;
}

/**
 * Filter games by modifier setting.
 * @param {Array} games - Games to filter
 * @param {string} modifierFilter - 'all', 'none', 'any', 'fabled', 'lorics'
 */
function filterByModifier(games, modifierFilter) {
    switch (modifierFilter) {
        case 'none': return games.filter(g => !gameHasModifiers(g));
        case 'any': return games.filter(g => gameHasModifiers(g));
        case 'fabled': return games.filter(g => gameHasFabled(g));
        case 'lorics': return games.filter(g => gameHasLorics(g));
        default: return games;
    }
}

/**
 * Compute statistics for games run by a specific storyteller.
 */
export class StorytellerAnalytics {
    /**
     * @param {Array} allGames - All games from database
     * @param {string} storytellerName - Storyteller to filter by ('All' for all games)
     * @param {string} modifierFilter - Modifier filter: 'all', 'none', 'any', 'fabled', 'lorics'
     */
    constructor(allGames, storytellerName = 'All', modifierFilter = 'all') {
        this.storytellerName = storytellerName;
        this.modifierFilter = modifierFilter;

        // Filter games by storyteller
        let games;
        if (storytellerName === 'All') {
            games = allGames;
        } else {
            games = allGames.filter(g => hasStoryteller(g, storytellerName));
        }

        // Filter by modifier
        this.games = filterByModifier(games, modifierFilter);

        this.scriptStats = {};
        this.categoryTotals = {
            Normal: { games: 0, good_wins: 0, evil_wins: 0 },
            Teensyville: { games: 0, good_wins: 0, evil_wins: 0 }
        };
        this.playerStats = {};
        this.modifierStats = { fabled: {}, lorics: {} };

        this._computeScriptStats();
        this._computePlayerStats();
        this._computeModifierStats(allGames, storytellerName);
    }

    /**
     * Compute per-script statistics and category totals.
     */
    _computeScriptStats() {
        for (const game of this.games) {
            const script = game.game_mode || '';
            const category = categorizeScript(script);

            if (!this.scriptStats[script]) {
                this.scriptStats[script] = {
                    category,
                    games: 0,
                    good_wins: 0,
                    evil_wins: 0,
                    mod_games: 0
                };
            }

            this.scriptStats[script].games++;
            if (gameHasModifiers(game)) {
                this.scriptStats[script].mod_games++;
            }
            if (game.winning_team === 'Good') {
                this.scriptStats[script].good_wins++;
            } else {
                this.scriptStats[script].evil_wins++;
            }
        }

        // Compute category totals
        for (const [script, entry] of Object.entries(this.scriptStats)) {
            const cat = entry.category;
            this.categoryTotals[cat].games += entry.games;
            this.categoryTotals[cat].good_wins += entry.good_wins;
            this.categoryTotals[cat].evil_wins += entry.evil_wins;
        }
    }

    /**
     * Compute per-player statistics.
     */
    _computePlayerStats() {
        for (const game of this.games) {
            const winningTeam = game.winning_team;
            const script = game.game_mode || '';

            for (const p of (game.players || [])) {
                const name = (p.name || '').trim();
                if (!name) continue;

                const team = p.team;

                if (!this.playerStats[name]) {
                    this.playerStats[name] = {
                        games: 0,
                        wins: 0,
                        good_games: 0,
                        good_wins: 0,
                        evil_games: 0,
                        evil_wins: 0,
                        scripts: {},
                        roles: {}
                    };
                }

                const entry = this.playerStats[name];
                entry.games++;

                if (team === winningTeam) {
                    entry.wins++;
                }

                // Alignment breakdown
                if (team === 'Good') {
                    entry.good_games++;
                    if (team === winningTeam) {
                        entry.good_wins++;
                    }
                } else if (team === 'Evil') {
                    entry.evil_games++;
                    if (team === winningTeam) {
                        entry.evil_wins++;
                    }
                }

                // Per-script counts
                if (!entry.scripts[script]) {
                    entry.scripts[script] = {
                        games: 0,
                        wins: 0,
                        good_games: 0,
                        good_wins: 0,
                        evil_games: 0,
                        evil_wins: 0
                    };
                }
                entry.scripts[script].games++;
                if (team === winningTeam) {
                    entry.scripts[script].wins++;
                }
                if (team === 'Good') {
                    entry.scripts[script].good_games++;
                    if (team === winningTeam) {
                        entry.scripts[script].good_wins++;
                    }
                } else if (team === 'Evil') {
                    entry.scripts[script].evil_games++;
                    if (team === winningTeam) {
                        entry.scripts[script].evil_wins++;
                    }
                }

                // Role counts
                const rolesList = p.roles || [p.role];
                for (const role of rolesList) {
                    if (!role) continue;
                    if (!entry.roles[role]) {
                        entry.roles[role] = { games: 0, wins: 0 };
                    }
                    entry.roles[role].games++;
                    if (team === winningTeam) {
                        entry.roles[role].wins++;
                    }
                }
            }
        }
    }

    /**
     * Compute per-modifier statistics (always from full storyteller-filtered set, ignoring modifier filter).
     */
    _computeModifierStats(allGames, storytellerName) {
        // Use storyteller-filtered but NOT modifier-filtered games
        let games;
        if (storytellerName === 'All') {
            games = allGames;
        } else {
            games = allGames.filter(g => hasStoryteller(g, storytellerName));
        }

        for (const game of games) {
            if (!game.modifiers) continue;

            const fabled = game.modifiers.fabled || [];
            const lorics = game.modifiers.lorics || [];
            const won = game.winning_team;

            for (const name of fabled) {
                if (!this.modifierStats.fabled[name]) {
                    this.modifierStats.fabled[name] = { games: 0, good_wins: 0, evil_wins: 0 };
                }
                this.modifierStats.fabled[name].games++;
                if (won === 'Good') this.modifierStats.fabled[name].good_wins++;
                else this.modifierStats.fabled[name].evil_wins++;
            }

            for (const name of lorics) {
                if (!this.modifierStats.lorics[name]) {
                    this.modifierStats.lorics[name] = { games: 0, good_wins: 0, evil_wins: 0 };
                }
                this.modifierStats.lorics[name].games++;
                if (won === 'Good') this.modifierStats.lorics[name].good_wins++;
                else this.modifierStats.lorics[name].evil_wins++;
            }
        }
    }

    /**
     * Get modifier stats summary (total counts).
     */
    getModifierSummary(allGames, storytellerName) {
        let games;
        if (storytellerName === 'All') {
            games = allGames;
        } else {
            games = allGames.filter(g => hasStoryteller(g, storytellerName));
        }

        let totalMod = 0, fabledCount = 0, loricsCount = 0;
        for (const g of games) {
            if (gameHasModifiers(g)) totalMod++;
            if (gameHasFabled(g)) fabledCount++;
            if (gameHasLorics(g)) loricsCount++;
        }
        return { totalMod, fabledCount, loricsCount };
    }

    /**
     * Get overall summary statistics.
     * @returns {Object} Summary with total games, good/evil wins and percentages
     */
    getSummary() {
        const totalGames = this.games.length;
        const goodWins = this.games.filter(g => g.winning_team === 'Good').length;
        const evilWins = totalGames - goodWins;

        return {
            totalGames,
            goodWins,
            evilWins,
            goodPct: totalGames > 0 ? (goodWins / totalGames * 100).toFixed(1) : '0.0',
            evilPct: totalGames > 0 ? (evilWins / totalGames * 100).toFixed(1) : '0.0'
        };
    }

    /**
     * Get script statistics as sorted array.
     * @param {string} sortBy - Field to sort by
     * @param {boolean} ascending - Sort direction
     * @returns {Array} Array of [scriptName, stats] entries
     */
    getScriptStatsArray(sortBy = 'good_pct', ascending = false) {
        const entries = Object.entries(this.scriptStats).map(([script, stats]) => {
            const goodPct = stats.games > 0 ? (stats.good_wins / stats.games * 100) : 0;
            const evilPct = stats.games > 0 ? (stats.evil_wins / stats.games * 100) : 0;
            return [script, { ...stats, good_pct: goodPct, evil_pct: evilPct }];
        });

        entries.sort((a, b) => {
            let aVal, bVal;
            switch (sortBy) {
                case 'script':
                    aVal = a[0].toLowerCase();
                    bVal = b[0].toLowerCase();
                    break;
                case 'category':
                    aVal = a[1].category;
                    bVal = b[1].category;
                    break;
                default:
                    aVal = a[1][sortBy] || 0;
                    bVal = b[1][sortBy] || 0;
            }
            if (ascending) {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });

        return entries;
    }

    /**
     * Get character statistics for given filters.
     * @param {string} scriptFilter - 'All', 'Normal', 'Teensyville', or specific script name
     * @param {string} roleTypeFilter - 'All' or specific role type
     * @returns {Array} Array of character stat objects
     */
    getCharacterStats(scriptFilter = 'All', roleTypeFilter = 'All') {
        // Filter games based on script selection
        let filteredGames;
        if (scriptFilter === 'All') {
            filteredGames = this.games;
        } else if (scriptFilter === 'Normal') {
            filteredGames = this.games.filter(g => categorizeScript(g.game_mode || '') === 'Normal');
        } else if (scriptFilter === 'Teensyville') {
            filteredGames = this.games.filter(g => categorizeScript(g.game_mode || '') === 'Teensyville');
        } else {
            filteredGames = this.games.filter(g => (g.game_mode || '') === scriptFilter);
        }

        // Aggregate per-character stats
        const charStats = {};
        for (const game of filteredGames) {
            const winningTeam = game.winning_team;

            // Map each role to teams of players with that role
            const roleTeams = {};
            for (const p of (game.players || [])) {
                const role = p.role || '';
                if (!role) continue;
                if (!roleTeams[role]) roleTeams[role] = [];
                roleTeams[role].push(p.team);
            }

            // Count unique roles per game
            for (const [role, teams] of Object.entries(roleTeams)) {
                if (!charStats[role]) {
                    charStats[role] = {
                        games: 0,
                        wins: 0,
                        role_type: getCharacterRoleType(role)
                    };
                }
                charStats[role].games++;
                if (teams.includes(winningTeam)) {
                    charStats[role].wins++;
                }
            }
        }

        // Convert to array and apply role type filter
        let result = Object.entries(charStats).map(([role, stats]) => ({
            character: role,
            role_type: stats.role_type,
            games: stats.games,
            wins: stats.wins,
            win_pct: stats.games > 0 ? (stats.wins / stats.games * 100) : 0
        }));

        if (roleTypeFilter !== 'All') {
            result = result.filter(r => r.role_type === roleTypeFilter);
        }

        // Sort by win percentage descending
        result.sort((a, b) => b.win_pct - a.win_pct);

        return result;
    }

    /**
     * Get sorted list of player names.
     * @returns {Array} Sorted array of player names
     */
    getPlayerNames() {
        return Object.keys(this.playerStats).sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
        );
    }

    /**
     * Get detailed stats for a specific player.
     * @param {string} playerName - Player name
     * @returns {Object|null} Player stats or null if not found
     */
    getPlayerStats(playerName) {
        return this.playerStats[playerName] || null;
    }
}

// ==========================================
// HEAD-TO-HEAD ANALYSIS (ported from analyze_player_vs.py)
// ==========================================

/**
 * Analyze the matchup between two players.
 * @param {Array} games - Array of game objects
 * @param {string} playerA - First player name
 * @param {string} playerB - Second player name
 * @returns {Object} Matchup analysis results
 */
export function analyzeHeadToHead(games, playerA, playerB) {
    // Find games where both players participated
    const togetherGames = [];

    for (const game of games) {
        const players = game.players || [];
        let aTeam = null;
        let bTeam = null;

        for (const p of players) {
            if (p.name === playerA) aTeam = p.team;
            if (p.name === playerB) bTeam = p.team;
        }

        if (aTeam && bTeam) {
            togetherGames.push({
                game_id: game.game_id,
                a_team: aTeam,
                b_team: bTeam,
                winning_team: game.winning_team
            });
        }
    }

    // Split into same team vs opposite teams
    const sameTeamGames = togetherGames.filter(g => g.a_team === g.b_team);
    const oppositeTeamGames = togetherGames.filter(g => g.a_team !== g.b_team);

    // Same team breakdown
    const sameTeamBothGood = sameTeamGames.filter(g => g.a_team === 'Good');
    const sameTeamBothEvil = sameTeamGames.filter(g => g.a_team === 'Evil');

    const sameTeamWinsBothGood = sameTeamBothGood.filter(g => g.winning_team === g.a_team).length;
    const sameTeamWinsBothEvil = sameTeamBothEvil.filter(g => g.winning_team === g.a_team).length;

    // Opposite teams breakdown
    const oppAGood = oppositeTeamGames.filter(g => g.a_team === 'Good'); // A is Good, B is Evil
    const oppAEvil = oppositeTeamGames.filter(g => g.a_team === 'Evil'); // A is Evil, B is Good

    const aWinsWhenGood = oppAGood.filter(g => g.winning_team === g.a_team).length;
    const aWinsWhenEvil = oppAEvil.filter(g => g.winning_team === g.a_team).length;

    const bWinsWhenGood = oppAEvil.filter(g => g.winning_team === g.b_team).length;
    const bWinsWhenEvil = oppAGood.filter(g => g.winning_team === g.b_team).length;

    const aWinsOpp = aWinsWhenGood + aWinsWhenEvil;
    const bWinsOpp = bWinsWhenGood + bWinsWhenEvil;

    const pct = (num, denom) => denom > 0 ? (num / denom * 100).toFixed(1) : '0.0';

    return {
        total_together: togetherGames.length,
        same_team: {
            games: sameTeamGames.length,
            wins: sameTeamWinsBothGood + sameTeamWinsBothEvil,
            win_pct: pct(sameTeamWinsBothGood + sameTeamWinsBothEvil, sameTeamGames.length),
            both_good: {
                games: sameTeamBothGood.length,
                wins: sameTeamWinsBothGood,
                win_pct: pct(sameTeamWinsBothGood, sameTeamBothGood.length)
            },
            both_evil: {
                games: sameTeamBothEvil.length,
                wins: sameTeamWinsBothEvil,
                win_pct: pct(sameTeamWinsBothEvil, sameTeamBothEvil.length)
            }
        },
        opposite_teams: {
            games: oppositeTeamGames.length,
            [playerA]: {
                wins: aWinsOpp,
                win_pct: pct(aWinsOpp, oppositeTeamGames.length),
                when_good: {
                    games: oppAGood.length,
                    wins: aWinsWhenGood,
                    win_pct: pct(aWinsWhenGood, oppAGood.length)
                },
                when_evil: {
                    games: oppAEvil.length,
                    wins: aWinsWhenEvil,
                    win_pct: pct(aWinsWhenEvil, oppAEvil.length)
                }
            },
            [playerB]: {
                wins: bWinsOpp,
                win_pct: pct(bWinsOpp, oppositeTeamGames.length),
                when_good: {
                    games: oppAEvil.length, // B is Good when A is Evil
                    wins: bWinsWhenGood,
                    win_pct: pct(bWinsWhenGood, oppAEvil.length)
                },
                when_evil: {
                    games: oppAGood.length, // B is Evil when A is Good
                    wins: bWinsWhenEvil,
                    win_pct: pct(bWinsWhenEvil, oppAGood.length)
                }
            }
        },
        game_ids: togetherGames.map(g => g.game_id)
    };
}

// ==========================================
// CHARACTER ELO CALCULATION
// ==========================================

// K-factor for ELO calculation (same as player ELO)
const CHARACTER_K_FACTOR = 32;
const CHARACTER_INITIAL_RATING = 1500;

/**
 * Calculate ELO ratings for all characters based on game outcomes.
 * Uses team average approach - each character's ELO change is based on
 * their team's average rating vs the opposing team's average rating.
 *
 * @param {Array} games - Array of game objects (sorted by game_id)
 * @returns {Object} Map of character name to {rating, games, wins}
 */
export function calculateCharacterElo(games) {
    const ratings = {};  // character_name -> { rating, games, wins }

    // Sort games by game_id to ensure consistent chronological order
    const sortedGames = [...games].sort((a, b) => a.game_id - b.game_id);

    for (const game of sortedGames) {
        const players = game.players || [];
        const winningTeam = game.winning_team;

        // Get unique characters by team (handles duplicates like Legion)
        const goodChars = [...new Set(
            players.filter(p => p.team === 'Good').map(p => p.role).filter(r => r)
        )];
        const evilChars = [...new Set(
            players.filter(p => p.team === 'Evil').map(p => p.role).filter(r => r)
        )];

        // Skip games with no characters on either team
        if (goodChars.length === 0 || evilChars.length === 0) continue;

        // Initialize ratings for new characters
        for (const char of [...goodChars, ...evilChars]) {
            if (!ratings[char]) {
                ratings[char] = {
                    rating: CHARACTER_INITIAL_RATING,
                    games: 0,
                    wins: 0
                };
            }
        }

        // Calculate team average ratings
        const goodAvg = averageRating(goodChars, ratings);
        const evilAvg = averageRating(evilChars, ratings);

        // Calculate expected scores using ELO formula
        const expGood = 1 / (1 + Math.pow(10, (evilAvg - goodAvg) / 400));
        const expEvil = 1 - expGood;

        // Determine actual results
        const resultGood = winningTeam === 'Good' ? 1 : 0;
        const resultEvil = 1 - resultGood;

        // Update ratings for all characters on Good team
        for (const char of goodChars) {
            const delta = CHARACTER_K_FACTOR * (resultGood - expGood);
            ratings[char].rating += delta;
            ratings[char].games++;
            if (winningTeam === 'Good') {
                ratings[char].wins++;
            }
        }

        // Update ratings for all characters on Evil team
        for (const char of evilChars) {
            const delta = CHARACTER_K_FACTOR * (resultEvil - expEvil);
            ratings[char].rating += delta;
            ratings[char].games++;
            if (winningTeam === 'Evil') {
                ratings[char].wins++;
            }
        }
    }

    return ratings;
}

/**
 * Calculate average rating for a list of characters.
 * @param {Array} characters - Array of character names
 * @param {Object} ratings - Map of character name to rating object
 * @returns {number} Average rating
 */
function averageRating(characters, ratings) {
    if (characters.length === 0) return CHARACTER_INITIAL_RATING;

    const sum = characters.reduce((acc, char) => {
        return acc + (ratings[char]?.rating || CHARACTER_INITIAL_RATING);
    }, 0);

    return sum / characters.length;
}

// ==========================================
// CHARACTER DETAIL BREAKDOWN
// ==========================================

/**
 * Get detailed breakdown of a character's performance by script.
 * Handles characters that can appear multiple times in a game (e.g., Legion, Village Idiot).
 * Each game counts as 1 game regardless of how many players had the character.
 *
 * @param {Array} games - Array of game objects
 * @param {string} characterName - Name of the character to analyze
 * @returns {Object} Breakdown with wins/losses by script and players who played it
 */
export function getCharacterScriptBreakdown(games, characterName) {
    const winsByScript = {};   // script -> count
    const lossesByScript = {}; // script -> count
    const playerCounts = {};   // player -> count (for "Played By" - still counts each player)
    let totalWins = 0;
    let totalGames = 0;

    for (const game of games) {
        const players = game.players || [];
        const winningTeam = game.winning_team;
        const script = game.game_mode || 'Unknown';

        // Find all players who played this character in this game
        const playersWithChar = players.filter(p => p.role === characterName);

        // Skip games where this character doesn't appear
        if (playersWithChar.length === 0) continue;

        // Count this as ONE game (not per player)
        totalGames++;

        // Track each player who played this character (for "Played By" section)
        for (const player of playersWithChar) {
            playerCounts[player.name] = (playerCounts[player.name] || 0) + 1;
        }

        // Did the character win? Check if any player with this character was on winning team
        // (For Legion/Village Idiot, they should all be on same team anyway)
        const charWon = playersWithChar.some(p => p.team === winningTeam);

        if (charWon) {
            totalWins++;
            winsByScript[script] = (winsByScript[script] || 0) + 1;
        } else {
            lossesByScript[script] = (lossesByScript[script] || 0) + 1;
        }
    }

    // Sort scripts by count (descending)
    const sortedWins = Object.entries(winsByScript)
        .sort((a, b) => b[1] - a[1]);
    const sortedLosses = Object.entries(lossesByScript)
        .sort((a, b) => b[1] - a[1]);

    // Sort players by games played (descending)
    const sortedPlayers = Object.entries(playerCounts)
        .sort((a, b) => b[1] - a[1]);

    return {
        totalGames,
        totalWins,
        totalLosses: totalGames - totalWins,
        winPct: totalGames > 0 ? (totalWins / totalGames * 100).toFixed(1) : '0.0',
        winsByScript: sortedWins,
        lossesByScript: sortedLosses,
        players: sortedPlayers
    };
}
