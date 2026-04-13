/**
 * Blood on the Clocktower Stats - Main Application
 */

import { recalcAll, getLeaderboard, pctToStr, getRatingDelta } from './elo.js';
import { fetchGames, isDemoMode } from './supabase.js';
import { initGameEntry, updatePlayerNames } from './gameEntry.js';
import SITE_CONFIG from './site-config.js';

// Global state
let gameLog = [];
let players = {};
let leaderboard = [];
let currentSort = { column: 'rating', ascending: false };

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const contentEl = document.getElementById('content');
const tableBodyEl = document.getElementById('leaderboard-body');
const gameRangeInput = document.getElementById('game-range');
const clearRangeBtn = document.getElementById('clear-range');

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

        // Generate leaderboard
        leaderboard = getLeaderboard(players);

        // Update stats summary
        updateStatsSummary();

        // Render the leaderboard
        renderLeaderboard();

        // Set up event listeners
        setupEventListeners();

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

        // Regenerate leaderboard
        leaderboard = getLeaderboard(players);

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
 * Parse game range input
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
 * Render the leaderboard table
 */
function renderLeaderboard() {
    const { start, end } = parseGameRange();

    // Sort the leaderboard
    const sortedLeaderboard = [...leaderboard].sort((a, b) => {
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
        const delta = getRatingDelta(player, start, end);
        const deltaStr = delta !== null ? (delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)) : '-';
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

        row.innerHTML = `
            <td class="rank ${rankClass}">${player.rank}</td>
            <td class="player-name">${formatPlayerName(player.name)}</td>
            <td class="rating">${player.rating.toFixed(1)}</td>
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
    gameRangeInput.addEventListener('input', () => {
        renderLeaderboard();
    });

    // Clear range button
    clearRangeBtn.addEventListener('click', () => {
        gameRangeInput.value = '';
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

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closePlayerModal);
    document.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closePlayerModal();
        }
    });

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePlayerModal();
        }
    });
}

/**
 * Show player details modal with rating chart
 */
function showPlayerModal(player) {
    const modal = document.querySelector('.modal-overlay');
    const modalTitle = document.querySelector('.modal h3');
    const chartContainer = document.getElementById('rating-chart');

    modalTitle.textContent = `${formatPlayerName(player.name)} - Rating History`;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Render chart using Chart.js
    renderRatingChart(player, chartContainer);
}

/**
 * Close player modal
 */
function closePlayerModal() {
    const modal = document.querySelector('.modal-overlay');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Destroy existing chart
    const chartContainer = document.getElementById('rating-chart');
    if (chartContainer.chart) {
        chartContainer.chart.destroy();
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
    const gameNumbers = history.map(h => h.gameNumber);
    const ratings = history.map(h => h.rating);
    const overallPcts = history.map(h => h.overallWinPct);
    const goodPcts = history.map(h => h.goodWinPct);
    const evilPcts = history.map(h => h.evilWinPct);

    const ctx = container.getContext('2d');

    container.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: gameNumbers,
            datasets: [
                {
                    label: 'Rating',
                    data: ratings,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
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
