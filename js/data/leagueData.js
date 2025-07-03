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
 * Generates the initial tiered league structure for a new game.
 * Distributes all clubs (AI + Player) into their starting leagues based on seed quality.
 * @param {object} playerCountyData - The county data object for the player's chosen location.
 * @param {Array<object>} allClubsInRegionalPool - The array of all 60 club objects (AI + Player) with initialSeedQuality.
 * @returns {object} An object containing { leagues: Array<object>, clubs: Array<object> }
 * where 'leagues' contains the league structural data and 'clubs' contains
 * all clubs within those leagues (including player's and opponents).
 */
export function generateInitialLeagues(playerCountyData, allClubsInRegionalPool) {
    const leagues = [];
    const countyName = dataGenerator.getCountyNameForLeagues(playerCountyData);

    // Sort all clubs by their initialSeedQuality (1 is best, 60 is worst)
    const sortedClubs = [...allClubsInRegionalPool].sort((a, b) => a.initialSeedQuality - b.initialSeedQuality);

    // Create league objects and distribute clubs
    for (const tierKey in Constants.LEAGUE_TIERS) {
        const tierConfig = Constants.LEAGUE_TIERS[tierKey];
        const leagueId = dataGenerator.generateUniqueId('L');
        const leagueName = `${countyName} ${tierConfig.nameSuffix}`;

        const newLeague = {
            id: leagueId,
            name: leagueName,
            level: tierConfig.level,
            numTeams: tierConfig.numTeams,
            promotedTeams: tierConfig.promotedTeams,
            relegatedTeams: tierConfig.relegatedTeams,
            currentSeasonFixtures: [],
            clubs: [], // Will store club IDs
            allClubsData: [] // Will store full club objects for this league
        };

        // Distribute clubs based on seed range
        const clubsForThisLeague = sortedClubs.filter(club =>
            club.initialSeedQuality >= tierConfig.seedRange.min &&
            club.initialSeedQuality <= tierConfig.seedRange.max
        );

        // Assign clubs to this league and update their currentLeagueId
        clubsForThisLeague.forEach(club => {
            club.currentLeagueId = newLeague.id;
            club.potentialLeagueLevel = newLeague.level; // Set potential league level
            newLeague.clubs.push(club.id);
            newLeague.allClubsData.push(club);
        });

        // Generate fixtures for this league
        newLeague.currentSeasonFixtures = dataGenerator.generateMatchSchedule(
            Main.gameState.playerClub.id, // Pass player club ID for fixture generation
            newLeague.allClubsData,
            1, // Season 1
            Constants.COMPETITION_TYPE.LEAGUE
        );

        leagues.push(newLeague);
    }

    console.log("Initial tiered league structure generated:", leagues);
    // Return all leagues and the modified (with currentLeagueId) full list of clubs
    return { leagues: leagues, clubs: sortedClubs };
}

/**
 * Generates cup fixtures for a given round.
 * @param {string} competitionId - The ID of the cup competition.
 * @param {Array<object>} teamsInCupPool - The pool of all possible teams that could be in the cup (including player's team, league teams, and other regional teams).
 * @param {number} season - Current season number.
 * @param {number} week - The week number for these matches (absolute game week).
 * @returns {Array<object>} An array of match objects for the cup round.
 */
export function generateCupFixtures(competitionId, teamsInCupPool, season, week) {
    const cupMatches = [];
    // Start with teams that are currently in the cup (not eliminated)
    let availableTeamsForDraw = [...teamsInCupPool.filter(team => team.inCup === true && team.eliminatedFromCup === false && team.id !== 'BYE')];
    const playerClubId = Main.gameState.playerClub.id;

    // Ensure player's team is in the draw if they are 'Active' and not already in the list
    if (Main.gameState.countyCup.playerTeamStatus === 'Active' && !availableTeamsForDraw.some(t => t.id === playerClubId)) {
        availableTeamsForDraw.push(Main.gameState.playerClub);
    }

    // Filter out league teams for potential external opponents
    // Now, league teams are any team in Main.gameState.leagues[X].allClubsData
    const allLeagueClubIds = new Set();
    Main.gameState.leagues.forEach(league => {
        league.allClubsData.forEach(club => allLeagueClubIds.add(club.id));
    });
    
    let externalTeamsInPool = availableTeamsForDraw.filter(team => !allLeagueClubIds.has(team.id));
    let leagueTeamsInPool = availableTeamsForDraw.filter(team => allLeagueClubIds.has(team.id));


    // Determine the target number of teams for a full draw (next power of 2)
    let currentPoolSize = availableTeamsForDraw.length;
    let targetDrawSize = 2;
    while (targetDrawSize < currentPoolSize) {
        targetDrawSize *= 2;
    }
    if (currentPoolSize === 0) targetDrawSize = 0; // No teams, no draw
    else if (currentPoolSize === 1) targetDrawSize = 2; // If only one team, need one more for a match

    // --- FIX START: Adjust numTeamsToGenerate for Round 1 to ensure ~24 teams ---
    const isRoundOne = Constants.COUNTY_CUP_MATCH_WEEKS.indexOf(week) === 0;
    let numTeamsToGenerate = targetDrawSize - currentPoolSize;

    if (isRoundOne) {
        const desiredTotalTeams = 24; // 12 league teams + 12 new
        const currentLeagueTeamsCount = leagueTeamsInPool.length;
        const currentExternalTeamsCount = externalTeamsInPool.length;
        
        // Calculate how many *new* external teams are needed to reach desiredTotalTeams
        // This is (desiredTotalTeams - currentLeagueTeamsCount - currentExternalTeamsCount)
        numTeamsToGenerate = Math.max(0, desiredTotalTeams - currentLeagueTeamsCount - currentExternalTeamsCount);

        // Ensure targetDrawSize is at least desiredTotalTeams if it's Round 1
        targetDrawSize = Math.max(targetDrawSize, desiredTotalTeams);
    }
    // --- FIX END ---

    let playerOpponent = null;
    let newlyGeneratedTeams = [];

    // Prioritize generating a new external opponent for the player's match if it's Round 1
    // and if there aren't enough external teams already in the pool.
    if (isRoundOne && externalTeamsInPool.length === 0 && numTeamsToGenerate > 0) {
        playerOpponent = opponentData.generateSingleOpponentClub(Main.gameState.playerCountyData, dataGenerator.getRandomInt(10, 20)); // High quality for initial cup opponent
        playerOpponent.inCup = true;
        playerOpponent.eliminatedFromCup = false;
        newlyGeneratedTeams.push(playerOpponent);
        // Add to global list immediately
        opponentData.setAllOpponentClubs([...opponentData.getAllOpponentClubs(null), playerOpponent]);
        Main.gameState.countyCup.teams.push(playerOpponent); // Add to persistent cup teams
        externalTeamsInPool.push(playerOpponent); // Add to current external pool for draw
        numTeamsToGenerate--; // Decrement as one team is generated
    }

    // Generate remaining new teams if needed to reach targetDrawSize
    for (let i = 0; i < numTeamsToGenerate; i++) { // Loop based on adjusted numTeamsToGenerate
        const newTeamQuality = dataGenerator.getRandomInt(8, 18);
        const newOpponent = opponentData.generateSingleOpponentClub(Main.gameState.playerCountyData, newTeamQuality);
        
        const isAlreadyInAnyPool = availableTeamsForDraw.some(team => team.id === newOpponent.id) || newlyGeneratedTeams.some(team => team.id === newOpponent.id);

        if (newOpponent && !isAlreadyInAnyPool) {
            newOpponent.inCup = true;
            newOpponent.eliminatedFromCup = false;
            newlyGeneratedTeams.push(newOpponent);
            opponentData.setAllOpponentClubs([...opponentData.getAllOpponentClubs(null), newOpponent]);
            Main.gameState.countyCup.teams.push(newOpponent);
            externalTeamsInPool.push(newOpponent); // Add to current external pool for draw
        }
    }

    // Reconstruct availableTeamsForDraw with newly generated teams
    availableTeamsForDraw = [...leagueTeamsInPool, ...externalTeamsInPool];

    // Shuffle teams to ensure random draw
    for (let i = availableTeamsForDraw.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTeamsForDraw[i], availableTeamsForDraw[j]] = [availableTeamsForDraw[j], availableTeamsForDraw[i]];
    }

    // --- FIX: Logic to ensure player always has a match (no BYE) ---
    // If after generating teams, the count is still odd, we need to add one more to avoid BYE for player
    if (availableTeamsForDraw.length % 2 !== 0 && availableTeamsForDraw.length > 0) {
        const newOpponent = opponentData.generateSingleOpponentClub(Main.gameState.playerCountyData, dataGenerator.getRandomInt(8, 18));
        newOpponent.inCup = true;
        newOpponent.eliminatedFromCup = false;
        availableTeamsForDraw.push(newOpponent);
        opponentData.setAllOpponentClubs([...opponentData.getAllOpponentClubs(null), newOpponent]);
        Main.gameState.countyCup.teams.push(newOpponent);
        console.log("DEBUG: Added extra team to make cup draw even and avoid BYE.");
    }
    // --- END FIX: No BYE ---


    // Pair remaining teams for matches
    for (let i = 0; i < availableTeamsForDraw.length; i += 2) {
        let homeTeam = availableTeamsForDraw[i];
        let awayTeam = availableTeamsForDraw[i + 1];

        let opponentClubFromOutsideLeague = undefined; // Default to undefined

        const isHomePlayer = homeTeam.id === playerClubId;
        const isAwayPlayer = awayTeam.id === playerClubId;
        // Check against all league club IDs, not just the first league
        const currentLeagueClubIdsMap = allLeagueClubIds;

        // --- FIX: Ensure player always draws an external team in Round 1 if possible ---
        if (isRoundOne && (isHomePlayer || isAwayPlayer)) {
            const playerTeam = isHomePlayer ? homeTeam : awayTeam;
            const currentOpponent = isHomePlayer ? awayTeam : homeTeam;

            // If the current opponent is a league team, try to swap it with an external one
            if (currentLeagueClubIdsMap.has(currentOpponent.id)) {
                const availableExternalTeams = externalTeamsInPool.filter(t => t.id !== playerOpponent?.id && t.id !== currentOpponent.id);
                if (availableExternalTeams.length > 0) {
                    const newExternalOpponent = dataGenerator.getRandomElement(availableExternalTeams);
                    
                    // Swap: newExternalOpponent takes currentOpponent's place
                    if (isHomePlayer) {
                        awayTeam = newExternalOpponent;
                    } else {
                        homeTeam = newExternalOpponent;
                    }
                    // Remove newExternalOpponent from externalTeamsInPool to prevent duplicate assignment
                    externalTeamsInPool = externalTeamsInPool.filter(t => t.id !== newExternalOpponent.id);
                    opponentClubFromOutsideLeague = newExternalOpponent; // This is the external opponent
                    console.log(`DEBUG: Player's Round 1 opponent swapped to external team: ${newExternalOpponent.name}`);
                } else {
                    // Fallback: If no external teams are left, player might still face a league team, but this is less likely now.
                    console.warn("WARNING: Could not find an external opponent for player's Round 1 match. Player might face a league team.");
                    opponentClubFromOutsideLeague = undefined; // Not an external opponent in this case
                }
            } else {
                // Opponent is already external (e.g., newly generated or from a prior round)
                opponentClubFromOutsideLeague = currentOpponent;
            }
        } else if ((isHomePlayer && !currentLeagueClubIdsMap.has(awayTeam.id)) || (isAwayPlayer && !currentLeagueClubIdsMap.has(homeTeam.id))) {
            // For later rounds, if player draws an external team, mark it
            const externalOpponentCandidate = isHomePlayer ? awayTeam : homeTeam;
            opponentClubFromOutsideLeague = opponentData.getOpponentClub(externalOpponentCandidate.id);
            if (!opponentClubFromOutsideLeague) {
                console.warn(`WARNING: External opponent ${externalOpponentCandidate.id} not found in global list. Using direct object.`);
                opponentClubFromOutsideLeague = externalOpponentCandidate;
            }
        }
        // --- END FIX: Player always draws external team ---


        cupMatches.push({
            id: dataGenerator.generateUniqueId('M'),
            week: week, // This is the absolute game week (e.g., 12 for August Week 4)
            season: season,
            homeTeamId: homeTeam.id,
            homeTeamName: homeTeam.name,
            awayTeamId: awayTeam.id,
            awayTeamName: awayTeam.name,
            competition: Constants.COMPETITION_TYPE.COUNTY_CUP,
            result: null,
            played: false,
            // Only attach opponentClubFromOutsideLeague if it's actually an external opponent
            // This ensures the customization modal condition in gameLoop.js works.
            opponentClubFromOutsideLeague: opponentClubFromOutsideLeague // Will be undefined if not external
        });
    }
    console.log(`Generated ${cupMatches.length} cup matches for week ${week}.`);
    return cupMatches;
}


/**
 * Reschedules a player's league match from its original week to a new week.
 * This is used when a cup match takes precedence.
 * @param {Array<object>} currentLeagues - The current array of league objects (from gameState.leagues).
 * @param {string} homeClubId - The ID of the home club in the match.
 * @param {string} awayClubId - The ID of the away club in the match.
 * @param {number} originalAbsoluteGameWeek - The original absolute game week number of the match to reschedule.
 * @param {number} newAbsoluteGameWeek - The new absolute game week number to move the match to.
 * @returns {Array<object>|null} A new array of league objects with the match rescheduled, or null if not found.
 */
export function rescheduleLeagueMatch(currentLeagues, homeClubId, awayClubId, originalAbsoluteGameWeek, newAbsoluteGameWeek) {
    const updatedLeagues = JSON.parse(JSON.stringify(currentLeagues));
    const league = updatedLeagues.find(l => l.allClubsData.some(c => c.id === homeClubId || c.id === awayClubId)); // Find league by club participation

    if (!league || !league.currentSeasonFixtures) {
        console.warn("Cannot reschedule: League or fixtures not found for clubs:", homeClubId, awayClubId);
        return null;
    }

    let matchToReschedule = null;
    let originalWeekBlock = null;
    let originalMatchIndex = -1;

    // Find the match in the original week block
    originalWeekBlock = league.currentSeasonFixtures.find(wb => wb.week === originalAbsoluteGameWeek && wb.competition === Constants.COMPETITION_TYPE.LEAGUE);

    if (originalWeekBlock) {
        originalMatchIndex = originalWeekBlock.matches.findIndex(m => 
            (m.homeTeamId === homeClubId && m.awayTeamId === awayClubId) ||
            (m.homeTeamId === awayClubId && m.awayTeamId === homeClubId)
        );
        if (originalMatchIndex !== -1) {
            matchToReschedule = { ...originalWeekBlock.matches[originalMatchIndex] };
        }
    }

    if (!matchToReschedule) {
        console.warn(`No unplayed league match found between ${homeClubId} and ${awayClubId} in absolute game week ${originalAbsoluteGameWeek} to reschedule.`);
        return null;
    }

    // Remove the match from its original position
    originalWeekBlock.matches.splice(originalMatchIndex, 1);

    // Update the week for the rescheduled match
    matchToReschedule.week = newAbsoluteGameWeek;

    // Find or create the new week block
    let newWeekBlock = league.currentSeasonFixtures.find(wb => wb.week === newAbsoluteGameWeek && wb.competition === Constants.COMPETITION_TYPE.LEAGUE);
    if (!newWeekBlock) {
        newWeekBlock = {
            week: newAbsoluteGameWeek,
            competition: Constants.COMPETITION_TYPE.LEAGUE,
            matches: []
        };
        league.currentSeasonFixtures.push(newWeekBlock);
        // Ensure the new week block is inserted in correct order for rendering
        league.currentSeasonFixtures.sort((a, b) => a.week - b.week);
    }

    // Add the match to the new week block
    newWeekBlock.matches.push(matchToReschedule);
    console.log(`DEBUG: Rescheduled league match ${matchToReschedule.homeTeamName} vs ${matchToReschedule.awayTeamName} from week ${originalAbsoluteGameWeek} to week ${newAbsoluteGameWeek}.`);

    return updatedLeagues;
}

/**
 * Finds the next available week for a rescheduled league match.
 * Starts searching from `startAbsoluteGameWeek` and looks for a week where the player has no match.
 * @param {Array<object>} currentLeagues - The current array of league objects.
 * @param {string} playerClubId - The ID of the player's club.
 * @param {number} startAbsoluteGameWeek - The absolute game week to start searching from.
 * @returns {number} The absolute game week number of the next available slot.
 */
export function findNextAvailableLeagueWeek(currentLeagues, playerClubId, startAbsoluteGameWeek) {
    // Find the league the player is in
    const playerLeague = currentLeagues.find(l => l.allClubsData.some(c => c.id === playerClubId));

    if (!playerLeague || !playerLeague.currentSeasonFixtures) {
        return Constants.TOTAL_LEAGUE_WEEKS + 1; // Fallback to immediately after season if no fixtures
    }

    let nextAvailableWeek = startAbsoluteGameWeek;
    let foundSlot = false;

    // Search for an empty slot within the existing fixture weeks and beyond season end
    for (let i = startAbsoluteGameWeek; i <= Constants.TOTAL_LEAGUE_WEEKS + 10; i++) { // Search a few weeks beyond season end
        // Check if player has a league match in this potential week
        const playerHasLeagueMatchThisWeek = playerLeague.currentSeasonFixtures.some(wb =>
            wb.week === i && wb.competition === Constants.COMPETITION_TYPE.LEAGUE &&
            wb.matches.some(match => (match.homeTeamId === playerClubId || match.awayTeamId === playerClubId) && !match.played)
        );

        // Check if player has a cup match in this potential week
        const playerHasCupMatchThisWeek = Main.gameState.countyCup.fixtures.some(wb =>
            wb.week === i && wb.competition === Constants.COMPETITION_TYPE.COUNTY_CUP &&
            wb.matches.some(match => (match.homeTeamId === playerClubId || match.awayTeamId === playerClubId) && match.awayTeamId !== 'BYE' && !match.played)
        );

        if (!playerHasLeagueMatchThisWeek && !playerHasCupMatchThisWeek) {
            nextAvailableWeek = i;
            foundSlot = true;
            break;
        }
        nextAvailableWeek = i + 1; // Increment if current week is busy
    }

    if (!foundSlot) {
        // Fallback: If no slot found within existing range, append to the very end
        nextAvailableWeek = Constants.TOTAL_LEAGUE_WEEKS + 1;
        // Find the highest week number currently in fixtures and add 1
        const maxExistingWeek = playerLeague.currentSeasonFixtures.reduce((max, wb) => Math.max(max, wb.week), 0);
        nextAvailableWeek = Math.max(nextAvailableWeek, maxExistingWeek + 1);
    }
    
    console.log(`DEBUG: Found next available league week for rescheduling: ${nextAvailableWeek}`);
    return nextAvailableWeek;
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
