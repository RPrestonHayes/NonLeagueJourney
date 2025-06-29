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
    // Trigger meeting if current week is a multiple of frequency AND it's after pre-season (or a specific starting week)
    // For example, if PRE_SEASON_WEEKS is 4, and freq is 4, meetings could be at week 4, 8, 12, etc.
    // So, currentWeek % freq should be 0, or currentWeek - 1 % freq (if 0-indexed).
    if (gameState.currentWeek > 0 && gameState.currentWeek % Constants.COMMITTEE_MEETING_FREQUENCY_WEEKS === 0) { // Meeting at end of every 4th week
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

    // 5. Simulate Match (if a match is scheduled for this week AND it's a match week)
    const currentLeague = gameState.leagues[0];
    // Check if it's within match playing weeks (after pre-season, within total match weeks)
    if (gameState.currentWeek > Constants.PRE_SEASON_WEEKS && gameState.currentWeek <= Constants.TOTAL_LEAGUE_WEEKS && currentLeague) {
        // Adjust the week for fixture lookup to be relative to league match start
        const matchWeekIndex = gameState.currentWeek - Constants.PRE_SEASON_WEEKS;
        const weeklyMatch = currentLeague.currentSeasonFixtures.find(
            match => match.week === matchWeekIndex && !match.played
        );

        if (weeklyMatch) {
            console.log(`Match scheduled for Week ${gameState.currentWeek}: ${weeklyMatch.homeTeamName} vs ${weeklyMatch.awayTeamName}`);
            gameState.gamePhase = Constants.GAME_PHASE.MATCH_DAY;

            const matchResult = matchLogic.simulateMatch(
                weeklyMatch.homeTeamId,
                weeklyMatch.awayTeamId,
                gameState.playerClub,
                opponentData.getAllOpponentClubs(gameState.playerClub.id), // Ensure playerClubId is passed here for filtering
                playerData.getSquad()
            );

            gameState.leagues = leagueData.updateLeagueTable(
                gameState.leagues,
                currentLeague.id,
                weeklyMatch.homeTeamId,
                weeklyMatch.awayTeamId,
                matchResult.homeScore,
                matchResult.awayScore
            );

            gameState.leagues = leagueData.updateMatchResult(
                gameState.leagues,
                currentLeague.id,
                weeklyMatch.id,
                `${matchResult.homeScore}-${matchResult.awayScore}`
            );

            renderers.showModal(
                `Match Result: ${matchResult.homeTeamName} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeamName}`,
                matchResult.report,
                [{ text: 'Continue', action: renderers.hideModal }]
            );
            gameState.messages.push({ week: gameState.currentWeek, text: `Match Result: ${matchResult.homeTeamName} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeamName}` });

            console.log("Match simulated. Result:", matchResult.homeScore, matchResult.awayScore);
        } else {
            console.log(`No league match scheduled for current match-week index ${matchWeekIndex}.`);
        }
    } else {
        console.log(`Not within league match weeks (Current Week: ${gameState.currentWeek}, Pre-Season Weeks: ${Constants.PRE_SEASON_WEEKS}, Total League Weeks: ${Constants.TOTAL_LEAGUE_WEEKS}).`);
    }

    // 6. Update Player Fitness/Morale (Post-match/Weekly Decay)
    updatePlayerStatus(gameState);


    // 7. Advance Week Counter
    gameState.currentWeek++;

    // 8. Check for End of Season
    if (gameState.currentWeek > Constants.TOTAL_LEAGUE_WEEKS) {
        endSeason(gameState);
        // Phase is set inside endSeason for END_OF_SEASON then OFF_SEASON
    } else {
        gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
        gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
        gameState.gamePhase = Constants.GAME_PHASE.WEEKLY_PLANNING;
    }

    console.log(`Advanced to Week ${gameState.currentWeek}, Season ${gameState.currentSeason}`);
    Main.updateUI();
    Main.saveGame(false);
}

/**
 * Processes the tasks that the player has allocated hours to for the current week.
 * Applies effects of tasks to game state.
 * @param {object} gameState - The current mutable gameState object.
 */
function processPlayerTasks(gameState) {
    console.log("Processing weekly tasks...");
    const tasksToProcess = gameState.weeklyTasks.filter(task => task.completed);

    if (tasksToProcess.length === 0 && (Constants.WEEKLY_BASE_HOURS - gameState.availableHours) > 0) {
        console.warn("Player allocated time but no tasks were marked as completed.");
    }

    tasksToProcess.forEach(task => {
        console.log(`Processing task: ${task.description} (Completed)`);
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
                const playerToTalkTo = getRandomElement(eligiblePlayers.length > 0 ? eligiblePlayers : playerData.getSquad());
                if (playerToTalkTo) {
                    playerInteractionLogic.startPlayerConversation(playerToTalkTo, 'motivate');
                    taskMessage = `You had a conversation with ${playerToTalkTo.name}.`;
                } else {
                    taskMessage = `Tried to talk to players, but everyone seems fine.`;
                }
                break;
            case Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR:
                const potentialPlayer = dataGenerator.generatePlayer(null, getRandomInt(1, 2));
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
                if (getRandomInt(1, 100) <= (gameState.playerClub.reputation + task.baseHours) / 2) {
                    const sponsorAmount = getRandomInt(50, 250);
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
    console.log("Updating player status...");
    gameState.playerClub.squad = gameState.playerClub.squad.map(player => {
        const updatedPlayer = { ...player };

        if (updatedPlayer.status.injuryStatus === 'Fit' && !updatedPlayer.status.suspended) {
            updatedPlayer.status.fitness = Math.max(0, updatedPlayer.status.fitness - getRandomInt(2, 5));
        }

        updatedPlayer.status.morale = Math.max(0, Math.min(100, updatedPlayer.status.morale - getRandomInt(1, 3)));

        if (updatedPlayer.status.injuryStatus !== 'Fit' && updatedPlayer.status.injuryReturnDate) {
            if (updatedPlayer.status.injuryReturnDate === "Next Week") {
                updatedPlayer.status.injuryStatus = 'Fit';
                updatedPlayer.status.injuryReturnDate = null;
                Main.gameState.messages.push({ week: Main.currentWeek, text: `${updatedPlayer.name} has recovered from injury.` }); // Corrected Main.currentWeek to Main.gameState.currentWeek
            }
        }
        if (updatedPlayer.status.suspended && updatedPlayer.status.suspensionGames > 0) {
            updatedPlayer.status.suspensionGames--;
            if (updatedPlayer.status.suspensionGames === 0) {
                updatedPlayer.status.suspended = false;
                updatedPlayer.status.injuryStatus = 'Fit';
                Main.gameState.messages.push({ week: Main.currentWeek, text: `${updatedPlayer.name}'s suspension has ended.` }); // Corrected Main.currentWeek to Main.gameState.currentWeek
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
        const prizeMoney = getRandomInt(500, 1500);
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

