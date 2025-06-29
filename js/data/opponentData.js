// js/data/opponentData.js

/**
 * Manages opponent club data.
 * Stores persistent structural data for all AI clubs.
 * Generates temporary (seasonal) player data for opponent clubs.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';

// Internal collection of all clubs' structural data (including player's for consistency, but filtered when returned)
let allClubsInGameWorld = []; // Renamed from allOpponentClubs for clarity

/**
 * Initializes the list of all clubs (player and opponents) at the start of a new game.
 * Only structural data is stored here. Player lists are seasonal.
 * This is called from leagueData.js initially.
 * @param {string} playerClubLocation - The player's chosen hometown.
 * @param {string} playerClubId - The ID of the player's club.
 * @returns {Array<object>} An array of opponent club structural data.
 */
export function initializeOpponentClubs(playerClubLocation, playerClubId) {
    // This function will now generate just the opponent clubs.
    // The player's club is added to the league structure in leagueData.js.
    const generatedOpponents = dataGenerator.generateInitialOpponentClubs(playerClubLocation, playerClubId);
    console.log("Initial opponent clubs generated:", generatedOpponents.map(c => c.name));
    // Do not set allClubsInGameWorld here, as leagueData.js handles the full collection.
    return [...generatedOpponents]; // Return a copy of generated opponents
}

/**
 * Sets the full list of ALL clubs (player and opponents) in the game world.
 * This is called from main.js after leagues are generated or game is loaded.
 * @param {Array<object>} clubs - The array of ALL club objects.
 */
export function setAllOpponentClubs(clubs) { // Renamed from setAllOpponentClubs to setAllClubsInGameWorld for conceptual clarity if you wish
    allClubsInGameWorld = clubs;
    console.log("All clubs in game world set in opponentData:", allClubsInGameWorld.map(c => c.name));
}

/**
 * Retrieves a specific opponent club's structural data by ID.
 * @param {string} clubId - The ID of the opponent club.
 * @returns {object|undefined} The opponent club object or undefined if not found.
 */
export function getOpponentClub(clubId) {
    return allClubsInGameWorld.find(c => c.id === clubId);
}

/**
 * Retrieves the full list of all *opponent* clubs' structural data.
 * This function filters out the player's club ID.
 * @returns {Array<object>} A copy of the allOpponentClubs array.
 */
export function getAllOpponentClubs(playerClubId = null) { // Added optional playerClubId
    if (playerClubId) {
        return allClubsInGameWorld.filter(c => c.id !== playerClubId);
    }
    // If no playerClubId provided, assume we want all (e.g., for direct internal use by leagueData)
    return [...allClubsInGameWorld];
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
 * This modifies the 'leagueStats' property of the club object within allClubsInGameWorld.
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
    const clubIndex = allClubsInGameWorld.findIndex(c => c.id === clubId);
    if (clubIndex === -1) {
        console.warn(`Opponent club ${clubId} not found for stats update.`);
        return [...allClubsInGameWorld];
    }

    const updatedClubs = [...allClubsInGameWorld]; // Create shallow copy for immutability
    const clubToUpdate = updatedClubs[clubIndex];

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
    clubToUpdate.leagueStats.points += (won * 3) + (drawn * 1);

    // No need to set allOpponentClubs = updatedClubs; it's a shallow copy of the reference from gameState
    // allClubsInGameWorld is directly modified by reference here.
    return updatedClubs; // Return the shallow copy for gameState to update
}


/**
 * Resets seasonal league stats for all opponent clubs at the end of a season.
 * Preserves structural data.
 * @returns {Array<object>} A new array of opponent clubs with seasonal stats reset.
 */
export function resetOpponentSeasonalStats() {
    allClubsInGameWorld = allClubsInGameWorld.map(club => ({
        ...club,
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
    }));
    console.log("Opponent seasonal stats reset.");
    return [...allClubsInGameWorld];
}


// Helper to get a random element (not directly exposed, used internally)
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

