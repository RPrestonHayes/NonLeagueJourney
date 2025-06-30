// js/logic/gameLoop.js

/**
 * Manages the core game loop, advancing the game week by week.
 * Orchestrates task processing, event triggering, match simulation, and state updates.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as playerData from '../data/playerData.js';
import * as opponentData from '../data/opponentData.js';
import * as leagueData from '../data/leagueData.js';
import * as dataGenerator from '../utils/dataGenerator.js';
import * as matchLogic from './matchLogic.js';
import * as eventLogic from './eventLogic.js';
import * as playerInteractionLogic from './playerInteractionLogic.js';
import * as committeeLogic from './committeeLogic.js';
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js';


// --- Helper Functions ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Advances the game by one week. This is the central function called from main.js.
 * @param {object} gameState - The current mutable gameState object.
 */
export function advanceWeek(gameState) {
    console.log(`--- Advancing to Season ${gameState.currentSeason}, Week ${gameState.currentWeek} ---`);

    if (gameState.gamePhase === Constants.GAME_PHASE.SETUP || gameState.gamePhase === Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION) {
         renderers.showModal('Game Not Ready', 'Complete game setup and customization before advancing the week.');
         return;
    }

    // 1. Process Player's Weekly Tasks (only those marked as assigned/completed)
    processPlayerTasks(gameState);

    // 2. Apply Weekly Expenses
    applyWeeklyExpenses(gameState);

    // 3. Check for Monthly Committee Meeting
    if (gameState.currentWeek > 0 && gameState.currentWeek % Constants.COMMITTEE_MEETING_FREQUENCY_WEEKS === 0) {
        console.log("Monthly committee meeting scheduled.");
        committeeLogic.startCommitteeMeeting(gameState);
        gameState.messages.push({ week: gameState.currentWeek, text: `Monthly committee meeting held.` });
    }

    // 4. Trigger Random Event
    if (gameState.currentWeek > Constants.PRE_SEASON_WEEKS || gameState.gamePhase === Constants.GAME_PHASE.PRE_SEASON_PLANNING) {
        const triggeredEvent = eventLogic.triggerRandomEvent(gameState);
        if (triggeredEvent) {
            gameState.messages.push({ week: gameState.currentWeek, text: `${triggeredEvent.title}: ${triggeredEvent.description}` });
        }
    }

    // 5. Simulate Matches for the current week (if any)
    const currentLeague = gameState.leagues[0];
    let matchesPlayedThisWeek = false; // Flag to track if any matches were played

    // Check if it's within match playing weeks (after pre-season, within total match weeks)
    if (gameState.currentWeek > Constants.PRE_SEASON_WEEKS && gameState.currentWeek <= Constants.TOTAL_LEAGUE_WEEKS && currentLeague) {
        // Adjust the week for fixture lookup to be relative to league match start
        const matchWeekIndex = gameState.currentWeek - Constants.PRE_SEASON_WEEKS; // 1-indexed for the fixtures array

        // Find the week block for the current matchWeekIndex
        const currentWeekBlock = currentLeague.currentSeasonFixtures.find(
            weekBlock => weekBlock.week === matchWeekIndex
        );

        if (currentWeekBlock && currentWeekBlock.matches.length > 0) {
            console.log(`DEBUG: Matches scheduled for Game Week ${gameState.currentWeek} (Fixture Week ${matchWeekIndex}):`, currentWeekBlock.matches.length);
            gameState.gamePhase = Constants.GAME_PHASE.MATCH_DAY;

            let playerMatchResult = null; // To store player's match result for modal

            // Iterate through all matches scheduled for this specific week
            for (const match of currentWeekBlock.matches) {
                // Skip if this match has already been played (e.g., BYE match handled earlier)
                if (match.played) continue;

                // Simulate match
                const matchResult = matchLogic.simulateMatch(
                    match.homeTeamId,
                    match.awayTeamId,
                    gameState.playerClub,
                    opponentData.getAllOpponentClubs(gameState.playerClub.id), // Ensure playerClubId is passed for filtering
                    playerData.getSquad()
                );

                // Update league table for both teams involved
                gameState.leagues = leagueData.updateLeagueTable(
                    gameState.leagues,
                    currentLeague.id,
                    match.homeTeamId,
                    match.awayTeamId,
                    matchResult.homeScore,
                    matchResult.awayScore
                );

                // Mark this specific match object as played with its result
                gameState.leagues = leagueData.updateMatchResult(
                    gameState.leagues,
                    currentLeague.id,
                    match.id,
                    `${matchResult.homeScore}-${matchResult.awayScore}`
                );

                // If this was the player's match, store its result for a dedicated modal
                if (match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id) {
                    playerMatchResult = matchResult;
                    console.log(`DEBUG: Player match simulated. Result: ${matchResult.homeScore}-${matchResult.awayScore}`);
                } else {
                    console.log(`DEBUG: AI match simulated: ${matchResult.homeTeamName} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeamName}`);
                }
                matchesPlayedThisWeek = true;
            }

            // After all matches for the week are simulated, display player's match result
            if (playerMatchResult) {
                renderers.showModal(
                    `Match Result: ${playerMatchResult.homeTeamName} ${playerMatchResult.homeScore}-${playerMatchResult.awayScore} ${playerMatchResult.awayTeamName}`,
                    playerMatchResult.report,
                    [{ text: 'Continue', action: renderers.hideModal }]
                );
                gameState.messages.push({ week: gameState.currentWeek, text: `Match Result: ${playerMatchResult.homeTeamName} ${playerMatchResult.homeScore}-${playerMatchResult.awayScore} ${playerMatchResult.awayTeamName}` });
            } else if (currentWeekBlock.matches.filter(m => m.awayTeamId !== 'BYE').length > 0) {
                // If there were matches but player had a BYE or no match this week but others played
                renderers.displayMessage('League Matches Played', 'Other league matches were played this week.');
                gameState.messages.push({ week: gameState.currentWeek, text: `Other league matches played this week.` });
            }


        } else {
            console.log(`DEBUG: No matches found in week block ${matchWeekIndex}. Player may have a BYE or it's a gap week.`);
            renderers.displayMessage('Quiet Week', 'No league match scheduled for your team. Focus on club tasks!');
            gameState.messages.push({ week: gameState.currentWeek, text: `No league match for your team this week.` });
        }
    } else {
        console.log(`DEBUG: Not within league match weeks (Current Week: ${gameState.currentWeek}, Pre-Season Weeks: ${Constants.PRE_SEASON_WEEKS}, Total League Weeks: ${Constants.TOTAL_LEAGUE_WEEKS}).`);
        // Only show 'Quiet Week' if not already showing an event modal etc.
        if (!matchesPlayedThisWeek) { // Avoid double messages if random event already popped up
             renderers.displayMessage('Quiet Week', 'Focus on building your club!');
             gameState.messages.push({ week: gameState.currentWeek, text: `A quiet week in the season.` });
        }
    }

    // 6. Update Player Fitness/Morale (Post-match/Weekly Decay)
    updatePlayerStatus(gameState);


    // 7. Advance Week Counter
    gameState.currentWeek++;

    // 8. Check for End of Season
    if (gameState.currentWeek > Constants.TOTAL_LEAGUE_WEEKS) {
        endSeason(gameState);
    } else {
        gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
        gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
        gameState.gamePhase = Constants.GAME_PHASE.WEEKLY_PLANNING;
    }

    console.log(`DEBUG: Advanced to Week ${gameState.currentWeek}, Season ${gameState.currentSeason}`);
    Main.updateUI();
    Main.saveGame(false);
}

/**
 * Processes the tasks that the player has allocated hours to for the current week.
 * Applies effects of tasks to game state.
 * @param {object} gameState - The current mutable gameState object.
 */
function processPlayerTasks(gameState) {
    console.log("DEBUG: Processing weekly tasks...");
    const tasksToProcess = gameState.weeklyTasks.filter(task => task.completed);

    if (tasksToProcess.length === 0 && (Constants.WEEKLY_BASE_HOURS - gameState.availableHours) > 0) {
        console.warn("DEBUG: Player allocated time but no tasks were marked as completed.");
    }

    tasksToProcess.forEach(task => {
        console.log(`DEBUG: Processing task: ${task.description} (Completed)`);
        let taskMessage = '';

        switch (task.type) {
            case Constants.WEEKLY_TASK_TYPES.PITCH_MAINT:
                const maintenanceCost = 20 + (gameState.playerClub.facilities[Constants.FACILITIES.PITCH].level * 5);
                gameState.playerClub.finances = clubData.addTransaction(
                    gameState.playerClub.finances,
                    -maintenanceCost,
                    Constants.TRANSACTION_TYPE.PITCH_EXPENSE,
                    'Weekly Pitch Maintenance'
                );
                taskMessage = `Pitch maintenance completed. Cost £${maintenanceCost.toFixed(2)}.`;
                break;
            case Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO:
                const eligiblePlayers = playerData.getSquad().filter(p => p.status.morale < 80);
                const playerToTalkTo = dataGenerator.getRandomElement(eligiblePlayers.length > 0 ? eligiblePlayers : playerData.getSquad());
                if (playerToTalkTo) {
                    playerInteractionLogic.startPlayerConversation(playerToTalkTo, 'motivate');
                    taskMessage = `You had a conversation with ${playerToTalkTo.name}.`;
                } else {
                    taskMessage = `Tried to talk to players, but everyone seems fine.`;
                }
                break;
            case Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR:
                const potentialPlayer = dataGenerator.generatePlayer(null, dataGenerator.getRandomInt(1, 2));
                playerInteractionLogic.attemptRecruitment(potentialPlayer, gameState.playerClub.id);
                taskMessage = `Spent time looking for new talent.`;
                break;
            case Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE:
                taskMessage = `Planning a fundraising event. Details to follow!`;
                break;
            case Constants.WEEKLY_TASK_TYPES.ADMIN_WORK:
                taskMessage = `Club admin duties handled by the committee.`;
                break;
            case Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH:
                if (dataGenerator.getRandomInt(1, 100) <= (gameState.playerClub.reputation + task.baseHours) / 2) {
                    const sponsorAmount = dataGenerator.getRandomInt(50, 250);
                    const sponsorName = `${dataGenerator.getRandomName('last')} Holdings`;
                    gameState.playerClub.finances = clubData.addTransaction(
                        gameState.playerClub.finances,
                        sponsorAmount,
                        Constants.TRANSACTION_TYPE.SPONSOR_IN,
                        `New sponsor: ${sponsorName}`
                    );
                    taskMessage = `Found a new sponsor: ${sponsorName} for £${sponsorAmount.toFixed(2)}!`;
                } else {
                    taskMessage = `Searched for sponsors, but no luck this week.`;
                }
                break;
            case Constants.WEEKLY_TASK_TYPES.FAC_CHECK:
                taskMessage = `Facility checks completed, all seems in order.`;
                break;
        }
        gameState.messages.push({ week: gameState.currentWeek, text: taskMessage });
    });

    gameState.weeklyTasks.forEach(task => task.assignedHours = 0);
}

/**
 * Applies weekly expenses to the club's finances.
 * @param {object} gameState - The current mutable gameState object.
 */
function applyWeeklyExpenses(gameState) {
    const totalMaintenanceCost = clubData.calculateTotalMaintenanceCost(gameState.playerClub.facilities);
    if (totalMaintenanceCost > 0) {
        gameState.playerClub.finances = clubData.addTransaction(
            gameState.playerClub.finances,
            -totalMaintenanceCost,
            Constants.TRANSACTION_TYPE.OTHER_EXP,
            `Weekly Facility Maintenance`
        );
        gameState.messages.push({ week: gameState.currentWeek, text: `Paid £${totalMaintenanceCost.toFixed(2)} for facility maintenance.` });
    }
}

/**
 * Updates player fitness and applies morale decay/changes.
 * @param {object} gameState - The current mutable gameState object.
 */
function updatePlayerStatus(gameState) {
    console.log("DEBUG: Updating player status...");
    gameState.playerClub.squad = gameState.playerClub.squad.map(player => {
        const updatedPlayer = { ...player };

        if (updatedPlayer.status.injuryStatus === 'Fit' && !updatedPlayer.status.suspended) {
            updatedPlayer.status.fitness = Math.max(0, updatedPlayer.status.fitness - dataGenerator.getRandomInt(2, 5));
        }

        updatedPlayer.status.morale = Math.max(0, Math.min(100, updatedPlayer.status.morale - dataGenerator.getRandomInt(1, 3)));

        if (updatedPlayer.status.injuryStatus !== 'Fit' && updatedPlayer.status.injuryReturnDate) {
            if (updatedPlayer.status.injuryReturnDate === "Next Week") {
                updatedPlayer.status.injuryStatus = 'Fit';
                updatedPlayer.status.injuryReturnDate = null;
                Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${updatedPlayer.name} has recovered from injury.` });
            }
        }
        if (updatedPlayer.status.suspended && updatedPlayer.status.suspensionGames > 0) {
            updatedPlayer.status.suspensionGames--;
            if (updatedPlayer.status.suspensionGames === 0) {
                updatedPlayer.status.suspended = false;
                updatedPlayer.status.injuryStatus = 'Fit';
                Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${updatedPlayer.name}'s suspension has ended.` });
            }
        }

        return updatedPlayer;
    });
    playerData.setSquad(gameState.playerClub.squad);
}

/**
 * Handles end of season logic: promotions, relegations, awards, reset stats, new fixtures.
 * @param {object} gameState - The current mutable gameState object.
 */
function endSeason(gameState) {
    console.log(`--- End of Season ${gameState.currentSeason} ---`);
    gameState.gamePhase = Constants.GAME_PHASE.END_OF_SEASON;

    const allClubsForLeague = [gameState.playerClub, ...opponentData.getAllOpponentClubs(gameState.playerClub.id)];
    gameState.leagues = leagueData.processEndOfSeason(gameState.leagues, allClubsForLeague);

    const playerClubInLeagueData = allClubsForLeague.find(c => c.id === gameState.playerClub.id);
    if (playerClubInLeagueData) {
        gameState.playerClub.finalLeaguePosition = playerClubInLeagueData.finalLeaguePosition;
        gameState.playerClub.leagueStats = { ...playerClubInLeagueData.leagueStats };
    }


    const currentLeague = gameState.leagues[0];
    const playerFinalPos = gameState.playerClub.finalLeaguePosition;
    const playerFinalPoints = gameState.playerClub.leagueStats.points;


    let seasonSummaryMessage = `Season ${gameState.currentSeason} concluded. You finished ${playerFinalPos}th in the ${currentLeague.name} with ${playerFinalPoints} points.`;
    let endSeasonModalTitle = 'Season Concluded';

    if (playerFinalPos && playerFinalPos <= currentLeague.promotedTeams) {
        endSeasonModalTitle = 'PROMOTED!';
        seasonSummaryMessage = `PROMOTED! Congratulations! You finished ${playerFinalPos}st in the ${currentLeague.name} with ${playerFinalPoints} points. Prepare for a new challenge!`;
        const prizeMoney = dataGenerator.getRandomInt(500, 1500);
        gameState.playerClub.finances = clubData.addTransaction(
            gameState.playerClub.finances,
            prizeMoney,
            Constants.TRANSACTION_TYPE.PRIZE_MONEY,
            'Promotion Prize Money'
        );
        seasonSummaryMessage += ` Received £${prizeMoney.toFixed(2)} prize money.`;
    } else if (playerFinalPos && playerFinalPos > currentLeague.numTeams - currentLeague.relegatedTeams) {
        endSeasonModalTitle = 'RELEGATED!';
        seasonSummaryMessage = `RELEGATED! Oh no! You finished ${playerFinalPos}th in the ${currentLeague.name} with ${playerFinalPoints} points. Time for rebuilding.`;
    }

    renderers.showModal(endSeasonModalTitle, seasonSummaryMessage, [{ text: 'Review Season', action: renderers.hideModal }]);
    gameState.messages.push({ week: gameState.currentWeek, text: seasonSummaryMessage });


    gameState.playerClub.squad = playerData.resetPlayerSeasonStats();
    opponentData.resetOpponentSeasonalStats();
    gameState.playerClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };


    gameState.currentSeason++;
    gameState.currentWeek = 1;
    gameState.gamePhase = Constants.GAME_PHASE.OFF_SEASON;

    currentLeague.currentSeasonFixtures = dataGenerator.generateMatchSchedule(
        gameState.playerClub.id,
        [gameState.playerClub, ...opponentData.getAllOpponentClubs(gameState.playerClub.id)],
        gameState.currentSeason
    );
    gameState.leagues[0] = currentLeague;

    gameState.availableHours = Constants.WEEKLY_BASE_HOURS * 2;
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);

    renderers.renderGameScreen('homeScreen');
    renderers.displayMessage(`Season ${gameState.currentSeason - 1} Concluded!`, `Prepare for Season ${gameState.currentSeason}.`);
}

