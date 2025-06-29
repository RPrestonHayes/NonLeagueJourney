// js/data/opponentData.js

/**
 * Manages opponent club data.
 * Stores persistent structural data for all AI clubs.
 * Generates temporary (seasonal) player data for opponent clubs.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';

// Internal collection of all opponent clubs' structural data.
// This will be part of the main game state.
let allOpponentClubs = [];

/**
 * Initializes the list of opponent clubs at the start of a new game.
 * Only structural data is stored here. Player lists are seasonal.
 * @param {string} playerClubLocation - The player's chosen hometown.
 * @param {string} playerClubId - The ID of the player's club.
 * @returns {Array<object>} An array of opponent club structural data.
 */
export function initializeOpponentClubs(playerClubLocation, playerClubId) {
    allOpponentClubs = dataGenerator.generateInitialOpponentClubs(playerClubLocation, playerClubId);
    console.log("Initial opponent clubs generated:", allOpponentClubs.map(c => c.name));
    return [...allOpponentClubs]; // Return a copy
}

/**
 * Sets the full list of opponent clubs (e.g., after loading a game).
 * @param {Array<object>} clubs - The array of opponent club objects.
 */
export function setAllOpponentClubs(clubs) {
    allOpponentClubs = clubs;
}

/**
 * Retrieves a specific opponent club's structural data by ID.
 * @param {string} clubId - The ID of the opponent club.
 * @returns {object|undefined} The opponent club object or undefined if not found.
 */
export function getOpponentClub(clubId) {
    return allOpponentClubs.find(c => c.id === clubId);
}

/**
 * Retrieves the full list of all opponent clubs' structural data.
 * @returns {Array<object>} A copy of the allOpponentClubs array.
 */
export function getAllOpponentClubs() {
    return [...allOpponentClubs];
}

/**
 * Generates a temporary player list for a single opponent club for the current season.
 * This data is NOT persisted with the main opponent club object to save space.
 * It's generated as needed for match simulation and season-end reports.
 * @param {string} clubId - The ID of the opponent club.
 * @param {number} qualityTier - The base quality tier for player generation for this club.
 * @returns {Array<object>} A temporary array of player objects (simplified for AI).
 */
export function generateSeasonalOpponentPlayers(clubId, qualityTier) {
    const players = [];
    const numPlayers = getRandomInt(14, 20); // Typical squad size for grassroots
    const positions = Object.values(Constants.PLAYER_POSITIONS);

    for (let i = 0; i < numPlayers; i++) {
        const player = dataGenerator.generatePlayer(getRandomElement(positions), qualityTier);
        player.currentClubId = clubId;
        // Simplify opponent player stats to only what's needed for simulation/match report
        player.currentSeasonStats = {
            appearances: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            manOfTheMatchAwards: 0,
            averageRating: 0 // Will be calculated post-match
        };
        // Simplify opponent player status
        player.status = {
            morale: getRandomInt(50, 90),
            fitness: getRandomInt(80, 100),
            injuryStatus: 'Fit',
            injuryReturnDate: null,
            suspended: false,
            suspensionGames: 0
        };
        players.push(player);
    }
    return players;
}

/**
 * Updates an opponent club's league stats after a match.
 * This modifies the *persistent* structural data for current season tracking.
 * @param {string} clubId - The ID of the opponent club.
 * @param {number} played - Games played (usually 1).
 * @param {number} won - Wins (0 or 1).
 * @param {number} drawn - Draws (0 or 1).
 * @param {number} lost - Losses (0 or 1).
 * @param {number} goalsFor - Goals scored.
 * @param {number} goalsAgainst - Goals conceded.
 * @returns {Array<object>} A new array of opponent clubs with updated stats.
 */
export function updateOpponentLeagueStats(clubId, played, won, drawn, lost, goalsFor, goalsAgainst) {
    const clubIndex = allOpponentClubs.findIndex(c => c.id === clubId);
    if (clubIndex === -1) {
        console.warn(`Opponent club ${clubId} not found for stats update.`);
        return [...allOpponentClubs];
    }

    const updatedClubs = [...allOpponentClubs];
    const clubToUpdate = { ...updatedClubs[clubIndex] };

    // Initialize stats if they don't exist (e.g., start of season)
    if (!clubToUpdate.leagueStats) {
        clubToUpdate.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    }

    clubToUpdate.leagueStats.played += played;
    clubToUpdate.leagueStats.won += won;
    clubToUpdate.leagueStats.drawn += drawn;
    clubToUpdate.leagueStats.lost += lost;
    clubToUpdate.leagueStats.goalsFor += goalsFor;
    clubToUpdate.leagueStats.goalsAgainst += goalsAgainst;
    clubToUpdate.leagueStats.goalDifference = clubToUpdate.leagueStats.goalsFor - clubToUpdate.leagueStats.goalsAgainst;
    clubToUpdate.leagueStats.points += (won * 3) + (drawn * 1); // 3 for win, 1 for draw

    updatedClubs[clubIndex] = clubToUpdate;
    allOpponentClubs = updatedClubs; // Update internal state
    return [...allOpponentClubs]; // Return a copy for gameState
}


/**
 * Resets seasonal league stats for all opponent clubs at the end of a season.
 * Preserves structural data.
 * @returns {Array<object>} A new array of opponent clubs with seasonal stats reset.
 */
export function resetOpponentSeasonalStats() {
    allOpponentClubs = allOpponentClubs.map(club => ({
        ...club,
        // Preserve finalLeaguePosition if needed for history, but reset current leagueStats
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
    }));
    console.log("Opponent seasonal stats reset.");
    return [...allOpponentClubs];
}


// Helper to get a random element (not directly exposed, used internally)
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

