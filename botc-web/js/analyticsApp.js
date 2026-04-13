/**
 * Analytics Application - Main entry point for the analytics dashboard.
 */

import { fetchGames, isDemoMode } from './supabase.js';
import SITE_CONFIG from './site-config.js';
import {
    StorytellerAnalytics,
    extractStorytellers,
    categorizeScript,
    getCharacterRoleType,
    analyzeHeadToHead,
    calculateCharacterElo,
    getCharacterScriptBreakdown
} from './analytics.js';

// ==========================================
// STATE
// ==========================================

let allGames = [];
let currentAnalytics = null;
let characterEloRatings = {};  // Global character ELO ratings
let currentSortColumn = {};
let currentSortAscending = {};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadData();
        setupEventListeners();
        showContent();
    } catch (error) {
        console.error('Failed to initialize analytics:', error);
        showError();
    }
});

/**
 * Load game data from Supabase.
 */
async function loadData() {
    // Apply community name from config
    const h1 = document.querySelector('header h1');
    if (h1 && SITE_CONFIG.communityName) {
        h1.textContent = SITE_CONFIG.communityName + ' Analytics';
    }

    // Show demo banner if in demo mode
    if (isDemoMode()) {
        const banner = document.createElement('div');
        banner.className = 'demo-banner';
        banner.innerHTML = 'Demo Mode — showing sample data. <a href="https://github.com/RossFW/botc-stats#quick-start-5-steps" target="_blank">Set up your own</a>';
        document.querySelector('.container').prepend(banner);
    }

    allGames = await fetchGames();

    // Initialize analytics with all games
    currentAnalytics = new StorytellerAnalytics(allGames, 'All');

    // Calculate character ELO ratings (uses all games for global rating)
    characterEloRatings = calculateCharacterElo(allGames);

    // Populate storyteller dropdown
    populateStorytellerDropdown();

    // Populate player dropdowns
    populatePlayerDropdowns();

    // Populate script filter dropdown
    populateScriptFilterDropdown();
    populateGameSizePlayerFilter();

    // Update all displays
    updateSummary();
    updateScriptsTab();
    updateCharactersTab();
    updateModifiersTab();
    updateGameSizeTab();
}

/**
 * Set up event listeners.
 */
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Storyteller filter
    document.getElementById('storyteller-filter').addEventListener('change', onFilterChange);

    // Modifier filter
    document.getElementById('modifier-filter').addEventListener('change', onFilterChange);

    // Character filters
    document.getElementById('script-filter').addEventListener('change', updateCharactersTab);
    document.getElementById('role-type-filter').addEventListener('change', updateCharactersTab);

    // Player selection
    document.getElementById('player-select').addEventListener('change', updatePlayerTab);

    // Head-to-head analyze button
    document.getElementById('h2h-analyze-btn').addEventListener('click', analyzeH2H);

    // Game size player filter
    const gameSizeFilter = document.getElementById('game-size-player-filter');
    if (gameSizeFilter) gameSizeFilter.addEventListener('change', updateGameSizeTab);

    // Table sorting
    document.querySelectorAll('.analytics-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => handleSort(th));
    });

    // ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeGameDetail();
            closeScriptDetail();
            closeCharacterDetail();
        }
    });

    // Script detail modal close
    const scriptModal = document.getElementById('script-detail-modal');
    if (scriptModal) {
        scriptModal.querySelector('.modal-close').onclick = closeScriptDetail;
        scriptModal.addEventListener('click', (e) => {
            if (e.target === scriptModal) closeScriptDetail();
        });
    }

    // Game detail modal close
    const gameModal = document.getElementById('game-detail-modal');
    if (gameModal) {
        gameModal.querySelector('.modal-close').onclick = closeGameDetail;
        gameModal.addEventListener('click', (e) => {
            if (e.target === gameModal) closeGameDetail();
        });
    }
}

/**
 * Show main content and hide loading.
 */
function showContent() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('content').style.display = 'block';
}

/**
 * Show error state.
 */
function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'block';
}

// ==========================================
// TAB MANAGEMENT
// ==========================================

/**
 * Switch to a different tab.
 * @param {string} tabId - Tab ID to switch to
 */
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}-tab`);
    });
}

// ==========================================
// DROPDOWN POPULATION
// ==========================================

/**
 * Populate the storyteller dropdown.
 */
function populateStorytellerDropdown() {
    const select = document.getElementById('storyteller-filter');
    const storytellers = extractStorytellers(allGames);

    // Keep "All Games" option, add storytellers
    storytellers.forEach(st => {
        const option = document.createElement('option');
        option.value = st;
        option.textContent = st.replace(/_/g, ' ');
        select.appendChild(option);
    });
}

/**
 * Populate player dropdowns (player tab and H2H).
 */
function populatePlayerDropdowns() {
    const playerNames = currentAnalytics.getPlayerNames();

    // Player tab dropdown
    const playerSelect = document.getElementById('player-select');
    playerNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name.replace(/_/g, ' ');
        playerSelect.appendChild(option);
    });

    // H2H dropdowns
    const h2hPlayer1 = document.getElementById('h2h-player1');
    const h2hPlayer2 = document.getElementById('h2h-player2');

    playerNames.forEach(name => {
        const opt1 = document.createElement('option');
        opt1.value = name;
        opt1.textContent = name.replace(/_/g, ' ');
        h2hPlayer1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = name;
        opt2.textContent = name.replace(/_/g, ' ');
        h2hPlayer2.appendChild(opt2);
    });
}

/**
 * Populate the script filter dropdown in characters tab.
 */
function populateScriptFilterDropdown() {
    const select = document.getElementById('script-filter');
    const scripts = Object.keys(currentAnalytics.scriptStats).sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase())
    );

    scripts.forEach(script => {
        const option = document.createElement('option');
        option.value = script;
        option.textContent = script || '(Unknown)';
        select.appendChild(option);
    });
}

// ==========================================
// STORYTELLER CHANGE
// ==========================================

/**
 * Handle storyteller filter change.
 */
function onFilterChange() {
    const storyteller = document.getElementById('storyteller-filter').value;
    const modifierFilter = document.getElementById('modifier-filter').value;
    currentAnalytics = new StorytellerAnalytics(allGames, storyteller, modifierFilter);

    // Update all displays
    updateSummary();
    updateScriptsTab();
    updateCharactersTab();
    updateModifiersTab();
    updateGameSizeTab();
    populateGameSizePlayerFilter();

    // Reset player tab
    document.getElementById('player-select').value = '';
    document.getElementById('player-stats-container').style.display = 'none';

    // Repopulate player dropdowns for filtered analytics
    repopulatePlayerDropdowns();
}

/**
 * Repopulate player dropdowns after storyteller change.
 */
function repopulatePlayerDropdowns() {
    const playerNames = currentAnalytics.getPlayerNames();

    // Clear and repopulate player select
    const playerSelect = document.getElementById('player-select');
    playerSelect.innerHTML = '<option value="">-- Choose a player --</option>';
    playerNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name.replace(/_/g, ' ');
        playerSelect.appendChild(option);
    });

    // Clear and repopulate H2H dropdowns
    const h2hPlayer1 = document.getElementById('h2h-player1');
    const h2hPlayer2 = document.getElementById('h2h-player2');

    h2hPlayer1.innerHTML = '<option value="">-- Select player --</option>';
    h2hPlayer2.innerHTML = '<option value="">-- Select player --</option>';

    playerNames.forEach(name => {
        const opt1 = document.createElement('option');
        opt1.value = name;
        opt1.textContent = name.replace(/_/g, ' ');
        h2hPlayer1.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = name;
        opt2.textContent = name.replace(/_/g, ' ');
        h2hPlayer2.appendChild(opt2);
    });
}

// ==========================================
// SUMMARY UPDATE
// ==========================================

/**
 * Update the summary statistics display.
 */
function updateSummary() {
    const summary = currentAnalytics.getSummary();

    document.getElementById('summary-games').textContent = `${summary.totalGames} games`;
    document.getElementById('summary-good').textContent = `Good: ${summary.goodPct}%`;
    document.getElementById('summary-evil').textContent = `Evil: ${summary.evilPct}%`;
}

// ==========================================
// SCRIPTS TAB
// ==========================================

/**
 * Update the scripts tab table.
 */
function updateScriptsTab() {
    const tbody = document.getElementById('scripts-body');
    tbody.innerHTML = '';

    const sortCol = currentSortColumn['scripts'] || 'good_pct';
    const sortAsc = currentSortAscending['scripts'] || false;

    const entries = currentAnalytics.getScriptStatsArray(sortCol, sortAsc);

    // Add script rows
    for (const [script, stats] of entries) {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        const modLabel = stats.mod_games > 0 ? stats.mod_games : '-';
        row.innerHTML = `
            <td>${script || '(Unknown)'}</td>
            <td><span class="category-badge ${stats.category.toLowerCase()}">${stats.category}</span></td>
            <td class="good-text">${stats.good_pct.toFixed(1)}%</td>
            <td class="evil-text">${stats.evil_pct.toFixed(1)}%</td>
            <td>${stats.good_wins}</td>
            <td>${stats.evil_wins}</td>
            <td>${stats.games}</td>
            <td class="mod-count">${modLabel}</td>
        `;
        row.addEventListener('click', () => showScriptDetail(script));
        tbody.appendChild(row);
    }

    // Add separator
    const sepRow = document.createElement('tr');
    sepRow.className = 'separator-row';
    sepRow.innerHTML = '<td colspan="8"></td>';
    tbody.appendChild(sepRow);

    // Add category totals
    for (const [cat, totals] of Object.entries(currentAnalytics.categoryTotals)) {
        if (totals.games === 0) continue;

        const goodPct = (totals.good_wins / totals.games * 100).toFixed(1);
        const evilPct = (totals.evil_wins / totals.games * 100).toFixed(1);

        const row = document.createElement('tr');
        row.className = 'total-row';
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <td><strong>${cat} Total</strong></td>
            <td><span class="category-badge ${cat.toLowerCase()}">${cat}</span></td>
            <td class="good-text"><strong>${goodPct}%</strong></td>
            <td class="evil-text"><strong>${evilPct}%</strong></td>
            <td><strong>${totals.good_wins}</strong></td>
            <td><strong>${totals.evil_wins}</strong></td>
            <td><strong>${totals.games}</strong></td>
            <td></td>
        `;
        row.addEventListener('click', () => {
            const games = currentAnalytics.games.filter(g => {
                const scriptStats = currentAnalytics.scriptStats[g.game_mode];
                return scriptStats && scriptStats.category === cat;
            });
            showGameHistory(`${cat} Total`, `${games.length} games`, games);
        });
        tbody.appendChild(row);
    }
}

// ==========================================
// CHARACTERS TAB
// ==========================================

/**
 * Update the characters tab table.
 */
function updateCharactersTab() {
    const tbody = document.getElementById('characters-body');
    tbody.innerHTML = '';

    const scriptFilter = document.getElementById('script-filter').value;
    const roleTypeFilter = document.getElementById('role-type-filter').value;

    const characters = currentAnalytics.getCharacterStats(scriptFilter, roleTypeFilter);

    // Add ELO ratings to each character
    const charactersWithElo = characters.map(char => {
        const eloData = characterEloRatings[char.character];
        return {
            ...char,
            elo: eloData ? Math.round(eloData.rating) : 1500
        };
    });

    // Sort by ELO by default if current sort is elo
    const sortCol = currentSortColumn['characters-table'];
    if (sortCol === 'elo') {
        const ascending = currentSortAscending['characters-table'];
        charactersWithElo.sort((a, b) => ascending ? a.elo - b.elo : b.elo - a.elo);
    }

    for (const char of charactersWithElo) {
        const row = document.createElement('tr');
        row.dataset.character = char.character;
        row.dataset.roleType = char.role_type;
        row.dataset.elo = char.elo;

        // Color-code ELO: green if above 1500, red if below
        const eloClass = char.elo >= 1500 ? 'elo-positive' : 'elo-negative';

        row.innerHTML = `
            <td>${char.character}</td>
            <td><span class="role-type-badge ${char.role_type.toLowerCase()}">${char.role_type}</span></td>
            <td class="${eloClass}">${char.elo}</td>
            <td>${char.win_pct.toFixed(1)}%</td>
            <td>${char.wins}</td>
            <td>${char.games}</td>
        `;

        // Add click handler to show character detail
        row.addEventListener('click', () => {
            showCharacterDetail(char.character, char.role_type, char.elo);
        });

        tbody.appendChild(row);
    }
}

// ==========================================
// PLAYERS TAB
// ==========================================

/**
 * Update the player tab with selected player's stats.
 */
function updatePlayerTab() {
    const playerName = document.getElementById('player-select').value;
    const container = document.getElementById('player-stats-container');

    if (!playerName) {
        container.style.display = 'none';
        return;
    }

    const stats = currentAnalytics.getPlayerStats(playerName);
    if (!stats) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    // Update summary cards
    const winPct = stats.games > 0 ? (stats.wins / stats.games * 100).toFixed(1) : '0.0';
    const goodPct = stats.good_games > 0 ? (stats.good_wins / stats.good_games * 100).toFixed(1) : '0.0';
    const evilPct = stats.evil_games > 0 ? (stats.evil_wins / stats.evil_games * 100).toFixed(1) : '0.0';

    document.getElementById('player-win-pct').textContent = `${winPct}%`;
    document.getElementById('player-good-pct').textContent = `${goodPct}%`;
    document.getElementById('player-good-games').textContent = `${stats.good_games} games`;
    document.getElementById('player-evil-pct').textContent = `${evilPct}%`;
    document.getElementById('player-evil-games').textContent = `${stats.evil_games} games`;
    document.getElementById('player-total-games').textContent = stats.games;

    // Update per-script breakdown
    updatePlayerScriptsTable(stats);

    // Update role history
    updatePlayerRolesTable(stats);
}

/**
 * Update the per-script table for a player.
 * @param {Object} stats - Player stats object
 */
function updatePlayerScriptsTable(stats) {
    const tbody = document.getElementById('player-scripts-body');
    tbody.innerHTML = '';

    // Add "All" row first
    const allWinPct = stats.games > 0 ? (stats.wins / stats.games * 100).toFixed(1) : '0.0';
    const allGoodPct = stats.good_games > 0 ? (stats.good_wins / stats.good_games * 100).toFixed(1) : '0.0';
    const allEvilPct = stats.evil_games > 0 ? (stats.evil_wins / stats.evil_games * 100).toFixed(1) : '0.0';

    const playerName = document.getElementById('player-select').value;

    const allRow = document.createElement('tr');
    allRow.className = 'total-row';
    allRow.style.cursor = 'pointer';
    allRow.innerHTML = `
        <td><strong>All</strong></td>
        <td><strong>${allWinPct}%</strong></td>
        <td><strong>${stats.games}</strong></td>
        <td class="good-text"><strong>${allGoodPct}%</strong></td>
        <td><strong>${stats.good_games}</strong></td>
        <td class="evil-text"><strong>${allEvilPct}%</strong></td>
        <td><strong>${stats.evil_games}</strong></td>
    `;
    allRow.addEventListener('click', () => {
        const games = currentAnalytics.games.filter(g =>
            g.players.some(p => p.name === playerName));
        showGameHistory(`${playerName.replace(/_/g, ' ')} — All Games`, `${games.length} games`, games);
    });
    tbody.appendChild(allRow);

    // Sort scripts by win percentage
    const scriptEntries = Object.entries(stats.scripts).sort((a, b) => {
        const aPct = a[1].games > 0 ? a[1].wins / a[1].games : 0;
        const bPct = b[1].games > 0 ? b[1].wins / b[1].games : 0;
        return bPct - aPct;
    });

    for (const [script, s] of scriptEntries) {
        const winPct = s.games > 0 ? (s.wins / s.games * 100).toFixed(1) : '0.0';
        const goodPct = s.good_games > 0 ? (s.good_wins / s.good_games * 100).toFixed(1) : '0.0';
        const evilPct = s.evil_games > 0 ? (s.evil_wins / s.evil_games * 100).toFixed(1) : '0.0';

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <td>${script || '(Unknown)'}</td>
            <td>${winPct}%</td>
            <td>${s.games}</td>
            <td class="good-text">${goodPct}%</td>
            <td>${s.good_games}</td>
            <td class="evil-text">${evilPct}%</td>
            <td>${s.evil_games}</td>
        `;
        row.addEventListener('click', () => {
            const games = currentAnalytics.games.filter(g =>
                g.game_mode === script && g.players.some(p => p.name === playerName));
            showGameHistory(`${playerName.replace(/_/g, ' ')} — ${script}`, `${games.length} games`, games);
        });
        tbody.appendChild(row);
    }
}

/**
 * Update the role history table for a player.
 * @param {Object} stats - Player stats object
 */
function updatePlayerRolesTable(stats) {
    const tbody = document.getElementById('player-roles-body');
    tbody.innerHTML = '';

    // Sort roles by games played
    const roleEntries = Object.entries(stats.roles).sort((a, b) => b[1].games - a[1].games);

    const playerName = document.getElementById('player-select').value;

    for (const [role, r] of roleEntries) {
        const winPct = r.games > 0 ? (r.wins / r.games * 100).toFixed(1) : '0.0';
        const roleType = getCharacterRoleType(role);

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <td>${role}</td>
            <td><span class="role-type-badge ${roleType.toLowerCase()}">${roleType}</span></td>
            <td>${winPct}%</td>
            <td>${r.wins}</td>
            <td>${r.games}</td>
        `;
        row.addEventListener('click', () => {
            const games = currentAnalytics.games.filter(g =>
                g.players.some(p => p.name === playerName &&
                    (p.role === role || (p.roles && p.roles.includes(role)))));
            showGameHistory(`${playerName.replace(/_/g, ' ')} as ${role.replace(/_/g, ' ')}`, roleType, games);
        });
        tbody.appendChild(row);
    }
}

// ==========================================
// HEAD-TO-HEAD TAB
// ==========================================

/**
 * Analyze head-to-head matchup between two players.
 */
function analyzeH2H() {
    const player1 = document.getElementById('h2h-player1').value;
    const player2 = document.getElementById('h2h-player2').value;

    const resultsDiv = document.getElementById('h2h-results');
    const noResultsDiv = document.getElementById('h2h-no-results');

    if (!player1 || !player2) {
        alert('Please select both players.');
        return;
    }

    if (player1 === player2) {
        alert('Please select two different players.');
        return;
    }

    // Use filtered games from current analytics
    const results = analyzeHeadToHead(currentAnalytics.games, player1, player2);

    // Update display
    document.getElementById('h2h-player1-name').textContent = player1.replace(/_/g, ' ');
    document.getElementById('h2h-player2-name').textContent = player2.replace(/_/g, ' ');
    document.getElementById('h2h-total-games').textContent = results.total_together;

    // Same team stats
    document.getElementById('same-team-games').textContent = results.same_team.games;
    document.getElementById('same-team-wins').textContent = results.same_team.wins;
    document.getElementById('same-team-pct').textContent = results.same_team.win_pct;

    document.getElementById('both-good-games').textContent = results.same_team.both_good.games;
    document.getElementById('both-good-wins').textContent = results.same_team.both_good.wins;
    document.getElementById('both-good-pct').textContent = results.same_team.both_good.win_pct;

    document.getElementById('both-evil-games').textContent = results.same_team.both_evil.games;
    document.getElementById('both-evil-wins').textContent = results.same_team.both_evil.wins;
    document.getElementById('both-evil-pct').textContent = results.same_team.both_evil.win_pct;

    // Opposite teams stats
    document.getElementById('opp-total-games').textContent = results.opposite_teams.games;

    document.getElementById('opp-p1-name').textContent = player1.replace(/_/g, ' ');
    document.getElementById('p1-opp-wins').textContent = results.opposite_teams[player1].wins;
    document.getElementById('p1-opp-pct').textContent = results.opposite_teams[player1].win_pct;
    document.getElementById('p1-good-games').textContent = results.opposite_teams[player1].when_good.games;
    document.getElementById('p1-good-wins').textContent = results.opposite_teams[player1].when_good.wins;
    document.getElementById('p1-good-pct').textContent = results.opposite_teams[player1].when_good.win_pct;
    document.getElementById('p1-evil-games').textContent = results.opposite_teams[player1].when_evil.games;
    document.getElementById('p1-evil-wins').textContent = results.opposite_teams[player1].when_evil.wins;
    document.getElementById('p1-evil-pct').textContent = results.opposite_teams[player1].when_evil.win_pct;

    document.getElementById('opp-p2-name').textContent = player2.replace(/_/g, ' ');
    document.getElementById('p2-opp-wins').textContent = results.opposite_teams[player2].wins;
    document.getElementById('p2-opp-pct').textContent = results.opposite_teams[player2].win_pct;
    document.getElementById('p2-good-games').textContent = results.opposite_teams[player2].when_good.games;
    document.getElementById('p2-good-wins').textContent = results.opposite_teams[player2].when_good.wins;
    document.getElementById('p2-good-pct').textContent = results.opposite_teams[player2].when_good.win_pct;
    document.getElementById('p2-evil-games').textContent = results.opposite_teams[player2].when_evil.games;
    document.getElementById('p2-evil-wins').textContent = results.opposite_teams[player2].when_evil.wins;
    document.getElementById('p2-evil-pct').textContent = results.opposite_teams[player2].when_evil.win_pct;

    // Game IDs

    // Make H2H stat cards clickable
    const bothIn = g => g.players && g.players.some(p => p.name === player1) && g.players.some(p => p.name === player2);
    const getTeam = (g, name) => { const p = g.players.find(p => p.name === name); return p ? p.team : null; };
    const p1Name = player1.replace(/_/g, ' ');
    const p2Name = player2.replace(/_/g, ' ');

    function makeClickable(el, label, filterFn) {
        if (!el) return;
        el.style.cursor = 'pointer';
        el.onclick = () => {
            const games = currentAnalytics.games.filter(g => bothIn(g) && filterFn(g));
            showGameHistory(label, `${games.length} games`, games);
        };
    }

    // Same team cards
    makeClickable(
        document.querySelector('#h2h-same-team-content .h2h-stats-row .h2h-stat-card:first-child'),
        `${p1Name} & ${p2Name} — Same Team`,
        g => getTeam(g, player1) === getTeam(g, player2)
    );
    makeClickable(
        document.querySelector('#h2h-same-team-content .h2h-stat-card.good'),
        `${p1Name} & ${p2Name} — Both Good`,
        g => getTeam(g, player1) === 'Good' && getTeam(g, player2) === 'Good'
    );
    makeClickable(
        document.querySelector('#h2h-same-team-content .h2h-stat-card.evil'),
        `${p1Name} & ${p2Name} — Both Evil`,
        g => getTeam(g, player1) === 'Evil' && getTeam(g, player2) === 'Evil'
    );

    // Opposite teams — all cards
    const oppPlayers = document.querySelectorAll('.h2h-opp-player');
    const oppFilter = g => getTeam(g, player1) !== getTeam(g, player2);

    // P1 and P2 overall cards
    if (oppPlayers[0]) {
        makeClickable(oppPlayers[0].querySelector('.h2h-stat-card:not(.good):not(.evil)'),
            `${p1Name} vs ${p2Name} — Opposite Teams`, oppFilter);
    }
    if (oppPlayers[1]) {
        makeClickable(oppPlayers[1].querySelector('.h2h-stat-card:not(.good):not(.evil)'),
            `${p1Name} vs ${p2Name} — Opposite Teams`, oppFilter);
    }

    // P1 As Good / P2 As Evil (same row = same games: P1 is Good, P2 is Evil)
    const p1GoodFilter = g => getTeam(g, player1) === 'Good' && getTeam(g, player2) === 'Evil';
    const p1EvilFilter = g => getTeam(g, player1) === 'Evil' && getTeam(g, player2) === 'Good';

    if (oppPlayers[0]) {
        makeClickable(oppPlayers[0].querySelector('.h2h-stat-card.good'),
            `${p1Name} (Good) vs ${p2Name} (Evil)`, p1GoodFilter);
        makeClickable(oppPlayers[0].querySelector('.h2h-stat-card.evil'),
            `${p1Name} (Evil) vs ${p2Name} (Good)`, p1EvilFilter);
    }
    if (oppPlayers[1]) {
        // P2's cards are inverted: Evil first (aligns with P1 Good), Good second (aligns with P1 Evil)
        makeClickable(oppPlayers[1].querySelector('.h2h-stat-card.evil'),
            `${p1Name} (Good) vs ${p2Name} (Evil)`, p1GoodFilter);
        makeClickable(oppPlayers[1].querySelector('.h2h-stat-card.good'),
            `${p1Name} (Evil) vs ${p2Name} (Good)`, p1EvilFilter);
    }

    // Show results
    resultsDiv.style.display = 'block';
    noResultsDiv.style.display = 'none';
}

// ==========================================
// SCRIPT DETAIL MODAL
// ==========================================

/**
 * Show a game history modal for any filtered set of games.
 * Reusable across Scripts, Players, Characters, and Modifiers.
 * @param {string} title - Modal title (e.g., "Trouble Brewing", "Sarah — Imp")
 * @param {string} badge - Badge text (e.g., "Normal", "Townsfolk", "13 games")
 * @param {Array} games - Filtered game objects to display
 */
function showGameHistory(title, badge, games) {
    const modal = document.getElementById('script-detail-modal');
    if (!modal) return;

    document.getElementById('script-detail-name').textContent = title;
    document.getElementById('script-detail-category').textContent = badge;

    const gamesBody = document.getElementById('script-detail-games-body');
    gamesBody.innerHTML = '';

    if (games.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align:center; opacity:0.5;">No games found</td>';
        gamesBody.appendChild(row);
    } else {
        for (const g of games.sort((a, b) => b.game_id - a.game_id)) {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            const modTags = [];
            if (g.modifiers) {
                for (const f of (g.modifiers.fabled || [])) modTags.push(f.replace(/_/g, ' '));
                for (const l of (g.modifiers.lorics || [])) modTags.push(l.replace(/_/g, ' '));
            }
            row.innerHTML = `
                <td>#${g.game_id}</td>
                <td>${g.date ? new Date(g.date).toLocaleDateString() : '-'}</td>
                <td class="${g.winning_team === 'Good' ? 'good-text' : 'evil-text'}">${g.winning_team}</td>
                <td>${(g.story_teller || '-').replace(/_/g, ' ').replace(/\+/g, ', ')}</td>
                <td>${modTags.length > 0 ? modTags.join(', ') : '-'}</td>
            `;
            row.addEventListener('click', () => showGameDetail(g));
            gamesBody.appendChild(row);
        }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Show script game history (convenience wrapper).
 */
function showScriptDetail(scriptName) {
    const stats = currentAnalytics.scriptStats[scriptName];
    const games = currentAnalytics.games.filter(g => g.game_mode === scriptName);
    showGameHistory(scriptName, stats ? stats.category : 'Unknown', games);
}

/**
 * Show the game detail modal with full player/role breakdown.
 */
function showGameDetail(game) {
    const modal = document.getElementById('game-detail-modal');
    if (!modal || !game) return;

    document.getElementById('game-detail-title').textContent = `Game #${game.game_id}`;
    document.getElementById('game-detail-script').textContent = game.game_mode || 'Unknown';
    document.getElementById('game-detail-date').textContent = game.date ? new Date(game.date).toLocaleDateString() : '-';
    document.getElementById('game-detail-st').textContent = (game.story_teller || '-').replace(/_/g, ' ').replace(/\+/g, ', ');

    const winnerEl = document.getElementById('game-detail-winner');
    winnerEl.textContent = game.winning_team;
    winnerEl.className = 'stat-value ' + (game.winning_team === 'Good' ? 'good-text' : 'evil-text');

    // Modifiers
    const modSection = document.getElementById('game-detail-modifiers');
    const modList = document.getElementById('game-detail-mod-list');
    const fabled = game.modifiers ? (game.modifiers.fabled || []) : [];
    const lorics = game.modifiers ? (game.modifiers.lorics || []) : [];

    if (fabled.length === 0 && lorics.length === 0) {
        modSection.style.display = 'none';
    } else {
        modSection.style.display = 'block';
        const tags = [];
        for (const f of fabled) tags.push(`<span class="char-player-chip"><small class="mod-type-label">Fabled:</small> ${f.replace(/_/g, ' ')}</span>`);
        for (const l of lorics) tags.push(`<span class="char-player-chip"><small class="mod-type-label">Loric:</small> ${l.replace(/_/g, ' ')}</span>`);
        modList.innerHTML = tags.join('');
    }

    // Render players into a tbody
    function renderPlayers(tbody, players) {
        tbody.innerHTML = '';
        for (const p of players) {
            const row = document.createElement('tr');
            const roles = (p.roles && p.roles.length > 0) ? p.roles.join(' → ') : (p.role || '-');
            let nameHtml = (p.name || '-').replace(/_/g, ' ');

            // Flag team change
            if (p.initial_team && p.initial_team !== p.team) {
                nameHtml += ` <span class="team-change-badge">${p.initial_team} → ${p.team}</span>`;
            }

            // Show role progression if multiple roles
            let rolesHtml = roles.replace(/_/g, ' ');
            if (p.roles && p.roles.length > 1) {
                rolesHtml = p.roles.map(r => r.replace(/_/g, ' ')).join(' <span class="role-arrow">→</span> ');
            }

            row.innerHTML = `<td>${nameHtml}</td><td>${rolesHtml}</td>`;
            tbody.appendChild(row);
        }
    }

    renderPlayers(document.getElementById('game-detail-good-body'), (game.players || []).filter(p => p.team === 'Good'));
    renderPlayers(document.getElementById('game-detail-evil-body'), (game.players || []).filter(p => p.team === 'Evil'));

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Close the game detail modal.
 */
function closeGameDetail() {
    const modal = document.getElementById('game-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Close the script detail modal.
 */
function closeScriptDetail() {
    const modal = document.getElementById('script-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ==========================================
// MODIFIERS TAB
// ==========================================

/**
 * Update the modifiers tab.
 */
function updateModifiersTab() {
    const storyteller = document.getElementById('storyteller-filter').value;
    const summary = currentAnalytics.getModifierSummary(allGames, storyteller);
    const noData = document.getElementById('modifiers-no-data');
    const content = document.getElementById('modifiers-content');

    if (summary.totalMod === 0) {
        noData.style.display = 'block';
        content.style.display = 'none';
        return;
    }

    noData.style.display = 'none';
    content.style.display = 'block';

    // Summary cards
    document.getElementById('mod-total-games').textContent = summary.totalMod;
    document.getElementById('mod-fabled-games').textContent = summary.fabledCount;
    document.getElementById('mod-lorics-games').textContent = summary.loricsCount;

    // Fabled table
    renderModifierTable('fabled-body', currentAnalytics.modifierStats.fabled, 'fabled');

    // Lorics table
    renderModifierTable('lorics-body', currentAnalytics.modifierStats.lorics, 'lorics');
}

/**
 * Render a modifier stats table.
 */
function renderModifierTable(tbodyId, stats, modType) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = '';

    const entries = Object.entries(stats).sort((a, b) => b[1].games - a[1].games);

    if (entries.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align:center; opacity:0.5;">No data yet</td>';
        tbody.appendChild(row);
        return;
    }

    for (const [name, data] of entries) {
        const goodPct = data.games > 0 ? (data.good_wins / data.games * 100).toFixed(1) : '0.0';
        const evilPct = data.games > 0 ? (data.evil_wins / data.games * 100).toFixed(1) : '0.0';

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.innerHTML = `
            <td>${name.replace(/_/g, ' ')}</td>
            <td class="good-text">${goodPct}%</td>
            <td class="evil-text">${evilPct}%</td>
            <td>${data.good_wins}</td>
            <td>${data.evil_wins}</td>
            <td>${data.games}</td>
        `;
        row.addEventListener('click', () => {
            const games = currentAnalytics.games.filter(g => {
                if (!g.modifiers) return false;
                const list = modType === 'fabled' ? (g.modifiers.fabled || []) : (g.modifiers.lorics || []);
                return list.includes(name);
            });
            const typeLabel = modType === 'fabled' ? 'Fabled' : 'Loric';
            showGameHistory(name.replace(/_/g, ' '), typeLabel, games);
        });
        tbody.appendChild(row);
    }
}

// ==========================================
// GAME SIZE TAB
// ==========================================

// Expected Good win % from DP toy model (random executions, no abilities)
// Source: https://github.com/RossFW/BotC_Probability
const EXPECTED_GOOD_WIN_PCT = {
    7: 54, 8: 51, 9: 59, 10: 49, 11: 59, 12: 54, 13: 59, 14: 53, 15: 62
};

// Evil team composition by player count (standard BotC rules)
const EVIL_TEAM_BY_SIZE = {
    5: '1 Demon, 1 Minion', 6: '1 Demon, 1 Minion', 7: '1 Demon, 1 Minion', 8: '1 Demon, 1 Minion',
    9: '1 Demon, 2 Minions', 10: '1 Demon, 2 Minions', 11: '1 Demon, 2 Minions', 12: '1 Demon, 2 Minions',
    13: '1 Demon, 3 Minions', 14: '1 Demon, 3 Minions', 15: '1 Demon, 3 Minions'
};

/**
 * Update the game size tab.
 */
function updateGameSizeTab() {
    const playerFilter = document.getElementById('game-size-player-filter').value;
    const tbody = document.getElementById('game-size-body');
    tbody.innerHTML = '';

    // Count games by player count
    const bySize = {};
    for (const g of currentAnalytics.games) {
        if (!g.players) continue;

        // Apply player filter
        if (playerFilter !== 'All' && !g.players.some(p => p.name === playerFilter)) continue;

        const size = g.players.length;
        if (!bySize[size]) bySize[size] = { games: 0, good_wins: 0, evil_wins: 0 };
        bySize[size].games++;
        if (g.winning_team === 'Good') bySize[size].good_wins++;
        else bySize[size].evil_wins++;
    }

    // Sort by player count
    const sizes = Object.keys(bySize).map(Number).sort((a, b) => a - b);

    if (sizes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="7" style="text-align:center; opacity:0.5;">No games found</td>';
        tbody.appendChild(row);
        return;
    }

    for (const size of sizes) {
        const data = bySize[size];
        const goodPct = data.games > 0 ? (data.good_wins / data.games * 100).toFixed(1) : '0.0';
        const evilPct = data.games > 0 ? (data.evil_wins / data.games * 100).toFixed(1) : '0.0';
        const expectedGood = EXPECTED_GOOD_WIN_PCT[size];
        const expectedEvil = expectedGood ? (100 - expectedGood) : null;
        const evilTeam = EVIL_TEAM_BY_SIZE[size] || (size >= 15 ? '1 Demon, 3 Minions' : '?');

        const row = document.createElement('tr');
        row.style.cursor = 'pointer';

        // Highlight deviation from expected
        let goodClass = 'good-text';
        let evilClass = 'evil-text';

        row.innerHTML = `
            <td><strong>${size}</strong></td>
            <td>${evilTeam}</td>
            <td>${data.games}</td>
            <td class="${goodClass}">${goodPct}%</td>
            <td class="${evilClass}">${evilPct}%</td>
            <td style="opacity:0.6">${expectedGood != null ? expectedGood + '%' : '-'}</td>
            <td style="opacity:0.6">${expectedEvil != null ? expectedEvil + '%' : '-'}</td>
        `;

        row.addEventListener('click', () => {
            const games = currentAnalytics.games.filter(g => {
                if (!g.players || g.players.length !== size) return false;
                if (playerFilter !== 'All' && !g.players.some(p => p.name === playerFilter)) return false;
                return true;
            });
            const label = playerFilter !== 'All'
                ? `${playerFilter.replace(/_/g, ' ')} — ${size}-player games`
                : `${size}-player games`;
            showGameHistory(label, `${games.length} games`, games);
        });

        tbody.appendChild(row);
    }
}

/**
 * Populate the game size player filter dropdown.
 */
function populateGameSizePlayerFilter() {
    const select = document.getElementById('game-size-player-filter');
    if (!select) return;

    const playerNames = currentAnalytics.getPlayerNames();
    // Keep "All Players" option, clear the rest
    select.innerHTML = '<option value="All">All Players</option>';
    playerNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name.replace(/_/g, ' ');
        select.appendChild(option);
    });
}

// ==========================================
// TABLE SORTING
// ==========================================

/**
 * Handle table header click for sorting.
 * @param {HTMLElement} th - Table header element
 */
function handleSort(th) {
    const table = th.closest('table');
    const tableId = table.id;
    const sortKey = th.dataset.sort;

    // Toggle sort direction
    if (currentSortColumn[tableId] === sortKey) {
        currentSortAscending[tableId] = !currentSortAscending[tableId];
    } else {
        currentSortColumn[tableId] = sortKey;
        currentSortAscending[tableId] = false; // Default to descending
    }

    // Update visual indicators
    table.querySelectorAll('th').forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
    });
    th.classList.add(currentSortAscending[tableId] ? 'sorted-asc' : 'sorted-desc');

    // Re-render appropriate tab
    if (tableId === 'scripts-table') {
        updateScriptsTab();
    } else if (tableId === 'characters-table') {
        sortCharactersTable(sortKey, currentSortAscending[tableId]);
    } else if (tableId === 'player-scripts-table' || tableId === 'player-roles-table') {
        sortGenericTable(table, sortKey, currentSortAscending[tableId]);
    }
}

/**
 * Sort the characters table.
 * @param {string} sortKey - Column to sort by
 * @param {boolean} ascending - Sort direction
 */
function sortCharactersTable(sortKey, ascending) {
    const tbody = document.getElementById('characters-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    const colIndex = {
        'character': 0,
        'role_type': 1,
        'elo': 2,
        'win_pct': 3,
        'wins': 4,
        'games': 5
    }[sortKey];

    rows.sort((a, b) => {
        let aVal = a.cells[colIndex].textContent.trim();
        let bVal = b.cells[colIndex].textContent.trim();

        // Handle percentage values
        if (aVal.endsWith('%')) aVal = parseFloat(aVal);
        if (bVal.endsWith('%')) bVal = parseFloat(bVal);

        // Handle numeric values
        if (!isNaN(aVal) && !isNaN(bVal)) {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }

        if (ascending) {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });

    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

/**
 * Sort a generic table.
 * @param {HTMLElement} table - Table element
 * @param {string} sortKey - Column to sort by
 * @param {boolean} ascending - Sort direction
 */
function sortGenericTable(table, sortKey, ascending) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr:not(.total-row)'));
    const totalRows = Array.from(tbody.querySelectorAll('tr.total-row'));

    const headers = Array.from(table.querySelectorAll('th[data-sort]'));
    const colIndex = headers.findIndex(h => h.dataset.sort === sortKey);

    if (colIndex === -1) return;

    rows.sort((a, b) => {
        let aVal = a.cells[colIndex].textContent.trim();
        let bVal = b.cells[colIndex].textContent.trim();

        // Handle percentage values
        if (aVal.endsWith('%')) aVal = parseFloat(aVal);
        if (bVal.endsWith('%')) bVal = parseFloat(bVal);

        // Handle numeric values
        if (!isNaN(aVal) && !isNaN(bVal)) {
            aVal = parseFloat(aVal);
            bVal = parseFloat(bVal);
        }

        if (ascending) {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });

    // Clear and re-append: total rows first, then sorted rows
    tbody.innerHTML = '';
    totalRows.forEach(row => tbody.appendChild(row));
    rows.forEach(row => tbody.appendChild(row));
}

// ==========================================
// CHARACTER DETAIL MODAL
// ==========================================

/**
 * Show the character detail modal with breakdown data.
 * @param {string} characterName - Name of the character
 * @param {string} roleType - Role type (Townsfolk, Minion, etc.)
 * @param {number} elo - Current ELO rating
 */
function showCharacterDetail(characterName, roleType, elo) {
    const modal = document.getElementById('character-detail-modal');
    if (!modal) return;

    // Get detailed breakdown from current filtered games
    const breakdown = getCharacterScriptBreakdown(currentAnalytics.games, characterName);

    // Populate header
    document.getElementById('char-detail-name').textContent = characterName.replace(/_/g, ' ');

    const typeEl = document.getElementById('char-detail-type');
    typeEl.textContent = roleType;
    typeEl.className = `role-type-badge ${roleType.toLowerCase()}`;

    // Populate summary stats
    document.getElementById('char-detail-elo').textContent = elo;
    document.getElementById('char-detail-winpct').textContent = `${breakdown.winPct}%`;
    document.getElementById('char-detail-record').textContent = `${breakdown.totalWins}-${breakdown.totalLosses}`;
    document.getElementById('char-detail-games').textContent = breakdown.totalGames;

    // Populate wins by script
    const winsList = document.getElementById('char-detail-wins-list');
    winsList.innerHTML = '';
    if (breakdown.winsByScript.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-data';
        li.textContent = 'No wins yet';
        winsList.appendChild(li);
    } else {
        for (const [script, count] of breakdown.winsByScript) {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.className = 'script-name';
            nameSpan.textContent = script;
            const countSpan = document.createElement('span');
            countSpan.className = 'script-count';
            countSpan.textContent = count;
            li.appendChild(nameSpan);
            li.appendChild(countSpan);
            winsList.appendChild(li);
        }
    }

    // Populate losses by script
    const lossesList = document.getElementById('char-detail-losses-list');
    lossesList.innerHTML = '';
    if (breakdown.lossesByScript.length === 0) {
        const li = document.createElement('li');
        li.className = 'no-data';
        li.textContent = 'No losses yet';
        lossesList.appendChild(li);
    } else {
        for (const [script, count] of breakdown.lossesByScript) {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.className = 'script-name';
            nameSpan.textContent = script;
            const countSpan = document.createElement('span');
            countSpan.className = 'script-count';
            countSpan.textContent = count;
            li.appendChild(nameSpan);
            li.appendChild(countSpan);
            lossesList.appendChild(li);
        }
    }

    // Populate players who played this character
    const playersDiv = document.getElementById('char-detail-players');
    playersDiv.innerHTML = '';
    if (breakdown.players.length === 0) {
        playersDiv.textContent = 'No players found';
    } else {
        for (const [player, count] of breakdown.players) {
            const tag = document.createElement('span');
            tag.className = 'char-player-tag';
            tag.innerHTML = `${player.replace(/_/g, ' ')}<span class="play-count">(${count})</span>`;
            playersDiv.appendChild(tag);
        }
    }

    // Wire up game history button — close character modal first
    const gamesBtn = document.getElementById('char-detail-games-btn');
    if (gamesBtn) {
        gamesBtn.onclick = () => {
            closeCharacterDetail();
            const games = currentAnalytics.games.filter(g =>
                g.players && g.players.some(p =>
                    p.role === characterName || (p.roles && p.roles.includes(characterName))));
            showGameHistory(characterName.replace(/_/g, ' '), roleType, games);
        };
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set up close handlers
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = closeCharacterDetail;
    modal.onclick = (e) => {
        if (e.target === modal) closeCharacterDetail();
    };
}

/**
 * Close the character detail modal.
 */
function closeCharacterDetail() {
    const modal = document.getElementById('character-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}
