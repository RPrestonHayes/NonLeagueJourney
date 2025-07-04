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
 * @param {Array<object>} allClubsInRegionalPool - The array of all 60 regional club objects (AI + Player) with initialSeedQuality.
 * @returns {object} An object containing { leagues: Array<object>, clubs: Array<object> }
 * where 'leagues' contains the league structural data and 'clubs' contains
 * all clubs within those leagues (including player's and opponents).
 */
export function generateInitialLeagues(playerCountyData, allClubsInRegionalPool) {
    const leagues = [];
    const countyName = dataGenerator.getCountyNameForLeagues(playerCountyData);

    // Sort all regional clubs by their initialSeedQuality (1 is best, 60 is worst)
    const sortedRegionalClubs = [...allClubsInRegionalPool].sort((a, b) => a.initialSeedQuality - b.initialSeedQuality);

    // Create league objects and distribute clubs for REGIONAL LEAGUES ONLY
    for (const tierKey in Constants.LEAGUE_TIERS) {
        const tierConfig = Constants.LEAGUE_TIERS[tierKey];

        // Only create league objects for tiers marked as 'isRegionalLeague'
        if (tierConfig.isRegionalLeague) {
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

            // Distribute clubs based on seed range for this league
            const clubsForThisLeague = sortedRegionalClubs.filter(club =>
                club.initialSeedQuality >= tierConfig.seedRange.min &&
                club.initialSeedQuality <= tierConfig.seedRange.max
            );

            // Assign clubs to this league and update their currentLeagueId
            clubsForThisLeague.forEach(club => {
                club.currentLeagueId = newLeague.id;
                // potentialLeagueLevel is already set in dataGenerator.generateRegionalClubPool
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
    }

    // After creating leagues, ensure the sortedRegionalClubs (all 60) have their currentLeagueId set correctly.
    // The player's club will have its currentLeagueId updated here.
    // No need to explicitly handle EXTERNAL_HIGHER_TIER clubs here, as they are not part of this initial league setup.


    console.log("Initial tiered league structure generated:", leagues);
    // Return all leagues and the modified (with currentLeagueId) full list of regional clubs
    return { leagues: leagues, clubs: sortedRegionalClubs };
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

    // Identify regional league club IDs for comparison
    const allRegionalLeagueClubIds = new Set();
    Main.gameState.leagues.forEach(league => {
        if (league.isRegionalLeague) { // Only consider regional leagues
            league.allClubsData.forEach(club => allRegionalLeagueClubIds.add(club.id));
        }
    });
    
    // Separate regional league teams from other (potentially external) teams in the current pool
    let externalTeamsInPool = availableTeamsForDraw.filter(team => !allRegionalLeagueClubIds.has(team.id));
    let regionalLeagueTeamsInPool = availableTeamsForDraw.filter(team => allRegionalLeagueClubIds.has(team.id));


    // --- FIX START: Generate 4 higher-tier external teams for Round 1 if needed ---
    const isRoundOne = Constants.COUNTY_CUP_MATCH_WEEKS.indexOf(week) === 0;
    const desiredExternalHigherTierTeams = 4; // We want 4 of these
    let newlyGeneratedHigherTierTeams = [];

    if (isRoundOne) {
        const existingHigherTierTeams = externalTeamsInPool.filter(team => team.potentialLeagueLevel === Constants.LEAGUE_TIERS.EXTERNAL_HIGHER_TIER.level);
        const numToGenerate = Math.max(0, desiredExternalHigherTierTeams - existingHigherTierTeams.length);

        for (let i = 0; i < numToGenerate; i++) {
            // Use generateSingleOpponentClub to create these higher-tier teams
            const newOpponent = dataGenerator.generateSingleOpponentClub(
                Main.gameState.playerCountyData, // Pass player county data
                dataGenerator.getRandomInt(Constants.LEAGUE_TIERS.EXTERNAL_HIGHER_TIER.overallTeamQuality.min, Constants.LEAGUE_TIERS.EXTERNAL_HIGHER_TIER.overallTeamQuality.max)
            );
            
            // Ensure uniqueness and add to lists
            const isAlreadyInAnyPool = availableTeamsForDraw.some(team => team.id === newOpponent.id) || newlyGeneratedHigherTierTeams.some(team => team.id === newOpponent.id);
            if (newOpponent && !isAlreadyInAnyPool) {
                newOpponent.inCup = true;
                newOpponent.eliminatedFromCup = false;
                newlyGeneratedHigherTierTeams.push(newOpponent);
                opponentData.setAllOpponentClubs([...opponentData.getAllOpponentClubs(null), newOpponent]); // Add to global list
                Main.gameState.countyCup.teams.push(newOpponent); // Add to persistent cup teams
            }
        }
    }
    // Add newly generated higher-tier teams to the external pool for this draw
    externalTeamsInPool.push(...newlyGeneratedHigherTierTeams);

    // Reconstruct availableTeamsForDraw with all relevant teams (regional + external)
    availableTeamsForDraw = [...regionalLeagueTeamsInPool, ...externalTeamsInPool];

    // Ensure the total pool size is a power of 2 for the draw, if not, add BYE teams
    let finalPoolSize = availableTeamsForDraw.length;
    if (finalPoolSize > 0 && (finalPoolSize & (finalPoolSize - 1)) !== 0) { // Check if not a power of 2
        let nextPowerOf2 = 1;
        while (nextPowerOf2 < finalPoolSize) {
            nextPowerOf2 <<= 1; // Multiply by 2
        }
        const numByesNeeded = nextPowerOf2 - finalPoolSize;
        for (let i = 0; i < numByesNeeded; i++) {
            // Create a dummy BYE team. This BYE team won't be a real club, but a placeholder.
            availableTeamsForDraw.push({
                id: `BYE_TEAM_${dataGenerator.generateUniqueId('')}`,
                name: 'BYE', nickname: 'BYE',
                inCup: false, eliminatedFromCup: true, // Mark as eliminated for consistency
                isBye: true // Custom flag for BYE teams
            });
        }
        console.log(`DEBUG: Added ${numByesNeeded} BYE teams to make cup draw even.`);
    }

    // Shuffle teams to ensure random draw
    for (let i = availableTeamsForDraw.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableTeamsForDraw[i], availableTeamsForDraw[j]] = [availableTeamsForDraw[j], availableTeamsForDraw[i]];
    }

    // Pair remaining teams for matches
    for (let i = 0; i < availableTeamsForDraw.length; i += 2) {
        let homeTeam = availableTeamsForDraw[i];
        let awayTeam = availableTeamsForDraw[i + 1];

        if (homeTeam.isBye || awayTeam.isBye) { // Handle BYE matches
            const realTeam = homeTeam.isBye ? awayTeam : homeTeam;
            cupMatches.push({
                id: dataGenerator.generateUniqueId('M'), week: week, season: season,
                homeTeamId: realTeam.id, homeTeamName: realTeam.name,
                awayTeamId: 'BYE', awayTeamName: 'BYE', competition: Constants.COMPETITION_TYPE.COUNTY_CUP, result: 'BYE', played: true
            });
        } else {
            let opponentClubFromOutsideLeague = undefined; 
            const isHomePlayer = homeTeam.id === playerClubId;
            const isAwayPlayer = awayTeam.id === playerClubId;

            // Determine if the opponent is from outside the regional leagues (higher tier)
            if (homeTeam.potentialLeagueLevel === Constants.LEAGUE_TIERS.EXTERNAL_HIGHER_TIER.level) {
                opponentClubFromOutsideLeague = homeTeam;
            } else if (awayTeam.potentialLeagueLevel === Constants.LEAGUE_TIERS.EXTERNAL_HIGHER_TIER.level) {
                opponentClubFromOutsideLeague = awayTeam;
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
                opponentClubFromOutsideLeague: opponentClubFromOutsideLeague
            });
        }
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
    // Find the specific league this match belongs to
    const leagueToUpdateIndex = updatedLeagues.findIndex(l => 
        l.allClubsData.some(c => c.id === homeClubId) || l.allClubsData.some(c => c.id === awayClubId)
    );
    const league = updatedLeagues[leagueToUpdateIndex];

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
