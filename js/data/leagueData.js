// js/data/leagueData.js

/**
 * Manages the game's league structure, including league creation,
 * fixture generation, and maintaining league tables.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';
import * as opponentData from './opponentData.js';
import * as Main from '../main.js'; // Import Main for gameState access

/**
 * Generates the initial league structure for a new game.
 * This includes the player's primary league and populates it with clubs.
 * @param {object} playerCountyData - The county data object for the player's chosen location.
 * @param {string} playerClubId - The ID of the player's club.
 * @param {string} playerClubName - The name of the player's club.
 * @returns {object} An object containing { leagues: Array<object>, clubs: Array<object> }
 * where 'leagues' contains the league structural data and 'clubs' contains
 * all clubs within those leagues (including player's and opponents).
 */
export function generateInitialLeagues(playerCountyData, playerClubId, playerClubName) {
    // Pass the county data object to generateInitialLeagueName
    const initialLeague = dataGenerator.generateInitialLeagueName(playerCountyData);
    initialLeague.id = dataGenerator.generateUniqueId('L'); // Ensure league has a unique ID
    initialLeague.level = 1;
    initialLeague.numTeams = Constants.DEFAULT_LEAGUE_SIZE;
    initialLeague.promotedTeams = 1;
    initialLeague.relegatedTeams = 1;
    initialLeague.currentSeasonFixtures = [];

    const playerClubTemplate = { // Create a template for playerClub with initial leagueStats
        id: playerClubId,
        name: playerClubName,
        location: playerCountyData.towns[0] || playerCountyData.county, // Use a town from the county or the county name itself
        nickname: null, // These will be filled from actual playerClub object passed by main.js
        kitColors: null,
        overallTeamQuality: null, // This is player's quality, managed by playerData based on squad
        currentLeagueId: initialLeague.id,
        finalLeaguePosition: null,
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
    };

    // Pass the county data object to initializeOpponentClubs
    const initialOpponents = opponentData.initializeOpponentClubs(playerCountyData);

    // Combine player club and opponent clubs for the league
    // Initialize leagueStats for all clubs if not already present
    const allLeagueClubsData = [playerClubTemplate, ...initialOpponents].map(club => ({
        ...club,
        currentLeagueId: initialLeague.id,
        // Ensure leagueStats are always initialized
        leagueStats: club.leagueStats || { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
    }));

    // Generate league fixtures using the new algorithm
    initialLeague.currentSeasonFixtures = dataGenerator.generateMatchSchedule(
        playerClubId,
        allLeagueClubsData,
        1, // Season 1
        Constants.COMPETITION_TYPE.LEAGUE // Specify competition type
    );

    initialLeague.clubs = allLeagueClubsData.map(c => c.id); // Store only IDs
    initialLeague.allClubsData = allLeagueClubsData; // Store full data for internal league use

    console.log("Initial league structure generated:", initialLeague);
    return { leagues: [initialLeague], clubs: allLeagueClubsData }; // Return array of leagues and all clubs
}

/**
 * Generates cup fixtures for a given round.
 * @param {string} competitionId - The ID of the cup competition.
 * @param {Array<object>} teamsInCupPool - The pool of all possible teams that could be in the cup (including player's team, league teams, and other regional teams).
 * @param {number} season - Current season number.
 * @param {number} week - The week number for these matches.
 * @returns {Array<object>} An array of match objects for the cup round.
 */
export function generateCupFixtures(competitionId, teamsInCupPool, season, week) {
    const cupMatches = [];
    let availableTeamsForDraw = [...teamsInCupPool.filter(team => team.inCup !== false && team.id !== 'BYE')];
    const playerClubId = Main.gameState.playerClub.id;

    // Ensure player's team is in the draw if they are 'Active'
    if (Main.gameState.countyCup.playerTeamStatus === 'Active' && !availableTeamsForDraw.some(t => t.id === playerClubId)) {
        availableTeamsForDraw.push(Main.gameState.playerClub);
    }

    // Add some random new teams from the region that are not already in the league or cup draw
    const currentLeagueClubIds = Main.gameState.leagues[0].allClubsData.map(c => c.id);
    const existingCupTeamIds = availableTeamsForDraw.map(t => t.id);
    
    // Generate a few new, potentially stronger, regional teams for the cup draw
    // Ensure enough teams for a draw, aim for at least 16 teams for a decent draw if possible
    const targetTeamsForDraw = 16; // Or 32, 64 depending on desired cup size
    const numNewTeamsToAdd = Math.max(0, targetTeamsForDraw - availableTeamsForDraw.length); 
    
    for (let i = 0; i < numNewTeamsToAdd; i++) {
        const newTeamQuality = dataGenerator.getRandomInt(8, 15); // Can be higher quality
        const newOpponent = opponentData.generateSingleOpponentClub(Main.gameState.playerCountyData, newTeamQuality);
        // Ensure new opponent is not already in the league or cup pool
        if (newOpponent && !currentLeagueClubIds.includes(newOpponent.id) && !existingCupTeamIds.includes(newOpponent.id) && !availableTeamsForDraw.some(t => t.id === newOpponent.id)) {
            newOpponent.inCup = true;
            newOpponent.eliminatedFromCup = false;
            availableTeamsForDraw.push(newOpponent);
            // Crucial: Add this newly generated opponent to the global opponentData list
            // This ensures it's available via getOpponentClub later.
            opponentData.setAllOpponentClubs([...opponentData.getAllOpponentClubs(null), newOpponent]);
        }
    }
    
    // Shuffle teams to ensure random draw
    for (let i = availableTeamsForDraw.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTeamsForDraw[i], availableTeamsForDraw[j]] = [availableTeamsForDraw[j], availableTeamsForDraw[i]];
    }

    // Handle BYEs if odd number of teams
    if (availableTeamsForDraw.length % 2 !== 0) {
        const playerTeamIndex = availableTeamsForDraw.findIndex(t => t.id === playerClubId);
        if (playerTeamIndex !== -1) {
            // Player gets a bye
            cupMatches.push({
                id: dataGenerator.generateUniqueId('M'),
                week: week,
                season: season,
                homeTeamId: playerClubId,
                homeTeamName: Main.gameState.playerClub.name,
                awayTeamId: 'BYE',
                awayTeamName: 'BYE',
                competition: Constants.COMPETITION_TYPE.COUNTY_CUP,
                result: 'BYE',
                played: true
            });
            availableTeamsForDraw.splice(playerTeamIndex, 1);
            // Main.gameState.countyCup.playerTeamStatus is updated in gameLoop.handleCountyCupAnnouncement
        } else {
            // A random AI team gets a bye
            const byeTeam = getRandomElement(availableTeamsForDraw);
            cupMatches.push({
                id: dataGenerator.generateUniqueId('M'),
                week: week,
                season: season,
                homeTeamId: byeTeam.id,
                homeTeamName: byeTeam.name,
                awayTeamId: 'BYE',
                awayTeamName: 'BYE',
                competition: Constants.COMPETITION_TYPE.COUNTY_CUP,
                result: 'BYE',
                played: true
            });
            availableTeamsForDraw = availableTeamsForDraw.filter(team => team.id !== byeTeam.id);
        }
    }

    // Pair remaining teams for matches
    for (let i = 0; i < availableTeamsForDraw.length; i += 2) {
        const homeTeam = availableTeamsForDraw[i];
        const awayTeam = availableTeamsForDraw[i + 1];

        let opponentClubFromOutsideLeague = null;
        // Check if either team is the player's team and the opponent is NOT in the player's primary league
        const isHomePlayer = homeTeam.id === playerClubId;
        const isAwayPlayer = awayTeam.id === playerClubId;
        const currentLeagueClubIdsMap = new Set(Main.gameState.leagues[0].allClubsData.map(c => c.id)); // Use a Set for faster lookup
        
        const isOpponentFromOutsideLeague = (isHomePlayer && !currentLeagueClubIdsMap.has(awayTeam.id)) ||
                                           (isAwayPlayer && !currentLeagueClubIdsMap.has(homeTeam.id));
        
        if (isOpponentFromOutsideLeague) {
            const externalOpponent = isHomePlayer ? awayTeam : homeTeam;
            // Ensure we get the full club object from opponentData.allClubsInGameWorld
            // If it's a newly generated team, it might not be in allClubsInGameWorld yet,
            // so we use the externalOpponent object directly.
            opponentClubFromOutsideLeague = opponentData.getOpponentClub(externalOpponent.id) || externalOpponent;

            // --- FIX START: Add this external opponent to allClubsInGameWorld if not already present ---
            const currentGlobalClubs = opponentData.getAllOpponentClubs(null);
            if (!currentGlobalClubs.some(c => c.id === opponentClubFromOutsideLeague.id)) {
                opponentData.setAllOpponentClubs([...currentGlobalClubs, opponentClubFromOutsideLeague]);
            }
            // --- FIX END ---
        }
        
        cupMatches.push({
            id: dataGenerator.generateUniqueId('M'),
            week: week,
            season: season,
            homeTeamId: homeTeam.id,
            homeTeamName: homeTeam.name,
            awayTeamId: awayTeam.id,
            awayTeamName: awayTeam.name,
            competition: Constants.COMPETITION_TYPE.COUNTY_CUP,
            result: null,
            played: false,
            opponentClubFromOutsideLeague: opponentClubFromOutsideLeague // Store for potential customization
        });
    }
    console.log(`Generated ${cupMatches.length} cup matches for week ${week}.`);
    return cupMatches;
}


/**
 * Retrieves the current league table for a given league ID.
 * Assumes the league object is available in gameState.leagues.
 * @param {string} leagueId - The ID of the league.
 * @param {Array<object>} allClubsInLeague - The comprehensive list of all clubs (player and opponents) for this league.
 * @returns {Array<object>} An array of club objects sorted by points for the league table.
 */
export function getLeagueTable(leagueId, allClubsInLeague) {
    if (!allClubsInLeague || allClubsInLeague.length === 0) {
        console.warn(`No clubs provided for league table for league ${leagueId}.`);
        return [];
    }

    // Filter and sort by points, then goal difference, then goals for
    // Ensure leagueStats exist before attempting to access
    const clubsWithStats = allClubsInLeague.filter(club => club.leagueStats);

    clubsWithStats.sort((a, b) => {
        if (b.leagueStats.points !== a.leagueStats.points) {
            return b.leagueStats.points - a.leagueStats.points;
        }
        if (b.leagueStats.goalDifference !== a.leagueStats.goalDifference) {
            return b.leagueStats.goalDifference - a.leagueStats.goalDifference;
        }
        return b.leagueStats.goalsFor - a.leagueStats.goalsFor;
    });

    return clubsWithStats.map(club => ({
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
    const updatedLeagues = JSON.parse(JSON.stringify(currentLeagues));
    const leagueIndex = updatedLeagues.findIndex(l => l.id === leagueId);

    if (leagueIndex === -1) {
        console.error(`League ${leagueId} not found for table update.`);
        return currentLeagues;
    }

    const leagueToUpdate = updatedLeagues[leagueIndex];
    const clubsData = leagueToUpdate.allClubsData;

    const homeClub = clubsData.find(c => c.id === homeClubId);
    const awayClub = clubsData.find(c => c.id === awayClubId);

    if (!homeClub || !awayClub) {
        console.error(`One or both clubs not found in league ${leagueId} for table update.`);
        return currentLeagues;
    }

    let homeWon = 0, homeDrawn = 0, homeLost = 0;
    let awayWon = 0, awayDrawn = 0, awayLost = 0;

    if (homeScore > awayScore) {
        homeWon = 1; awayLost = 1;
    } else if (homeScore < awayScore) {
        homeLost = 1; awayWon = 1;
    } else {
        homeDrawn = 1; awayDrawn = 1;
    }

    // Ensure leagueStats are initialized
    if (!homeClub.leagueStats) homeClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    if (!awayClub.leagueStats) awayClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };


    homeClub.leagueStats.played++; homeClub.leagueStats.won += homeWon; homeClub.leagueStats.drawn += homeDrawn;
    homeClub.leagueStats.lost += homeLost; homeClub.leagueStats.goalsFor += homeScore;
    homeClub.leagueStats.goalsAgainst += awayScore;
    homeClub.leagueStats.goalDifference = homeClub.leagueStats.goalsFor - homeClub.leagueStats.goalsAgainst;
    homeClub.leagueStats.points += (homeWon * 3) + (homeDrawn * 1);

    awayClub.leagueStats.played++; awayClub.leagueStats.won += awayWon; awayClub.leagueStats.drawn += awayDrawn;
    awayClub.leagueStats.lost += awayLost; awayClub.leagueStats.goalsFor += awayScore;
    awayClub.leagueStats.goalsAgainst += homeScore;
    awayClub.leagueStats.goalDifference = awayClub.leagueStats.goalsFor - awayClub.leagueStats.goalsAgainst;
    awayClub.leagueStats.points += (awayWon * 3) + (awayDrawn * 1);

    return updatedLeagues;
}


/**
 * Retrieves the current season's match schedule for a specific league.
 * Returns the schedule grouped by week as generated by dataGenerator.
 * @param {Array<object>} currentLeagues - The current array of league objects (from gameState.leagues).
 * @param {string} leagueId - The ID of the league.
 * @returns {Array<object>} An array of match week objects, each containing an array of matches.
 */
export function getFixtures(currentLeagues, leagueId) {
    const league = currentLeagues.find(l => l.id === leagueId);
    if (league && league.currentSeasonFixtures) {
        // currentSeasonFixtures is already structured as Array<{week: number, matches: Array<object>}>
        return [...league.currentSeasonFixtures];
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
        // Find the match within its week's array of matches
        let matchFound = false;
        for (const weekBlock of league.currentSeasonFixtures) {
            const matchIndex = weekBlock.matches.findIndex(m => m.id === matchId);
            if (matchIndex !== -1) {
                weekBlock.matches[matchIndex].result = resultString;
                weekBlock.matches[matchIndex].played = true;
                matchFound = true;
                console.log(`Match ${matchId} updated with result: ${resultString}`);
                break;
            }
        }
        if (!matchFound) {
            console.warn(`Match ${matchId} not found in league ${leagueId}'s fixtures.`);
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
        // Filter clubs belonging to this league and ensure leagueStats exist
        const clubsInThisLeague = allClubsInGame.filter(club => club.currentLeagueId === league.id && club.leagueStats);

        const sortedTable = getLeagueTable(league.id, clubsInThisLeague);

        // Assign final positions to the clubs in the actual allClubsInGame array (passed by reference)
        sortedTable.forEach((clubInTable, index) => {
            const originalClub = allClubsInGame.find(c => c.id === clubInTable.id);
            if (originalClub) {
                originalClub.finalLeaguePosition = index + 1;
            }
        });

        console.log(`End of season processed for league: ${league.name}`);
    });

    return updatedLeagues;
}
