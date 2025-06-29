// js/data/playerData.js

/**
 * Manages all data for the player's squad.
 * Includes creating initial players, updating stats, morale, and fitness.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';

// Internal array to hold the player squad.
// This module's functions will return updated copies for gameState.playerClub.squad.
let currentSquad = [];

/**
 * Initializes the player's squad with a set number of default players.
 * This is called once when a new game starts.
 * @param {string} playerClubId - The ID of the player's club.
 * @returns {Array<object>} An array of player objects for the initial squad.
 */
export function initializePlayerSquad(playerClubId) {
    currentSquad = []; // Ensure it's empty for new game
    const positionsNeeded = [
        Constants.PLAYER_POSITIONS.GK, // 1 GK
        Constants.PLAYER_POSITIONS.CB, Constants.PLAYER_POSITIONS.CB, Constants.PLAYER_POSITIONS.RB, Constants.PLAYER_POSITIONS.LB, // 4 Defenders
        Constants.PLAYER_POSITIONS.CM, Constants.PLAYER_POSITIONS.CM, Constants.PLAYER_POSITIONS.LM, Constants.PLAYER_POSITIONS.RM, // 4 Midfielders
        Constants.PLAYER_POSITIONS.ST, Constants.PLAYER_POSITIONS.ST // 2 Strikers
    ]; // 11 Starting players

    // Fill up to DEFAULT_INITIAL_PLAYERS with random positions for reserves
    while (currentSquad.length < Constants.DEFAULT_INITIAL_PLAYERS) {
        let position = positionsNeeded[currentSquad.length] || getRandomElement(Object.values(Constants.PLAYER_POSITIONS));
        const player = dataGenerator.generatePlayer(position, 1); // Quality tier 1 for grassroots
        player.currentClubId = playerClubId;
        currentSquad.push(player);
    }
    console.log("Initial player squad generated:", currentSquad);
    return [...currentSquad]; // Return a copy
}

/**
 * Adds a new player to the squad.
 * @param {object} player - The player object to add.
 * @param {string} playerClubId - The ID of the player's club.
 * @returns {Array<object>} A new array with the added player.
 */
export function addPlayer(player, playerClubId) {
    player.currentClubId = playerClubId;
    currentSquad = [...currentSquad, player];
    console.log("Player added to squad:", player.name);
    return [...currentSquad];
}

/**
 * Removes a player from the squad (e.g., leaving, retirement).
 * @param {string} playerId - The ID of the player to remove.
 * @returns {Array<object>} A new array without the removed player.
 */
export function removePlayer(playerId) {
    const originalLength = currentSquad.length;
    currentSquad = currentSquad.filter(p => p.id !== playerId);
    if (currentSquad.length < originalLength) {
        console.log(`Player ${playerId} removed from squad.`);
    } else {
        console.warn(`Player ${playerId} not found in squad for removal.`);
    }
    return [...currentSquad];
}

/**
 * Retrieves a player object by ID.
 * @param {string} playerId - The ID of the player.
 * @returns {object|undefined} The player object or undefined if not found.
 */
export function getPlayer(playerId) {
    return currentSquad.find(p => p.id === playerId);
}

/**
 * Retrieves the entire current squad.
 * @returns {Array<object>} A copy of the current squad array.
 */
export function getSquad() {
    return [...currentSquad];
}

/**
 * Updates a player's stats (e.g., goals, appearances) after a match.
 * @param {string} playerId - The ID of the player to update.
 * @param {object} updates - Object containing the stats to update (e.g., { goals: 1, appearances: 1 }).
 * @returns {Array<object>} A new array with the updated player.
 */
export function updatePlayerStats(playerId, updates) {
    const playerIndex = currentSquad.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
        console.warn(`Player ${playerId} not found for stats update.`);
        return [...currentSquad];
    }

    const updatedSquad = [...currentSquad];
    const playerToUpdate = { ...updatedSquad[playerIndex] }; // Shallow copy for modification

    for (const key in updates) {
        if (playerToUpdate.currentSeasonStats.hasOwnProperty(key)) {
            playerToUpdate.currentSeasonStats[key] += updates[key];
        } else if (playerToUpdate.status.hasOwnProperty(key)) { // For status updates like fitness, morale directly
            playerToUpdate.status[key] = updates[key];
        }
    }
    updatedSquad[playerIndex] = playerToUpdate;
    currentSquad = updatedSquad;
    return [...currentSquad];
}

/**
 * Adjusts a player's morale.
 * @param {string} playerId - The ID of the player.
 * @param {number} change - The amount to change morale by (positive for increase, negative for decrease).
 * @returns {Array<object>} A new array with the updated player.
 */
export function updatePlayerMorale(playerId, change) {
    const playerIndex = currentSquad.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return [...currentSquad];

    const updatedSquad = [...currentSquad];
    const playerToUpdate = { ...updatedSquad[playerIndex] };

    playerToUpdate.status.morale = Math.max(0, Math.min(100, playerToUpdate.status.morale + change)); // Cap between 0 and 100
    updatedSquad[playerIndex] = playerToUpdate;
    currentSquad = updatedSquad;
    return [...currentSquad];
}

/**
 * Resets all current season stats for players at the end of a season.
 * @returns {Array<object>} A new array with player stats reset.
 */
export function resetPlayerSeasonStats() {
    currentSquad = currentSquad.map(player => ({
        ...player,
        currentSeasonStats: {
            appearances: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            manOfTheMatchAwards: 0,
            averageRating: 0
        },
        status: {
            ...player.status,
            fitness: 100, // Players regain full fitness in off-season
            injuryStatus: 'Fit',
            injuryReturnDate: null,
            suspended: false,
            suspensionGames: 0
        }
    }));
    console.log("Player season stats reset.");
    return [...currentSquad];
}

// Helper to get a random element (not directly exposed, used internally)
function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// NOTE: This module does NOT manage the global `gameState`.
// Its functions return updated arrays/objects that `main.js` will assign to `gameState.playerClub.squad`.
// This design promotes modularity and avoids circular dependencies or unexpected state changes.

