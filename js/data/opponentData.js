// js/data/opponentData.js

/**
 * Manages opponent club data.
 * Stores persistent structural data for all AI clubs.
 * Generates temporary (seasonal) player data for opponent clubs.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';
// Import specific functions needed from dataGenerator
import { getRandomInt, getRandomElement } from '../utils/dataGenerator.js';

// Internal collection of all clubs' structural data (including player's for consistency, but filtered when returned as 'opponents')
let allClubsInGameWorld = [];

/**
 * Initializes the list of opponent clubs for the player's starting league.
 * Only structural data is stored here. Player lists are seasonal.
 * This is called from leagueData.js initially.
 * @param {object} playerCountyData - The county data object for the player's chosen location.
 * @returns {Array<object>} An array of opponent club structural data.
 */
export function initializeOpponentClubs(playerCountyData) {
    const generatedOpponents = [];
    // Generate DEFAULT_LEAGUE_SIZE - 1 opponents for the player's starting league
    for (let i = 0; i < Constants.DEFAULT_LEAGUE_SIZE - 1; i++) {
        const id = dataGenerator.generateUniqueId('C');
        let identity = dataGenerator.generateClubIdentity(playerCountyData); // Pass the county data object
        let name = identity.name;
        let nickname = identity.nickname;
        const kitColors = dataGenerator.generateKitColors();

        // Add a chance for "reserve" teams from major towns in the region
        if (getRandomInt(1, 100) < 30) {
            const majorTownCandidates = playerCountyData.towns.filter(t => t.length > 7 || ['Leicester', 'Nottingham', 'Derby', 'Birmingham', 'Sheffield', 'Manchester', 'Liverpool', 'Leeds', 'Bristol', 'Newcastle'].includes(t));
            const majorTown = getRandomElement(majorTownCandidates.length > 0 ? majorTownCandidates : playerCountyData.towns);
            
            if (majorTown) {
                name = `${majorTown} ${getRandomElement(['Reserves', 'U23s', 'Development Squad'])}`;
                // Nickname will be handled by generateClubIdentity's internal logic
            }
        }

        generatedOpponents.push({
            id: id, name: name, location: getRandomElement(playerCountyData.towns), nickname: nickname, kitColors: kitColors,
            overallTeamQuality: getRandomInt(5, 10), // Initial league opponents are lower quality
            currentLeagueId: null, finalLeaguePosition: null, // These will be set by leagueData
            leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
            inCup: true, // Assume all initial league teams are in the cup
            eliminatedFromCup: false,
            potentialLeagueLevel: 0 // Default for league teams
        });
    }
    console.log("Initial opponent clubs generated:", generatedOpponents.map(c => c.name));
    return [...generatedOpponents];
}

/**
 * Generates a single new opponent club. Useful for cup draws or new league teams.
 * @param {object} playerCountyData - The county data object for the player's chosen location.
 * @param {number} qualityTier - The base quality tier for player generation for this club (e.g., 8-15 for cup).
 * @returns {object} A single opponent club structural data object.
 */
export function generateSingleOpponentClub(playerCountyData, qualityTier = 10) {
    const id = dataGenerator.generateUniqueId('C');
    let identity = dataGenerator.generateClubIdentity(playerCountyData);
    let name = identity.name;
    let nickname = identity.nickname;
    const kitColors = dataGenerator.generateKitColors();

    // Chance for a higher quality team to be a "City" or "United" type
    if (qualityTier > 12 && getRandomInt(1, 100) < 50) {
        name = `${getRandomElement(playerCountyData.towns.filter(t => t.length > 5))} ${getRandomElement(['City', 'United', 'Athletic'])}`;
    } else if (qualityTier > 8 && getRandomInt(1, 100) < 20) {
        name = `${getRandomElement(playerCountyData.towns)} ${getRandomElement(['Rovers', 'Wanderers'])}`;
    }

    // Determine potentialLeagueLevel based on qualityTier
    let potentialLeagueLevel;
    if (qualityTier >= 18) {
        potentialLeagueLevel = 1; // Top tier non-league (e.g., National League)
    } else if (qualityTier >= 15) {
        potentialLeagueLevel = 2; // High non-league (e.g., NPL Premier)
    } else if (qualityTier >= 12) {
        potentialLeagueLevel = 3; // Mid non-league (e.g., NPL Division 1)
    } else if (qualityTier >= 9) {
        potentialLeagueLevel = 4; // Lower non-league (e.g., County League Premier)
    } else {
        potentialLeagueLevel = 5; // Grassroots/Local Leagues
    }


    return {
        id: id, name: name, location: getRandomElement(playerCountyData.towns), nickname: nickname, kitColors: kitColors,
        overallTeamQuality: getRandomInt(qualityTier - 3, qualityTier + 3), // Vary quality around the tier
        currentLeagueId: null, finalLeaguePosition: null,
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
        inCup: true, // New teams are assumed to be in cup
        eliminatedFromCup: false,
        potentialLeagueLevel: potentialLeagueLevel // NEW: Store the potential league level
    };
}


/**
 * Sets the full list of ALL clubs (player and opponents) in the game world.
 * This is called from main.js after leagues are generated or game is loaded.
 * @param {Array<object>} clubs - The array of ALL club objects.
 */
export function setAllOpponentClubs(clubs) {
    allClubsInGameWorld = clubs;
    console.log("All clubs in game world set in opponentData:", allClubsInGameWorld.length, allClubsInGameWorld.map(c => c.name));
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
