// js/data/leagueData.js

/**
 * Manages the game's league structure, including league creation,
 * fixture generation, and maintaining league tables.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';
import * as opponentData from './opponentData.js'; // To get opponent club structural data

// --- Internal League State ---
// This module will hold the current league structure.
// This will be directly managed by Main.gameState.leagues, and this module provides helper functions.

/**
 * Generates the initial league structure for a new game.
 * This includes the player's primary league and populates it with clubs.
 * @param {string} playerClubLocation - The player's chosen hometown.
 * @param {string} playerClubId - The ID of the player's club.
 * @param {string} playerClubName - The name of the player's club.
 * @returns {object} An object containing { leagues: Array<object>, clubs: Array<object> }
 * where 'leagues' contains the league structural data and 'clubs' contains
 * all clubs within those leagues (including player's and opponents).
 */
export function generateInitialLeagues(playerClubLocation, playerClubId, playerClubName) {
    const initialLeague = dataGenerator.generateInitialLeagueName(playerClubLocation);
    initialLeague.level = 1; // Lowest tier (e.g., "Step 8" in the unofficial pyramid)
    initialLeague.numTeams = Constants.DEFAULT_LEAGUE_SIZE;
    initialLeague.promotedTeams = 1; // Example: 1 team promoted
    initialLeague.relegatedTeams = 1; // Example: 1 team relegated
    initialLeague.currentSeasonFixtures = []; // Placeholder for fixtures

    const playerClub = {
        id: playerClubId,
        name: playerClubName, // Use the provided name for player club
        location: playerClubLocation,
        nickname: null, // Nickname already in playerClub object
        kitColors: null, // Kit colors already in playerClub object
        overallTeamQuality: null, // Quality determined by actual player attributes, not fixed here
        currentLeagueId: initialLeague.id,
        finalLeaguePosition: null,
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
    };

    const initialOpponents = opponentData.initializeOpponentClubs(playerClubLocation, playerClubId);

    // Combine player club and opponent clubs for the league
    // Add default leagueStats for all clubs
    const allLeagueClubs = [playerClub, ...initialOpponents].map(club => ({
        ...club,
        currentLeagueId: initialLeague.id,
        leagueStats: {
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0
        }
    }));
    initialLeague.clubs = allLeagueClubs.map(c => c.id); // Store only IDs in league for efficiency
    initialLeague.allClubsData = allLeagueClubs; // Store full data for local access within leagueData

    // Generate fixtures for the first season
    initialLeague.currentSeasonFixtures = dataGenerator.generateMatchSchedule(playerClubId, allLeagueClubs, 1); // Season 1

    console.log("Initial league structure generated:", initialLeague);
    return { leagues: [initialLeague], clubs: allLeagueClubs }; // Return array of leagues and all clubs
}

/**
 * Retrieves the current league table for a given league ID.
 * Assumes the league object is available in gameState.leagues.
 * @param {string} leagueId - The ID of the league.
 * @param {Array<object>} allClubsInGame - The comprehensive list of all clubs (player and opponents) from gameState.
 * @returns {Array<object>} An array of club objects sorted by points for the league table.
 */
export function getLeagueTable(leagueId, allClubsInGame) {
    const league = allClubsInGame.find(l => l.id === leagueId); // Find the actual league object
    if (!league) {
        console.error(`League with ID ${leagueId} not found.`);
        return [];
    }

    // Filter clubs belonging to this league and ensure leagueStats exist
    const clubsInLeague = allClubsInGame.filter(club => club.currentLeagueId === leagueId && club.leagueStats);

    // Sort by points, then goal difference, then goals for
    clubsInLeague.sort((a, b) => {
        if (b.leagueStats.points !== a.leagueStats.points) {
            return b.leagueStats.points - a.leagueStats.points;
        }
        if (b.leagueStats.goalDifference !== a.leagueStats.goalDifference) {
            return b.leagueStats.goalDifference - a.leagueStats.goalDifference;
        }
        return b.leagueStats.goalsFor - a.leagueStats.goalsFor;
    });

    return clubsInLeague.map(club => ({
        id: club.id,
        name: club.name,
        played: club.leagueStats.played,
        won: club.leagueStats.won,
        drawn: club.leagueStats.drawn,
        lost: club.leagueStats.lost,
        goalsFor: club.leagueStats.goalsFor,
        goalsAgainst: club.leagueStats.goalsAgainst,
        goalDifference: club.leagueStats.goalDifference,
        points: club.leagueStats.points
    }));
}


/**
 * Updates the league table for a specific league after a match.
 * This function modifies the 'allClubsData' property within the league object.
 * Returns a *new* leagues array to be assigned back to gameState.
 * @param {Array<object>} currentLeagues - The current array of league objects (from gameState.leagues).
 * @param {string} leagueId - The ID of the league where the match was played.
 * @param {string} homeClubId - The ID of the home club.
 * @param {string} awayClubId - The ID of the away club.
 * @param {number} homeScore - Home team's score.
 * @param {number} awayScore - Away team's score.
 * @returns {Array<object>} A new array of league objects with updated standings.
 */
export function updateLeagueTable(currentLeagues, leagueId, homeClubId, awayClubId, homeScore, awayScore) {
    const updatedLeagues = JSON.parse(JSON.stringify(currentLeagues)); // Deep copy to ensure immutability
    const leagueIndex = updatedLeagues.findIndex(l => l.id === leagueId);

    if (leagueIndex === -1) {
        console.error(`League ${leagueId} not found for table update.`);
        return currentLeagues; // Return original if not found
    }

    const leagueToUpdate = updatedLeagues[leagueIndex];
    const clubsData = leagueToUpdate.allClubsData; // Get mutable clubs data for this league

    const homeClub = clubsData.find(c => c.id === homeClubId);
    const awayClub = clubsData.find(c => c.id === awayClubId);

    if (!homeClub || !awayClub) {
        console.error(`One or both clubs not found in league ${leagueId} for table update.`);
        return currentLeagues;
    }

    let homeWon = 0, homeDrawn = 0, homeLost = 0;
    let awayWon = 0, awayDrawn = 0, awayLost = 0;

    if (homeScore > awayScore) {
        homeWon = 1;
        awayLost = 1;
    } else if (homeScore < awayScore) {
        homeLost = 1;
        awayWon = 1;
    } else {
        homeDrawn = 1;
        awayDrawn = 1;
    }

    // Update home club's stats
    homeClub.leagueStats.played++;
    homeClub.leagueStats.won += homeWon;
    homeClub.leagueStats.drawn += homeDrawn;
    homeClub.leagueStats.lost += homeLost;
    homeClub.leagueStats.goalsFor += homeScore;
    homeClub.leagueStats.goalsAgainst += awayScore;
    homeClub.leagueStats.goalDifference = homeClub.leagueStats.goalsFor - homeClub.leagueStats.goalsAgainst;
    homeClub.leagueStats.points += (homeWon * 3) + (homeDrawn * 1);

    // Update away club's stats
    awayClub.leagueStats.played++;
    awayClub.leagueStats.won += awayWon;
    awayClub.leagueStats.drawn += awayDrawn;
    awayClub.leagueStats.lost += awayLost;
    awayClub.leagueStats.goalsFor += awayScore;
    awayClub.leagueStats.goalsAgainst += homeScore;
    awayClub.leagueStats.goalDifference = awayClub.leagueStats.goalsFor - awayClub.leagueStats.goalsAgainst;
    awayClub.leagueStats.points += (awayWon * 3) + (awayDrawn * 1);

    // No need to explicitly re-sort here, as getLeagueTable will sort when called for display.
    // The clubs array within allClubsData is mutable in this deep copy.

    return updatedLeagues; // Return the updated deep copy
}


/**
 * Retrieves the current season's match schedule for a specific league.
 * @param {Array<object>} currentLeagues - The current array of league objects (from gameState.leagues).
 * @param {string} leagueId - The ID of the league.
 * @returns {Array<object>} An array of match objects.
 */
export function getFixtures(currentLeagues, leagueId) {
    const league = currentLeagues.find(l => l.id === leagueId);
    if (league && league.currentSeasonFixtures) {
        return [...league.currentSeasonFixtures]; // Return a copy
    }
    console.warn(`Fixtures not found for league ${leagueId}.`);
    return [];
}


/**
 * Marks a specific match as played and updates its result.
 * Returns a new leagues array.
 * @param {Array<object>} currentLeagues - The current array of league objects.
 * @param {string} leagueId - The ID of the league the match belongs to.
 * @param {string} matchId - The ID of the match to update.
 * @param {string} resultString - The result string (e.g., "2-1").
 * @returns {Array<object>} A new array of league objects with the updated match.
 */
export function updateMatchResult(currentLeagues, leagueId, matchId, resultString) {
    const updatedLeagues = JSON.parse(JSON.stringify(currentLeagues));
    const league = updatedLeagues.find(l => l.id === leagueId);

    if (league) {
        const match = league.currentSeasonFixtures.find(m => m.id === matchId);
        if (match) {
            match.result = resultString;
            match.played = true;
            console.log(`Match ${matchId} updated with result: ${resultString}`);
        } else {
            console.warn(`Match ${matchId} not found in league ${leagueId}.`);
        }
    } else {
        console.warn(`League ${leagueId} not found for match update.`);
    }
    return updatedLeagues;
}

/**
 * Performs end-of-season calculations for a league (e.g., promotions, relegations).
 * Updates final positions for clubs.
 * Returns a new array of league objects.
 * @param {Array<object>} currentLeagues - The current array of league objects.
 * @param {Array<object>} allClubsInGame - The comprehensive list of all clubs (player and opponents) from gameState.
 * @returns {Array<object>} A new array of league objects with end-of-season updates.
 */
export function processEndOfSeason(currentLeagues, allClubsInGame) {
    const updatedLeagues = JSON.parse(JSON.stringify(currentLeagues));

    updatedLeagues.forEach(league => {
        // Get the sorted league table for this league
        const sortedTable = getLeagueTable(league.id, allClubsInGame);

        // Assign final positions
        sortedTable.forEach((club, index) => {
            const originalClub = allClubsInGame.find(c => c.id === club.id);
            if (originalClub) {
                originalClub.finalLeaguePosition = index + 1; // Update final position on the persistent club object
            }
        });

        // Determine promotions and relegations (simplified)
        // This will need more complex logic when multiple leagues/levels are introduced.
        // For now, assume top N promoted, bottom N relegated within this single league context.
        // This logic will be more robust when the full league pyramid is built.

        console.log(`End of season processed for league: ${league.name}`);
    });

    return updatedLeagues;
}

// NOTE: This module does NOT manage the global `gameState`.
// Its functions return updated arrays/objects that `main.js` will assign to `gameState.leagues`.

