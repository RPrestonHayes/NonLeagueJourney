// js/data/opponentData.js

/**
 * Manages opponent club data.
 * Stores persistent structural data for all AI clubs.
 * Generates temporary (seasonal) player data for opponent clubs.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';
// Import specific functions needed from dataGenerator
import { getRandomInt, getRandomElement } from '../utils/dataGenerator.js'; // NEW: Import specific helper functions

// Internal collection of all clubs' structural data (including player's for consistency, but filtered when returned as 'opponents')
let allClubsInGameWorld = [];

/**
 * Initializes the list of opponent clubs at the start of a new game.
 * Only structural data is stored here. Player lists are seasonal.
 * This is called from leagueData.js initially.
 * @param {string} playerClubLocation - The player's chosen hometown.
 * @returns {Array<object>} An array of opponent club structural data.
 */
export function initializeOpponentClubs(playerClubLocation) {
    const generatedOpponents = dataGenerator.generateInitialOpponentClubs(playerClubLocation);
    console.log("Initial opponent clubs generated:", generatedOpponents.map(c => c.name));
    return [...generatedOpponents];
}

/**
 * Sets the full list of ALL clubs (player and opponents) in the game world.
 * This is called from main.js after leagues are generated or game is loaded.
 * @param {Array<object>} clubs - The array of ALL club objects.
 */
export function setAllOpponentClubs(clubs) {
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
 * @param {string|null} playerClubId - The ID of the player's club to exclude from the list. If null, returns all clubs.
 * @returns {Array<object>} A copy of the allOpponentClubs array.
 */
export function getAllOpponentClubs(playerClubId = null) {
    if (playerClubId) {
        return allClubsInGameWorld.filter(c => c.id !== playerClubId);
    }
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
    const numPlayers = getRandomInt(14, 20); // Uses imported getRandomInt
    const positions = Object.values(Constants.PLAYER_POSITIONS);

    for (let i = 0; i < numPlayers; i++) {
        const player = dataGenerator.generatePlayer(getRandomElement(positions), qualityTier); // Uses imported getRandomElement
        player.currentClubId = clubId;
        player.currentSeasonStats = {
            appearances: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            manOfTheMatchAwards: 0,
            averageRating: 0
        };
        player.status = {
            morale: getRandomInt(50, 90), // Uses imported getRandomInt
            fitness: getRandomInt(80, 100), // Uses imported getRandomInt
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

    const updatedClubs = [...allClubsInGameWorld];
    const clubToUpdate = updatedClubs[clubIndex];

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

    return updatedClubs;
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

// NOTE: getRandomInt and getRandomElement are now imported, no longer defined internally.
// Ensure dataGenerator.js exports them.

