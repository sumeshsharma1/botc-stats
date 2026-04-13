/**
 * ELO calculation functions for Blood on the Clocktower
 * Ported from botc_elo.py
 */

import SITE_CONFIG from './site-config.js';

// Constants (from site-config.js)
export const DEFAULT_RATING = SITE_CONFIG.defaultRating || 1500;
export const ELO_K_FACTOR = SITE_CONFIG.kFactor || 32;
export const MIN_GAMES_FOR_LEADERBOARD = SITE_CONFIG.minGamesForLeaderboard || 5;

/**
 * Calculate expected score using ELO formula.
 * @param {number} ratingA - Rating of player/team A
 * @param {number} ratingB - Rating of player/team B
 * @returns {number} Expected score for player/team A (0-1)
 */
export function expectedScore(ratingA, ratingB) {
    return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Player class to track individual player stats
 */
export class Player {
    constructor(name) {
        this.name = name;
        this.currentRating = DEFAULT_RATING;
        this.ratingHistory = [];
        this.gameHistory = [];
        this.gamesOverall = 0;
        this.winsOverall = 0;
        this.gamesGood = 0;
        this.winsGood = 0;
        this.gamesEvil = 0;
        this.winsEvil = 0;
    }

    /**
     * Record a single game for this player.
     */
    recordGame(gameNumber, date, team, role, win, ratingBefore, ratingAfter, initialTeam = null, roles = null) {
        if (roles === null) {
            roles = [role];
        }
        if (initialTeam === null) {
            initialTeam = team;
        }

        const record = {
            gameNumber,
            date,
            team,
            role,
            win,
            ratingBefore,
            ratingAfter,
            initialTeam,
            roles,
        };
        this.gameHistory.push(record);

        // Update win/loss counters
        this.gamesOverall += 1;
        if (win) {
            this.winsOverall += 1;
        }
        if (team === "Good") {
            this.gamesGood += 1;
            if (win) {
                this.winsGood += 1;
            }
        } else if (team === "Evil") {
            this.gamesEvil += 1;
            if (win) {
                this.winsEvil += 1;
            }
        }

        // Calculate percentages for history snapshot
        const overallPct = this.gamesOverall > 0 ? (this.winsOverall / this.gamesOverall) * 100 : null;
        const goodPct = this.gamesGood > 0 ? (this.winsGood / this.gamesGood) * 100 : null;
        const evilPct = this.gamesEvil > 0 ? (this.winsEvil / this.gamesEvil) * 100 : null;

        this.ratingHistory.push({
            gameNumber,
            date,
            rating: ratingAfter,
            overallWinPct: overallPct,
            goodWinPct: goodPct,
            evilWinPct: evilPct,
        });
    }

    /**
     * Get win percentages
     */
    getWinPercentages() {
        return {
            overall: this.gamesOverall > 0 ? (this.winsOverall / this.gamesOverall) * 100 : null,
            good: this.gamesGood > 0 ? (this.winsGood / this.gamesGood) * 100 : null,
            evil: this.gamesEvil > 0 ? (this.winsEvil / this.gamesEvil) * 100 : null,
        };
    }
}

/**
 * Calculate average rating for a team.
 * @param {Array} teamList - Array of player objects with name field
 * @param {Object} players - Map of player name to Player object
 * @returns {number} Average rating of the team
 */
function teamAverage(teamList, players) {
    if (!teamList || teamList.length === 0) {
        return DEFAULT_RATING;
    }
    const sum = teamList.reduce((acc, p) => {
        const player = players[p.name];
        return acc + (player ? player.currentRating : DEFAULT_RATING);
    }, 0);
    return sum / teamList.length;
}

/**
 * Recalculate all player ratings by replaying the game log.
 * @param {Array} gameLog - Array of game records
 * @returns {Object} Map of player name to Player object with calculated stats
 */
export function recalcAll(gameLog) {
    const players = {};

    // Sort games chronologically by game_id
    const sortedGames = [...gameLog].sort((a, b) => a.game_id - b.game_id);

    for (const game of sortedGames) {
        // Ensure all players exist
        for (const p of game.players) {
            if (!players[p.name]) {
                players[p.name] = new Player(p.name);
            }
        }

        // Partition players by final team
        const teamGood = game.players.filter(p => p.team === "Good");
        const teamEvil = game.players.filter(p => p.team === "Evil");

        // Calculate team averages
        const avgGood = teamAverage(teamGood, players);
        const avgEvil = teamAverage(teamEvil, players);

        // Calculate expected scores
        const expGood = expectedScore(avgGood, avgEvil);
        const expEvil = 1.0 - expGood;

        // Determine results
        const resultGood = game.winning_team === "Good" ? 1 : 0;
        const resultEvil = game.winning_team === "Evil" ? 1 : 0;

        // Update each player's rating
        for (const p of game.players) {
            const player = players[p.name];
            const ratingBefore = player.currentRating;

            let delta;
            if (p.team === "Good") {
                delta = ELO_K_FACTOR * (resultGood - expGood);
            } else {
                delta = ELO_K_FACTOR * (resultEvil - expEvil);
            }

            const newRating = ratingBefore + delta;
            player.currentRating = newRating;

            const win = p.team === game.winning_team;
            player.recordGame(
                game.game_id,
                game.date,
                p.team,
                p.role || "",
                win,
                ratingBefore,
                newRating,
                p.initial_team,
                p.roles
            );
        }
    }

    return players;
}

/**
 * Format percentage for display.
 * @param {number|null} value - Percentage value or null
 * @returns {string} Formatted string
 */
export function pctToStr(value) {
    if (value === null || value === undefined) {
        return "N/A";
    }
    return value.toFixed(1);
}

/**
 * Get leaderboard data from players object.
 * @param {Object} players - Map of player name to Player object
 * @param {number} minGames - Minimum games required to appear on leaderboard
 * @returns {Array} Sorted array of player data for leaderboard
 */
export function getLeaderboard(players, minGames = MIN_GAMES_FOR_LEADERBOARD) {
    const leaderboard = [];

    for (const [name, player] of Object.entries(players)) {
        if (player.gamesOverall < minGames) {
            continue;
        }

        const winPcts = player.getWinPercentages();

        leaderboard.push({
            name: player.name,
            rating: player.currentRating,
            gamesPlayed: player.gamesOverall,
            overallWinPct: winPcts.overall,
            goodWinPct: winPcts.good,
            evilWinPct: winPcts.evil,
            ratingHistory: player.ratingHistory,
            gameHistory: player.gameHistory,
        });
    }

    // Sort by rating (highest first)
    leaderboard.sort((a, b) => b.rating - a.rating);

    // Add rank
    leaderboard.forEach((player, index) => {
        player.rank = index + 1;
    });

    return leaderboard;
}

/**
 * Calculate rating delta for a player over a game range.
 * @param {Object} player - Player object from leaderboard
 * @param {number} startGame - Starting game number
 * @param {number} endGame - Ending game number
 * @returns {number|null} Rating delta or null if can't calculate
 */
export function getRatingDelta(player, startGame, endGame) {
    if (startGame === null || endGame === null) {
        return null;
    }

    const history = player.ratingHistory;
    if (!history || history.length === 0) {
        return null;
    }

    // Find rating before start_game
    let ratingBefore = DEFAULT_RATING;
    for (const entry of history) {
        if (entry.gameNumber < startGame) {
            ratingBefore = entry.rating;
        } else {
            break;
        }
    }

    // Find rating after end_game
    let ratingAfter = null;
    for (const entry of history) {
        if (entry.gameNumber === endGame) {
            ratingAfter = entry.rating;
            break;
        } else if (entry.gameNumber > endGame) {
            break;
        }
    }

    // If we didn't find at end_game, try to find closest <= end_game
    if (ratingAfter === null) {
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].gameNumber <= endGame) {
                ratingAfter = history[i].rating;
                break;
            }
        }
    }

    if (ratingAfter === null) {
        return null;
    }

    return ratingAfter - ratingBefore;
}
