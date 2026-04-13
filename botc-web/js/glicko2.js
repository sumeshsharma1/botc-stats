/**
 * Glicko-2 rating system for Blood on the Clocktower
 *
 * Each player faces a "virtual opponent" whose rating and deviation are the
 * average (and RMS deviation) of the opposing team. This adapts the standard
 * 1v1 Glicko-2 algorithm to a multi-player team game.
 *
 * Reference: http://www.glicko.net/glicko/glicko2.pdf
 */

import SITE_CONFIG from './site-config.js';

const DEFAULT_RATING  = SITE_CONFIG.defaultRating || 1500;
const DEFAULT_RD      = 350;   // Starting RD — high uncertainty for new players
const DEFAULT_SIGMA   = 0.06;  // Starting volatility
const TAU             = 0.5;   // System constant — constrains how fast volatility changes
const SCALE           = 173.7178; // Glicko-2 internal scale factor

export const MIN_GAMES_FOR_LEADERBOARD = SITE_CONFIG.minGamesForLeaderboard || 2;

// ==========================================
// SCALE CONVERSIONS
// ==========================================

function toG2(r, rd) {
    return { mu: (r - DEFAULT_RATING) / SCALE, phi: rd / SCALE };
}

function fromG2(mu, phi) {
    return { r: SCALE * mu + DEFAULT_RATING, rd: SCALE * phi };
}

// ==========================================
// GLICKO-2 CORE FUNCTIONS
// ==========================================

function gPhi(phi) {
    return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function expectedScore(mu, muOpp, phiOpp) {
    return 1 / (1 + Math.exp(-gPhi(phiOpp) * (mu - muOpp)));
}

/**
 * Update volatility using the Illinois algorithm (iterative root-finding).
 * Finds σ' such that the updated rating change is consistent with observed results.
 */
function updateVolatility(sigma, phi, delta, v) {
    const a   = Math.log(sigma * sigma);
    const eps = 1e-6;

    function f(x) {
        const ex = Math.exp(x);
        const d2 = delta * delta;
        const p2 = phi * phi;
        return (ex * (d2 - p2 - v - ex)) / (2 * Math.pow(p2 + v + ex, 2))
             - (x - a) / (TAU * TAU);
    }

    let A = a;
    let B;
    if (delta * delta > phi * phi + v) {
        B = Math.log(delta * delta - phi * phi - v);
    } else {
        let k = 1;
        while (f(a - k * TAU) < 0) k++;
        B = a - k * TAU;
    }

    let fA = f(A);
    let fB = f(B);

    for (let i = 0; i < 100 && Math.abs(B - A) > eps; i++) {
        const C  = A + (A - B) * fA / (fB - fA);
        const fC = f(C);
        if (fC * fB < 0) { A = B; fA = fB; } else { fA /= 2; }
        B = C; fB = fC;
    }

    return Math.exp(A / 2);
}

/**
 * Apply one Glicko-2 update for a player against a virtual opponent.
 *
 * @param {number} r      Current rating
 * @param {number} rd     Current rating deviation
 * @param {number} sigma  Current volatility
 * @param {number} rOpp   Virtual opponent rating (average of opposing team)
 * @param {number} rdOpp  Virtual opponent RD (RMS of opposing team RDs)
 * @param {number} score  1 = win, 0 = loss
 * @returns {{ r, rd, sigma }}
 */
function updatePlayer(r, rd, sigma, rOpp, rdOpp, score) {
    const { mu, phi }           = toG2(r, rd);
    const { mu: muOpp, phi: phiOpp } = toG2(rOpp, rdOpp);

    const g = gPhi(phiOpp);
    const e = expectedScore(mu, muOpp, phiOpp);

    const v     = 1 / (g * g * e * (1 - e));
    const delta = v * g * (score - e);

    const newSigma  = updateVolatility(sigma, phi, delta, v);
    const phiStar   = Math.sqrt(phi * phi + newSigma * newSigma);
    const newPhi    = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
    const newMu     = mu + newPhi * newPhi * g * (score - e);

    const { r: newR, rd: newRd } = fromG2(newMu, newPhi);
    return { r: newR, rd: newRd, sigma: newSigma };
}

// ==========================================
// PLAYER CLASS
// ==========================================

export class Glicko2Player {
    constructor(name) {
        this.name         = name;
        this.r            = DEFAULT_RATING;
        this.rd           = DEFAULT_RD;
        this.sigma        = DEFAULT_SIGMA;
        this.ratingHistory = [];
        this.gameHistory  = [];
        this.gamesOverall = 0;
        this.winsOverall  = 0;
        this.gamesGood    = 0;
        this.winsGood     = 0;
        this.gamesEvil    = 0;
        this.winsEvil     = 0;
    }

    recordGame(gameNumber, date, team, role, win, rBefore, rdBefore, rAfter, rdAfter, initialTeam, roles) {
        this.gameHistory.push({
            gameNumber, date, team, role, win,
            ratingBefore: rBefore, rdBefore,
            ratingAfter: rAfter,  rdAfter,
            initialTeam: initialTeam || team,
            roles: roles || [role],
        });

        this.gamesOverall++;
        if (win) this.winsOverall++;
        if (team === 'Good')      { this.gamesGood++; if (win) this.winsGood++; }
        else if (team === 'Evil') { this.gamesEvil++; if (win) this.winsEvil++; }

        this.ratingHistory.push({
            gameNumber,
            date,
            rating: rAfter,
            rd: rdAfter,
            overallWinPct: this.gamesOverall > 0 ? (this.winsOverall / this.gamesOverall) * 100 : null,
            goodWinPct:    this.gamesGood    > 0 ? (this.winsGood    / this.gamesGood)    * 100 : null,
            evilWinPct:    this.gamesEvil    > 0 ? (this.winsEvil    / this.gamesEvil)    * 100 : null,
        });
    }

    getWinPercentages() {
        return {
            overall: this.gamesOverall > 0 ? (this.winsOverall / this.gamesOverall) * 100 : null,
            good:    this.gamesGood    > 0 ? (this.winsGood    / this.gamesGood)    * 100 : null,
            evil:    this.gamesEvil    > 0 ? (this.winsEvil    / this.gamesEvil)    * 100 : null,
        };
    }
}

// ==========================================
// LEADERBOARD COMPUTATION
// ==========================================

/**
 * Build the virtual opponent for a team: the opposing team's average rating
 * and RMS rating deviation, snapshotted before any updates this game.
 */
function virtualOpponent(opposingTeam, players) {
    const n = opposingTeam.length;
    let sumR = 0, sumPhiSq = 0;
    for (const p of opposingTeam) {
        const pl = players[p.name];
        sumR += pl.r;
        const { phi } = toG2(pl.r, pl.rd);
        sumPhiSq += phi * phi;
    }
    return {
        r:  sumR / n,
        rd: SCALE * Math.sqrt(sumPhiSq / n), // RMS phi converted back to RD scale
    };
}

/**
 * Recalculate all Glicko-2 ratings by replaying the game log chronologically.
 *
 * @param {Array} gameLog
 * @returns {Object} Map of player name → Glicko2Player
 */
export function recalcAllGlicko2(gameLog) {
    const players = {};

    const sortedGames = [...gameLog].sort((a, b) => a.game_id - b.game_id);

    for (const game of sortedGames) {
        for (const p of game.players) {
            if (!players[p.name]) players[p.name] = new Glicko2Player(p.name);
        }

        const teamGood = game.players.filter(p => p.team === 'Good');
        const teamEvil = game.players.filter(p => p.team === 'Evil');

        // Snapshot virtual opponents BEFORE updating any player this game,
        // so simultaneous updates don't affect each other.
        const oppForGood = virtualOpponent(teamEvil, players);
        const oppForEvil = virtualOpponent(teamGood, players);

        for (const p of game.players) {
            const player = players[p.name];
            const rBefore  = player.r;
            const rdBefore = player.rd;

            const opp   = p.team === 'Good' ? oppForGood : oppForEvil;
            const score = p.team === game.winning_team ? 1 : 0;

            const updated = updatePlayer(player.r, player.rd, player.sigma, opp.r, opp.rd, score);
            player.r     = updated.r;
            player.rd    = updated.rd;
            player.sigma = updated.sigma;

            player.recordGame(
                game.game_id, game.date, p.team, p.role || '',
                p.team === game.winning_team,
                rBefore, rdBefore, updated.r, updated.rd,
                p.initial_team, p.roles
            );
        }
    }

    return players;
}

/**
 * Get Glicko-2 leaderboard sorted by rating descending.
 *
 * @param {Object} players
 * @param {number} minGames
 * @returns {Array}
 */
export function getGlicko2Leaderboard(players, minGames = MIN_GAMES_FOR_LEADERBOARD) {
    const leaderboard = [];

    for (const [, player] of Object.entries(players)) {
        if (player.gamesOverall < minGames) continue;

        const winPcts = player.getWinPercentages();
        leaderboard.push({
            name:         player.name,
            rating:       player.r,
            rd:           player.rd,
            gamesPlayed:  player.gamesOverall,
            overallWinPct: winPcts.overall,
            goodWinPct:   winPcts.good,
            evilWinPct:   winPcts.evil,
            ratingHistory: player.ratingHistory,
            gameHistory:  player.gameHistory,
        });
    }

    leaderboard.sort((a, b) => b.rating - a.rating);
    leaderboard.forEach((p, i) => { p.rank = i + 1; });

    return leaderboard;
}
