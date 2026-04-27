/**
 * Blood on the Clocktower Stats - Main Application
 */

import { recalcAll, getLeaderboard, pctToStr, getRatingDelta, DEFAULT_RATING } from './elo.js';
import { recalcAllGlicko2, getGlicko2Leaderboard } from './glicko2.js';
import { fetchGames, isDemoMode } from './supabase.js';
import { initGameEntry, updatePlayerNames } from './gameEntry.js';
import SITE_CONFIG from './site-config.js';

// Global state
let gameLog = [];
let players = {};
let leaderboard = [];
let glicko2Players = {};
let glicko2Leaderboard = [];
let currentRatingSystem = 'elo'; // 'elo' | 'glicko2'
let currentSort = { column: 'rating', ascending: false };

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const contentEl = document.getElementById('content');
const tableBodyEl = document.getElementById('leaderboard-body');
const gameRangeInput = document.getElementById('game-range');
const clearRangeBtn = document.getElementById('clear-range');
const dateFromInput = document.getElementById('date-from');
const dateToInput = document.getElementById('date-to');

// Stats elements
const totalGamesEl = document.getElementById('total-games');
const totalPlayersEl = document.getElementById('total-players');
const goodWinsEl = document.getElementById('good-wins');
const evilWinsEl = document.getElementById('evil-wins');
const goodWinsCountEl = document.getElementById('good-wins-count');
const evilWinsCountEl = document.getElementById('evil-wins-count');
const winBarGoodEl = document.getElementById('win-bar-good');
const winBarEvilEl = document.getElementById('win-bar-evil');

/**
 * Initialize the application
 */
async function init() {
    try {
        showLoading();

        // Apply community name from config
        const h1 = document.querySelector('header h1');
        if (h1 && SITE_CONFIG.communityName) {
            h1.textContent = SITE_CONFIG.communityName;
        }

        // Show demo banner if in demo mode
        if (isDemoMode()) {
            const banner = document.createElement('div');
            banner.className = 'demo-banner';
            banner.innerHTML = 'Demo Mode — showing sample data. <a href="https://github.com/RossFW/botc-stats#quick-start-5-steps" target="_blank">Set up your own</a>';
            document.querySelector('.container').prepend(banner);
        }

        // Fetch game data
        gameLog = await fetchGames();

        // Calculate ELO ratings
        players = recalcAll(gameLog);
        leaderboard = getLeaderboard(players);

        // Calculate Glicko-2 ratings
        glicko2Players = recalcAllGlicko2(gameLog);
        glicko2Leaderboard = getGlicko2Leaderboard(glicko2Players);

        // Update stats summary
        updateStatsSummary();

        // Render the leaderboard
        renderLeaderboard();

        // Set up event listeners
        setupEventListeners();
        setupTabListeners();

        // Initialize game entry module with refresh callback and player names from Supabase
        const playerNames = [...new Set(gameLog.flatMap(g => g.players.map(p => p.name)))].sort();
        initGameEntry(refreshData, playerNames);

        showContent();
    } catch (error) {
        console.error('Failed to initialize:', error);
        showError(error.message);
    }
}

/**
 * Show loading state
 */
function showLoading() {
    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    contentEl.style.display = 'none';
}

/**
 * Show error state
 */
function showError(message) {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    errorEl.querySelector('.error-text').textContent = message;
    contentEl.style.display = 'none';
}

/**
 * Show main content
 */
function showContent() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'none';
    contentEl.style.display = 'block';
}

/**
 * Refresh data from the database (called after game is added)
 */
async function refreshData() {
    try {
        // Refetch games
        gameLog = await fetchGames();

        // Recalculate ELO ratings
        players = recalcAll(gameLog);
        leaderboard = getLeaderboard(players);

        // Recalculate Glicko-2 ratings
        glicko2Players = recalcAllGlicko2(gameLog);
        glicko2Leaderboard = getGlicko2Leaderboard(glicko2Players);

        // Update display
        updateStatsSummary();
        renderLeaderboard();

        // Update autocomplete with any new player names from Supabase
        const updatedNames = [...new Set(gameLog.flatMap(g => g.players.map(p => p.name)))].sort();
        updatePlayerNames(updatedNames);
    } catch (error) {
        console.error('Failed to refresh data:', error);
    }
}

/**
 * Update the stats summary cards
 */
function updateStatsSummary() {
    const totalGames = gameLog.length;
    const noGamesMsg = document.getElementById('no-games-msg');

    if (totalGames === 0) {
        totalGamesEl.textContent = 0;
        totalPlayersEl.textContent = 0;
        if (winBarGoodEl) winBarGoodEl.style.display = 'none';
        if (winBarEvilEl) winBarEvilEl.style.display = 'none';
        if (noGamesMsg) noGamesMsg.style.display = 'block';
        return;
    }

    // Hide message
    if (noGamesMsg) noGamesMsg.style.display = 'none';

    const goodWins = gameLog.filter(g => g.winning_team === 'Good').length;
    const evilWins = gameLog.filter(g => g.winning_team === 'Evil').length;
    const uniquePlayers = new Set(gameLog.flatMap(g => g.players.map(p => p.name))).size;

    totalGamesEl.textContent = totalGames;
    totalPlayersEl.textContent = uniquePlayers;
    const goodPct = ((goodWins / totalGames) * 100).toFixed(1);
    const evilPct = ((evilWins / totalGames) * 100).toFixed(1);
    goodWinsEl.textContent = `${goodPct}%`;
    evilWinsEl.textContent = `${evilPct}%`;
    if (goodWinsCountEl) goodWinsCountEl.textContent = goodWins;
    if (evilWinsCountEl) evilWinsCountEl.textContent = evilWins;

    // Hide bar segment when 0%, show when > 0%
    if (winBarGoodEl) {
        winBarGoodEl.style.display = goodWins > 0 ? '' : 'none';
        winBarGoodEl.style.width = `${goodPct}%`;
    }
    if (winBarEvilEl) {
        winBarEvilEl.style.display = evilWins > 0 ? '' : 'none';
        winBarEvilEl.style.width = `${evilPct}%`;
    }
}

/**
 * Return the leaderboard for the currently active rating system.
 */
function getActiveLeaderboard() {
    return currentRatingSystem === 'elo' ? leaderboard : glicko2Leaderboard;
}

/**
 * Set up the ELO / Glicko-2 tab switcher.
 */
function setupTabListeners() {
    document.querySelectorAll('.rating-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            if (tab.dataset.system === currentRatingSystem) return;

            currentRatingSystem = tab.dataset.system;

            // Update active tab styling
            document.querySelectorAll('.rating-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show/hide the ±RD column
            const rdHeader = document.getElementById('rd-header');
            const isGlicko2 = currentRatingSystem === 'glicko2';
            if (rdHeader) rdHeader.style.display = isGlicko2 ? '' : 'none';

            // Re-render with new system
            renderLeaderboard();
        });
    });
}

/**
 * Parse game range input.
 * @returns {{start: number|null, end: number|null}}
 */
function parseGameRange() {
    const rangeStr = gameRangeInput.value.trim();
    if (!rangeStr) {
        return { start: null, end: null };
    }

    try {
        if (rangeStr.includes('-')) {
            const parts = rangeStr.split('-');
            if (parts.length === 2) {
                const start = parts[0].trim() ? parseInt(parts[0].trim()) : null;
                const end = parts[1].trim() ? parseInt(parts[1].trim()) : null;
                return { start, end };
            }
        } else {
            const gameNum = parseInt(rangeStr);
            return { start: gameNum, end: gameNum };
        }
    } catch {
        return { start: null, end: null };
    }

    return { start: null, end: null };
}

/**
 * Parse date range inputs and map them to a game ID range.
 * @returns {{start: number|null, end: number|null, hasFilter: boolean}}
 */
function parseDateRange() {
    const fromStr = dateFromInput ? dateFromInput.value : '';
    const toStr   = dateToInput   ? dateToInput.value   : '';
    if (!fromStr && !toStr) return { start: null, end: null, hasFilter: false };

    // Treat inputs as local dates — start of "from" day, end of "to" day
    const fromDate = fromStr ? new Date(fromStr + 'T00:00:00') : null;
    const toDate   = toStr   ? new Date(toStr   + 'T23:59:59') : null;

    const filtered = gameLog.filter(g => {
        const d = new Date(g.date);
        if (fromDate && d < fromDate) return false;
        if (toDate   && d > toDate)   return false;
        return true;
    });

    // Date filter was set but no games fall in range — signal "nothing to show"
    if (filtered.length === 0) return { start: null, end: null, hasFilter: true };

    const ids = filtered.map(g => g.game_id);
    return { start: Math.min(...ids), end: Math.max(...ids), hasFilter: true };
}

/**
 * Render the leaderboard table
 */
function renderLeaderboard() {
    const isGlicko2 = currentRatingSystem === 'glicko2';

    // Determine active range: game range takes priority over date range
    const gameRange = parseGameRange();
    let { start, end } = gameRange;
    let hasActiveFilter = start !== null || end !== null;

    if (!hasActiveFilter) {
        const dateRange = parseDateRange();
        start = dateRange.start;
        end = dateRange.end;
        hasActiveFilter = dateRange.hasFilter;
    }

    // Sync RD column visibility with current system
    const rdHeader = document.getElementById('rd-header');
    if (rdHeader) rdHeader.style.display = isGlicko2 ? '' : 'none';

    // Sort the leaderboard
    const sortedLeaderboard = [...getActiveLeaderboard()].sort((a, b) => {
        let aVal, bVal;

        switch (currentSort.column) {
            case 'rank':
                aVal = a.rank;
                bVal = b.rank;
                break;
            case 'name':
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                return currentSort.ascending
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            case 'rating':
                aVal = a.rating;
                bVal = b.rating;
                break;
            case 'overall':
                aVal = a.overallWinPct || 0;
                bVal = b.overallWinPct || 0;
                break;
            case 'good':
                aVal = a.goodWinPct || 0;
                bVal = b.goodWinPct || 0;
                break;
            case 'evil':
                aVal = a.evilWinPct || 0;
                bVal = b.evilWinPct || 0;
                break;
            case 'games':
                aVal = a.gamesPlayed;
                bVal = b.gamesPlayed;
                break;
            case 'rd':
                aVal = a.rd || 0;
                bVal = b.rd || 0;
                break;
            default:
                aVal = a.rating;
                bVal = b.rating;
        }

        return currentSort.ascending ? aVal - bVal : bVal - aVal;
    });

    // Clear existing rows
    tableBodyEl.innerHTML = '';

    // Add rows
    sortedLeaderboard.forEach((player, index) => {
        // No active filter → default to total change from starting rating
        // Filter active but no matching games → null (shows '–')
        // Filter active with range → delta over that range
        const delta = !hasActiveFilter
            ? player.rating - DEFAULT_RATING
            : getRatingDelta(player, start, end);
        const deltaStr = delta !== null ? (delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : '–';
        const deltaClass = delta !== null ? (delta > 0 ? 'delta-positive' : delta < 0 ? 'delta-negative' : '') : '';
        const deltaTextClass = delta !== null ? (delta > 0 ? 'delta-positive-text' : delta < 0 ? 'delta-negative-text' : '') : '';

        const row = document.createElement('tr');
        row.className = `clickable ${deltaClass}`;
        row.dataset.playerName = player.name;

        // Rank styling
        let rankClass = '';
        if (player.rank === 1) rankClass = 'rank-1';
        else if (player.rank === 2) rankClass = 'rank-2';
        else if (player.rank === 3) rankClass = 'rank-3';

        const rdCell = isGlicko2 && player.rd !== undefined
            ? `<td class="rd" style="display:${isGlicko2 ? '' : 'none'}">±${player.rd.toFixed(0)}</td>`
            : `<td class="rd" style="display:none"></td>`;

        row.innerHTML = `
            <td class="rank ${rankClass}">${player.rank}</td>
            <td class="player-name">${formatPlayerName(player.name)}</td>
            <td class="rating">${player.rating.toFixed(1)}</td>
            ${rdCell}
            <td class="delta ${deltaTextClass}">${deltaStr}</td>
            <td class="pct">
                <div class="pct-bar">
                    <span>${pctToStr(player.overallWinPct)}%</span>
                    <div class="bar">
                        <div class="bar-fill overall" style="width: ${player.overallWinPct || 0}%"></div>
                    </div>
                </div>
            </td>
            <td class="pct">
                <div class="pct-bar">
                    <span>${pctToStr(player.goodWinPct)}%</span>
                    <div class="bar">
                        <div class="bar-fill good" style="width: ${player.goodWinPct || 0}%"></div>
                    </div>
                </div>
            </td>
            <td class="pct">
                <div class="pct-bar">
                    <span>${pctToStr(player.evilWinPct)}%</span>
                    <div class="bar">
                        <div class="bar-fill evil" style="width: ${player.evilWinPct || 0}%"></div>
                    </div>
                </div>
            </td>
            <td class="games">${player.gamesPlayed}</td>
        `;

        row.addEventListener('click', () => showPlayerModal(player));
        tableBodyEl.appendChild(row);
    });

    // Update column headers for sort indicators
    updateSortIndicators();
}

/**
 * Format player name for display (replace underscores with spaces)
 */
function formatPlayerName(name) {
    return name.replace(/_/g, ' ');
}

/**
 * Update sort indicators on column headers
 */
function updateSortIndicators() {
    document.querySelectorAll('.leaderboard-table th[data-sort]').forEach(th => {
        th.classList.remove('sorted-asc', 'sorted-desc');
        if (th.dataset.sort === currentSort.column) {
            th.classList.add(currentSort.ascending ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Game range input
    gameRangeInput.addEventListener('input', () => renderLeaderboard());

    // Date range inputs
    if (dateFromInput) dateFromInput.addEventListener('input', () => renderLeaderboard());
    if (dateToInput)   dateToInput.addEventListener('input',   () => renderLeaderboard());

    // Clear all range filters
    clearRangeBtn.addEventListener('click', () => {
        gameRangeInput.value = '';
        if (dateFromInput) dateFromInput.value = '';
        if (dateToInput)   dateToInput.value   = '';
        renderLeaderboard();
    });

    // Column sorting
    document.querySelectorAll('.leaderboard-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const column = th.dataset.sort;
            if (currentSort.column === column) {
                currentSort.ascending = !currentSort.ascending;
            } else {
                currentSort.column = column;
                currentSort.ascending = column === 'name'; // Default ascending for name
            }
            renderLeaderboard();
        });
    });

    // Player modal close
    document.querySelector('#player-modal-overlay .modal-close').addEventListener('click', closePlayerModal);
    document.getElementById('player-modal-overlay').addEventListener('click', (e) => {
        if (e.target.id === 'player-modal-overlay') closePlayerModal();
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayerModal();
        }
    });
}

/**
 * Compute teammate synergy stats: for each co-player, win rate on same team vs opposite team.
 */
function buildSynergyStats(player) {
    const map = {};
    for (const g of player.gameHistory) {
        const game = gameLog.find(gl => gl.game_id === g.gameNumber);
        if (!game) continue;
        for (const gp of game.players) {
            if (gp.name === player.name) continue;
            const isTeammate = gp.team === g.team;
            if (!map[gp.name]) map[gp.name] = { sameG: 0, sameW: 0, oppG: 0, oppW: 0 };
            if (isTeammate) { map[gp.name].sameG++; if (g.win) map[gp.name].sameW++; }
            else            { map[gp.name].oppG++;  if (g.win) map[gp.name].oppW++;  }
        }
    }
    return Object.entries(map)
        .map(([name, s]) => ({
            name,
            sameG: s.sameG, sameW: s.sameW,
            samePct: s.sameG > 0 ? (s.sameW / s.sameG) * 100 : null,
            oppG: s.oppG, oppW: s.oppW,
            oppPct: s.oppG > 0 ? (s.oppW / s.oppG) * 100 : null,
            total: s.sameG + s.oppG,
        }))
        .sort((a, b) => b.total - a.total);
}

/**
 * Compute win rate grouped by storyteller for this player.
 */
function buildStorytellerStats(player) {
    const map = {};
    for (const g of player.gameHistory) {
        const game = gameLog.find(gl => gl.game_id === g.gameNumber);
        if (!game) continue;
        const sts = (game.story_teller || 'Unknown').split('+').map(s => s.trim());
        for (const st of sts) {
            if (!map[st]) map[st] = { games: 0, wins: 0 };
            map[st].games++;
            if (g.win) map[st].wins++;
        }
    }
    return Object.entries(map)
        .map(([st, s]) => ({ storyteller: st, games: s.games, wins: s.wins, winPct: (s.wins / s.games) * 100 }))
        .sort((a, b) => b.games - a.games);
}

/**
 * Compute per-player breakdown stats from gameHistory + gameLog.
 */
function buildPlayerStats(player) {
    const history = player.gameHistory || [];

    // Recent form: last 5 games, newest first
    const recentForm = history.slice(-5).reverse();

    // Current streak
    let streak = 0;
    let streakType = null;
    for (let i = history.length - 1; i >= 0; i--) {
        const w = history[i].win;
        if (streakType === null) { streakType = w ? 'W' : 'L'; streak = 1; }
        else if ((w && streakType === 'W') || (!w && streakType === 'L')) streak++;
        else break;
    }

    // Role breakdown — group by full role string
    const roleMap = {};
    for (const g of history) {
        const key = (g.roles && g.roles.length > 1 ? g.roles.join('+') : g.role) || 'Unknown';
        if (!roleMap[key]) roleMap[key] = { games: 0, wins: 0, team: g.team };
        roleMap[key].games++;
        if (g.win) roleMap[key].wins++;
    }
    const roleBreakdown = Object.entries(roleMap)
        .map(([role, s]) => ({ role, games: s.games, wins: s.wins, team: s.team, winPct: (s.wins / s.games) * 100 }))
        .sort((a, b) => b.games - a.games);

    // Script breakdown — join with gameLog
    const scriptMap = {};
    for (const g of history) {
        const game = gameLog.find(gl => gl.game_id === g.gameNumber);
        const script = game ? (game.game_mode || 'Unknown') : 'Unknown';
        if (!scriptMap[script]) scriptMap[script] = { games: 0, wins: 0 };
        scriptMap[script].games++;
        if (g.win) scriptMap[script].wins++;
    }
    const scriptBreakdown = Object.entries(scriptMap)
        .map(([script, s]) => ({ script, games: s.games, wins: s.wins, winPct: (s.wins / s.games) * 100 }))
        .sort((a, b) => b.games - a.games);

    // Best role among those played 2+ times
    const eligibleRoles = roleBreakdown.filter(r => r.games >= 2);
    const bestRole = eligibleRoles.length
        ? eligibleRoles.reduce((best, r) => r.winPct > best.winPct ? r : best)
        : null;

    return { recentForm, streak, streakType, roleBreakdown, scriptBreakdown, bestRole };
}

/**
 * Show player details modal with stats breakdown and rating chart
 */
function showPlayerModal(player) {
    const modalOverlay = document.getElementById('player-modal-overlay');
    const contentEl    = document.getElementById('player-modal-content');

    const stats = buildPlayerStats(player);
    const synergy = buildSynergyStats(player);
    const stStats = buildStorytellerStats(player);
    const isGlicko2 = currentRatingSystem === 'glicko2';
    const systemLabel = isGlicko2 ? 'Glicko-2' : 'ELO';
    const delta = player.rating - DEFAULT_RATING;
    const deltaStr = (delta >= 0 ? '+' : '') + delta.toFixed(1);

    const synergyRows = synergy.slice(0, 8).map(p => {
        const withStr = p.samePct !== null ? p.samePct.toFixed(0) + '%' : '–';
        const vsStr   = p.oppPct  !== null ? p.oppPct.toFixed(0)  + '%' : '–';
        const withCls = p.samePct !== null ? (p.samePct > 50 ? 'good-text' : p.samePct < 50 ? 'evil-text' : '') : '';
        const vsCls   = p.oppPct  !== null ? (p.oppPct  > 50 ? 'good-text' : p.oppPct  < 50 ? 'evil-text' : '') : '';
        return `<tr>
            <td>${formatPlayerName(p.name)}</td>
            <td class="${withCls}">${withStr}<span class="synergy-games"> (${p.sameG}g)</span></td>
            <td class="${vsCls}">${vsStr}<span class="synergy-games"> (${p.oppG}g)</span></td>
        </tr>`;
    }).join('') || '<tr><td colspan="3" class="empty-row">No shared games yet</td></tr>';

    const stRows = stStats.map(s => {
        const cls = s.winPct > 50 ? 'good-text' : s.winPct < 50 ? 'evil-text' : '';
        return `<tr>
            <td>${s.storyteller.replace(/_/g, ' ')}</td>
            <td>${s.games}</td>
            <td class="${cls}">${s.winPct.toFixed(0)}%</td>
        </tr>`;
    }).join('') || '<tr><td colspan="3" class="empty-row">No data</td></tr>';

    const rdBadge = isGlicko2 && player.rd !== undefined
        ? `<span class="player-modal-system" style="background:rgba(96,165,250,0.15);border-color:rgba(96,165,250,0.3);color:#60a5fa;">±${player.rd.toFixed(0)} RD</span>`
        : '';

    const streakLabel = stats.streakType === 'W' ? 'Win Streak' : stats.streakType === 'L' ? 'Loss Streak' : '';

    const formPills = stats.recentForm.map(g => {
        const roleDisplay = (g.roles && g.roles.length > 1 ? g.roles.join('+') : g.role || '?').replace(/_/g, ' ');
        return `<div class="form-pill ${g.win ? 'win' : 'loss'}" title="Game ${g.gameNumber} — ${roleDisplay} (${g.team})">
            <span class="pill-result">${g.win ? 'W' : 'L'}</span>
            <span class="pill-role">${roleDisplay}</span>
            <span class="pill-team ${g.team.toLowerCase()}">${g.team[0]}</span>
        </div>`;
    }).join('');

    const roleRows = stats.roleBreakdown.map(r => {
        const cls = r.winPct > 50 ? 'good-text' : r.winPct < 50 ? 'evil-text' : '';
        return `<tr>
            <td>${r.role.replace(/_/g, ' ')}</td>
            <td class="${r.team.toLowerCase()}-text">${r.team}</td>
            <td>${r.games}</td>
            <td>${r.wins}</td>
            <td class="${cls}">${r.winPct.toFixed(0)}%</td>
        </tr>`;
    }).join('');

    const scriptRows = stats.scriptBreakdown.map(s => {
        const cls = s.winPct > 50 ? 'good-text' : s.winPct < 50 ? 'evil-text' : '';
        return `<tr>
            <td>${s.script}</td>
            <td>${s.games}</td>
            <td class="${cls}">${s.winPct.toFixed(0)}%</td>
        </tr>`;
    }).join('');

    const bestRoleInsight = stats.bestRole
        ? `<p class="player-modal-insight">Best role: <strong>${stats.bestRole.role.replace(/_/g, ' ')}</strong> — ${stats.bestRole.winPct.toFixed(0)}% in ${stats.bestRole.games} game${stats.bestRole.games > 1 ? 's' : ''}</p>`
        : '';

    contentEl.innerHTML = `
        <div class="player-modal-header">
            <h3>${formatPlayerName(player.name)}</h3>
            <span class="player-modal-system">${systemLabel}</span>
            ${rdBadge}
        </div>

        <div class="player-stat-strip">
            <div class="stat-chip">
                <span class="stat-chip-label">Rating</span>
                <span class="stat-chip-value">${player.rating.toFixed(0)}</span>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-label">vs Start</span>
                <span class="stat-chip-value ${delta >= 0 ? 'positive' : 'negative'}">${deltaStr}</span>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-label">Games</span>
                <span class="stat-chip-value">${player.gamesPlayed}</span>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-label">Win %</span>
                <span class="stat-chip-value">${player.overallWinPct != null ? player.overallWinPct.toFixed(1) + '%' : 'N/A'}</span>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-label">Good Win %</span>
                <span class="stat-chip-value good">${player.goodWinPct != null ? player.goodWinPct.toFixed(1) + '%' : 'N/A'}</span>
            </div>
            <div class="stat-chip">
                <span class="stat-chip-label">Evil Win %</span>
                <span class="stat-chip-value evil">${player.evilWinPct != null ? player.evilWinPct.toFixed(1) + '%' : 'N/A'}</span>
            </div>
        </div>

        <div class="player-modal-row">
            <div class="player-modal-section">
                <h4>Recent Form <span class="section-subtitle">(last ${stats.recentForm.length})</span></h4>
                <div class="recent-form-pills">${formPills}</div>
            </div>
            <div class="player-modal-section">
                <h4>Current Streak</h4>
                <div class="streak-display ${stats.streakType === 'W' ? 'win' : 'loss'}">
                    <span class="streak-num">${stats.streak}</span>
                    <span class="streak-label">${streakLabel}</span>
                </div>
                ${bestRoleInsight}
            </div>
        </div>

        <div class="player-modal-row">
            <div class="player-modal-section">
                <h4>Role Breakdown</h4>
                <table class="breakdown-table">
                    <thead><tr><th>Role</th><th>Team</th><th>G</th><th>W</th><th>Win%</th></tr></thead>
                    <tbody>${roleRows}</tbody>
                </table>
            </div>
            <div class="player-modal-section">
                <h4>By Script</h4>
                <table class="breakdown-table">
                    <thead><tr><th>Script</th><th>G</th><th>Win%</th></tr></thead>
                    <tbody>${scriptRows}</tbody>
                </table>
            </div>
        </div>

        <div class="player-modal-row">
            <div class="player-modal-section">
                <h4>Teammate Synergy</h4>
                <table class="breakdown-table">
                    <thead><tr><th>Player</th><th>With (Win%)</th><th>Vs (Win%)</th></tr></thead>
                    <tbody>${synergyRows}</tbody>
                </table>
            </div>
            <div class="player-modal-section">
                <h4>Storyteller Effect</h4>
                <table class="breakdown-table">
                    <thead><tr><th>Storyteller</th><th>G</th><th>Win%</th></tr></thead>
                    <tbody>${stRows}</tbody>
                </table>
            </div>
        </div>

        <div class="player-modal-section">
            <h4>Rating History</h4>
            <div class="chart-container" style="height: 280px; margin-top: 0; padding: 12px;">
                <canvas id="rating-chart"></canvas>
            </div>
        </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    renderRatingChart(player, document.getElementById('rating-chart'));
}

/**
 * Close player modal
 */
function closePlayerModal() {
    const modal = document.getElementById('player-modal-overlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    const chartCanvas = document.getElementById('rating-chart');
    if (chartCanvas && chartCanvas.chart) {
        chartCanvas.chart.destroy();
        chartCanvas.chart = null;
    }
}

/**
 * Render rating history chart
 */
function renderRatingChart(player, container) {
    // Destroy existing chart if any
    if (container.chart) {
        container.chart.destroy();
    }

    const history = player.ratingHistory;
    const isGlicko2 = currentRatingSystem === 'glicko2';
    const gameNumbers = history.map(h => h.gameNumber);
    const ratings = history.map(h => h.rating);
    const overallPcts = history.map(h => h.overallWinPct);
    const goodPcts = history.map(h => h.goodWinPct);
    const evilPcts = history.map(h => h.evilWinPct);

    // Confidence band datasets (Glicko-2 only)
    const upperBand = isGlicko2 ? history.map(h => h.rating + h.rd) : null;
    const lowerBand = isGlicko2 ? history.map(h => h.rating - h.rd) : null;

    const ctx = container.getContext('2d');

    // Build rating confidence band datasets conditionally
    const confidenceBandDatasets = isGlicko2 ? [
        {
            label: '+RD',
            data: upperBand,
            borderColor: 'transparent',
            backgroundColor: 'rgba(96, 165, 250, 0.12)',
            fill: '+1', // fills down to the lower band dataset (next in array)
            pointRadius: 0,
            yAxisID: 'y',
            tension: 0.1,
        },
        {
            label: '-RD',
            data: lowerBand,
            borderColor: 'rgba(96, 165, 250, 0.25)',
            borderDash: [3, 3],
            backgroundColor: 'transparent',
            fill: false,
            pointRadius: 0,
            yAxisID: 'y',
            tension: 0.1,
        },
    ] : [];

    container.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: gameNumbers,
            datasets: [
                ...confidenceBandDatasets,
                {
                    label: 'Rating',
                    data: ratings,
                    borderColor: '#60a5fa',
                    backgroundColor: isGlicko2 ? 'transparent' : 'rgba(96, 165, 250, 0.1)',
                    yAxisID: 'y',
                    tension: 0.1,
                    pointRadius: 3,
                },
                {
                    label: 'Overall Win %',
                    data: overallPcts,
                    borderColor: '#a78bfa',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 2,
                },
                {
                    label: 'Good Win %',
                    data: goodPcts,
                    borderColor: '#4ade80',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 2,
                },
                {
                    label: 'Evil Win %',
                    data: evilPcts,
                    borderColor: '#f87171',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.1,
                    pointRadius: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#eaeaea',
                        filter: (item) => item.text !== '+RD' && item.text !== '-RD',
                    },
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#eaeaea',
                    bodyColor: '#a0a0a0',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Game Number',
                        color: '#a0a0a0',
                    },
                    ticks: {
                        color: '#a0a0a0',
                    },
                    grid: {
                        color: '#2d3748',
                    },
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Rating',
                        color: '#60a5fa',
                    },
                    ticks: {
                        color: '#60a5fa',
                    },
                    grid: {
                        color: '#2d3748',
                    },
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Win %',
                        color: '#a78bfa',
                    },
                    ticks: {
                        color: '#a78bfa',
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    min: 0,
                    max: 100,
                },
            },
        },
    });
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
