/**
 * Glicko-2 rating system for Blood on the Clocktower
 *
 * Each player faces a "virtual opponent" whose rating and deviation are the
 * average (and RMS deviation) of the opposing team. This adapts the standard
 * 1v1 Glicko-2 algorithm to a multi-player team game.
 *
 * Ratings are updated once per session (all games sharing the same date),
 * which is the canonical Glicko-2 "rating period" approach. This prevents a
 * single day's results from compounding game-by-game within the session.
 *
 * Reference: http://www.glicko.net/glicko/glicko2.pdf
 */

import SITE_CONFIG from './site-config.js';

const DEFAULT_RATING  = SITE_CONFIG.defaultRating || 1500;
const DEFAULT_RD      = 200;   // Lower than chess default (350) — appropriate for a known small group
const DEFAULT_SIGMA   = 0.06;  // Starting volatility
const TAU             = 0.5;   // System constant — constrains how fast volatility changes
const SCALE           = 173.7178; // Glicko-2 internal scale factor
const INACTIVITY_RD_PER_MONTH = SITE_CONFIG.inactivityRdPerMonth ?? 40;

export const MIN_GAMES_FOR_LEADERBOARD    = SITE_CONFIG.minGamesForLeaderboard    || 2;
export const MIN_SESSIONS_FOR_LEADERBOARD = SITE_CONFIG.minSessionsForLeaderboard || 1;

function daysBetween(dateA, dateB) {
    return Math.round((new Date(dateB) - new Date(dateA)) / 86400000);
}

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
 * Apply one Glicko-2 period update for a player against all opponents in a period.
 * This is the canonical multi-game update from the Glicko-2 paper (steps 3–8),
 * processing all games simultaneously rather than sequentially.
 *
 * @param {number} r      Pre-period rating
 * @param {number} rd     Pre-period rating deviation
 * @param {number} sigma  Pre-period volatility
 * @param {Array}  games  [{ rOpp, rdOpp, score }] — all games in this period
 * @returns {{ r, rd, sigma }}
 */
function updatePlayerPeriod(r, rd, sigma, games) {
    const { mu, phi } = toG2(r, rd);

    // Compute estimated variance (v) and improvement (deltaSum) across all period games
    let vInv = 0;
    let deltaSum = 0;
    for (const { rOpp, rdOpp, score } of games) {
        const { mu: muOpp, phi: phiOpp } = toG2(rOpp, rdOpp);
        const g = gPhi(phiOpp);
        const e = expectedScore(mu, muOpp, phiOpp);
        vInv     += g * g * e * (1 - e);
        deltaSum += g * (score - e);
    }

    const v     = 1 / vInv;
    const delta = v * deltaSum;

    const newSigma  = updateVolatility(sigma, phi, delta, v);
    const phiStar   = Math.sqrt(phi * phi + newSigma * newSigma);
    const newPhi    = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
    const newMu     = mu + newPhi * newPhi * deltaSum;

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
        this.ratingHistory  = [];
        this.gameHistory    = [];
        this.lastPeriodDate  = null; // date string of most recently processed period
        this.sessionsPlayed  = 0;   // distinct game nights attended
        this.gamesOverall    = 0;
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
 * Build the virtual opponent for a team using a pre-period rating snapshot,
 * so within-period game order doesn't affect opponent strength calculations.
 */
function virtualOpponentFromSnapshot(opposingTeam, snapshot) {
    const n = opposingTeam.length;
    if (n === 0) return { r: DEFAULT_RATING, rd: DEFAULT_RD };
    let sumR = 0, sumPhiSq = 0;
    for (const p of opposingTeam) {
        const pl = snapshot[p.name] || { r: DEFAULT_RATING, rd: DEFAULT_RD };
        sumR += pl.r;
        const { phi } = toG2(pl.r, pl.rd);
        sumPhiSq += phi * phi;
    }
    return {
        r:  sumR / n,
        rd: SCALE * Math.sqrt(sumPhiSq / n),
    };
}

/**
 * Recalculate all Glicko-2 ratings using date-based rating periods.
 * All games on the same date form one period — each player receives a single
 * update per period regardless of how many games they played that day.
 *
 * @param {Array} gameLog
 * @returns {Object} Map of player name → Glicko2Player
 */
export function recalcAllGlicko2(gameLog) {
    const players = {};

    // Sort chronologically by date then game_id for stable within-period ordering
    const sortedGames = [...gameLog].sort((a, b) => {
        const dateA = (a.date || '').substring(0, 10);
        const dateB = (b.date || '').substring(0, 10);
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return a.game_id - b.game_id;
    });

    // Group games into rating periods by date
    const periodMap = new Map();
    for (const game of sortedGames) {
        const key = (game.date || '').substring(0, 10) || `id-${game.game_id}`;
        if (!periodMap.has(key)) periodMap.set(key, []);
        periodMap.get(key).push(game);
    }

    for (const [, periodGames] of periodMap) {
        // Ensure all players appearing this period exist
        for (const game of periodGames) {
            for (const p of game.players) {
                if (!players[p.name]) players[p.name] = new Glicko2Player(p.name);
            }
        }

        // Snapshot all player ratings at period start — opponents are evaluated
        // against these pre-period values, not ratings mid-session.
        const snapshot = {};
        for (const [name, player] of Object.entries(players)) {
            snapshot[name] = { r: player.r, rd: player.rd, sigma: player.sigma };
        }

        // Collect per-player results for every game in this period
        const periodData = {}; // name → [{ rOpp, rdOpp, score, ...metadata }]
        for (const game of periodGames) {
            const teamGood = game.players.filter(p => p.team === 'Good');
            const teamEvil = game.players.filter(p => p.team === 'Evil');
            const oppForGood = virtualOpponentFromSnapshot(teamEvil, snapshot);
            const oppForEvil = virtualOpponentFromSnapshot(teamGood, snapshot);

            for (const p of game.players) {
                if (!periodData[p.name]) periodData[p.name] = [];
                const opp = p.team === 'Good' ? oppForGood : oppForEvil;
                const win = p.team === game.winning_team;
                periodData[p.name].push({
                    rOpp: opp.r, rdOpp: opp.rd, score: win ? 1 : 0,
                    game_id: game.game_id, date: game.date,
                    team: p.team, role: p.role || '', win,
                    initial_team: p.initial_team, roles: p.roles,
                });
            }
        }

        // One Glicko-2 update per player for the entire period
        const periodDate = periodGames[0]?.date?.substring(0, 10) ?? null;

        for (const [name, games] of Object.entries(periodData)) {
            const player = players[name];
            const pre    = snapshot[name];
            const updated = updatePlayerPeriod(pre.r, pre.rd, pre.sigma, games);

            player.r     = updated.r;
            player.rd    = updated.rd;
            player.sigma = updated.sigma;
            player.lastPeriodDate = periodDate;
            player.sessionsPlayed++;

            // Record each game individually for history/stats, but all share the
            // same pre- and post-period ratings since the update is applied once.
            for (const gd of games) {
                player.recordGame(
                    gd.game_id, gd.date, gd.team, gd.role, gd.win,
                    pre.r, pre.rd, updated.r, updated.rd,
                    gd.initial_team, gd.roles
                );
            }
        }

        // Inflate RD for players who sat out this period, proportional to actual
        // days elapsed since they last played. Longer absences = more uncertainty.
        if (periodDate && INACTIVITY_RD_PER_MONTH > 0) {
            const phiMonthly = INACTIVITY_RD_PER_MONTH / SCALE;
            for (const [name, player] of Object.entries(players)) {
                if (periodData[name] || !player.lastPeriodDate) continue;
                const days = daysBetween(player.lastPeriodDate, periodDate);
                if (days <= 0) continue;
                const monthsElapsed = days / 30;
                const phi = player.rd / SCALE;
                const newPhi = Math.sqrt(phi * phi + monthsElapsed * phiMonthly * phiMonthly);
                player.rd = Math.min(newPhi * SCALE, DEFAULT_RD);
                player.lastPeriodDate = periodDate;
            }
        }
    }

    return players;
}

/**
 * Get Glicko-2 leaderboard sorted by conservative rating (Rating − RD).
 *
 * @param {Object} players
 * @param {number} minGames
 * @returns {Array}
 */
export function getGlicko2Leaderboard(
    players,
    minGames    = MIN_GAMES_FOR_LEADERBOARD,
    minSessions = MIN_SESSIONS_FOR_LEADERBOARD
) {
    const leaderboard = [];

    for (const [, player] of Object.entries(players)) {
        if (player.gamesOverall   < minGames)    continue;
        if (player.sessionsPlayed < minSessions) continue;

        const winPcts = player.getWinPercentages();
        leaderboard.push({
            name:              player.name,
            rating:            player.r,
            rd:                player.rd,
            conservativeRating: player.r - player.rd,
            gamesPlayed:       player.gamesOverall,
            sessionsPlayed:    player.sessionsPlayed,
            overallWinPct:     winPcts.overall,
            goodWinPct:        winPcts.good,
            evilWinPct:        winPcts.evil,
            ratingHistory:     player.ratingHistory,
            gameHistory:       player.gameHistory,
        });
    }

    // Sort by conservative estimate (Rating − RD): rewards stable ratings earned
    // over many games vs. high-uncertainty ratings from small samples.
    leaderboard.sort((a, b) => b.conservativeRating - a.conservativeRating);
    leaderboard.forEach((p, i) => { p.rank = i + 1; });

    return leaderboard;
}
