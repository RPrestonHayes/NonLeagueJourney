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
import * as playerInteractionLogic from './playerInteractionLogic.js'; // NEW
import * as committeeLogic from './committeeLogic.js'; // NEW
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js'; // Import Main to update game state via Main.updateUI() and access gameState


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

    // Ensure we are in a phase where weekly tasks and events are relevant
    if (gameState.gamePhase === Constants.GAME_PHASE.SETUP || gameState.gamePhase === Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION) {
         renderers.showModal('Game Not Ready', 'Complete game setup and customization before advancing the week.');
         return;
    }

    // 1. Process Player's Weekly Tasks
    processPlayerTasks(gameState);

    // 2. Apply Weekly Expenses (e.g., facility maintenance, player wages later)
    applyWeeklyExpenses(gameState);

    // 3. Check for Monthly Committee Meeting
    // Assuming a meeting every 4 weeks, starting from week 1 (or end of pre-season)
    if (gameState.currentWeek % Constants.COMMITTEE_MEETING_FREQUENCY_WEEKS === 0) { // Define in Constants
        console.log("Monthly committee meeting scheduled.");
        // Committee meetings consume player's time/attention, so we can trigger the modal here
        committeeLogic.startCommitteeMeeting(gameState);
        // Add a message about the meeting
        gameState.messages.push({ week: gameState.currentWeek, text: `Monthly committee meeting held.` });
    }

    // 4. Trigger Random Event (if in regular season/pre-season, not during setup phases)
    if (gameState.currentWeek > Constants.PRE_SEASON_WEEKS || gameState.gamePhase === Constants.GAME_PHASE.PRE_SEASON_PLANNING) {
        const triggeredEvent = eventLogic.triggerRandomEvent(gameState); // eventLogic will handle modifying gameState
        if (triggeredEvent) {
            // Event modal is shown by eventLogic, but we log to messages for history
            gameState.messages.push({ week: gameState.currentWeek, text: `${triggeredEvent.title}: ${triggeredEvent.description}` });
        }
    }


    // 5. Simulate Match (if a match is scheduled for this week AND it's a match week)
    const currentLeague = gameState.leagues[0]; // Assuming one league for now
    // Check if it's past pre-season AND a match is scheduled for this week
    if (gameState.currentWeek > Constants.PRE_SEASON_WEEKS && currentLeague) {
        const weeklyMatch = currentLeague.currentSeasonFixtures.find(
            match => match.week === (gameState.currentWeek - Constants.PRE_SEASON_WEEKS) && !match.played // Adjust week for fixture index
        );

        if (weeklyMatch) {
            console.log(`Match scheduled for Week ${gameState.currentWeek}: ${weeklyMatch.homeTeamName} vs ${weeklyMatch.awayTeamName}`);
            gameState.gamePhase = Constants.GAME_PHASE.MATCH_DAY; // Transition to match day phase

            const matchResult = matchLogic.simulateMatch(
                weeklyMatch.homeTeamId,
                weeklyMatch.awayTeamId,
                gameState.playerClub,
                opponentData.getAllOpponentClubs(),
                playerData.getSquad()
            );

            // Update league table with match result
            gameState.leagues = leagueData.updateLeagueTable(
                gameState.leagues,
                currentLeague.id,
                weeklyMatch.homeTeamId,
                weeklyMatch.awayTeamId,
                matchResult.homeScore,
                matchResult.awayScore
            );

            // Mark match as played and store result
            gameState.leagues = leagueData.updateMatchResult(
                gameState.leagues,
                currentLeague.id,
                weeklyMatch.id,
                `${matchResult.homeScore}-${matchResult.awayScore}`
            );

            // Display match report
            renderers.showModal(
                `Match Result: ${matchResult.homeTeamName} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeamName}`,
                matchResult.report,
                [{ text: 'Continue', action: renderers.hideModal }] // Player needs to acknowledge
            );
            // Add match result to game messages for history
            gameState.messages.push({ week: gameState.currentWeek, text: `Match Result: ${matchResult.homeTeamName} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeamName}` });

            console.log("Match simulated. Result:", matchResult.homeScore, matchResult.awayScore);
        } else {
            console.log(`No league match scheduled for current match-week index ${gameState.currentWeek - Constants.PRE_SEASON_WEEKS}.`);
            // Only show 'Quiet Week' if no modal from event, or if it's truly a quiet week.
            // This is handled by main.js's updateUI and news feed for general messages.
        }
    } else {
        console.log(`Not yet in league match weeks (Current Week: ${gameState.currentWeek}, Pre-Season Weeks: ${Constants.PRE_SEASON_WEEKS}).`);
    }

    // 6. Update Player Fitness/Morale (Post-match/Weekly Decay)
    updatePlayerStatus(gameState);


    // 7. Advance Week Counter
    gameState.currentWeek++;

    // 8. Check for End of Season
    if (gameState.currentWeek > Constants.TOTAL_LEAGUE_WEEKS) {
        endSeason(gameState);
        gameState.gamePhase = Constants.GAME_PHASE.END_OF_SEASON; // Set phase for end of season processing
    } else {
        // Prepare for next week's planning
        gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
        // Regenerate tasks for the new week (important for tasks to be fresh)
        gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
        gameState.gamePhase = Constants.GAME_PHASE.WEEKLY_PLANNING; // Back to planning phase
    }

    console.log(`Advanced to Week ${gameState.currentWeek}, Season ${gameState.currentSeason}`);
    Main.updateUI(); // Ensure UI is updated after all weekly processing
    Main.saveGame(); // Save game after each week
}

/**
 * Processes the tasks that the player has allocated hours to for the current week.
 * Applies effects of tasks to game state.
 * @param {object} gameState - The current mutable gameState object.
 */
function processPlayerTasks(gameState) {
    console.log("Processing weekly tasks...");
    // Filter tasks that had hours assigned and were not already completed
    const tasksToProcess = gameState.weeklyTasks.filter(task => task.assignedHours > 0 && !task.completed);

    if (tasksToProcess.length === 0 && gameState.availableHours < Constants.WEEKLY_BASE_HOURS) {
        // Only warn if player *tried* to allocate but nothing was processed, or didn't use full hours
        console.warn("No tasks processed, or hours not fully allocated.");
        // Consider a small morale hit or warning if player doesn't manage time well
    }


    tasksToProcess.forEach(task => {
        console.log(`Processing task: ${task.description} (${task.assignedHours} hours)`);
        let taskMessage = ''; // Message for the news feed

        switch (task.type) {
            case Constants.WEEKLY_TASK_TYPES.PITCH_MAINT:
                const maintenanceCost = 20 + (gameState.playerClub.facilities[Constants.FACILITIES.PITCH].level * 5); // Cost increases with level
                gameState.playerClub.finances = clubData.addTransaction(
                    gameState.playerClub.finances,
                    -maintenanceCost,
                    Constants.TRANSACTION_TYPE.PITCH_EXPENSE,
                    'Weekly Pitch Maintenance'
                );
                // Simple pitch improvement based on hours assigned, for now just cost
                taskMessage = `Pitch maintenance completed. Cost £${maintenanceCost.toFixed(2)}.`;
                break;
            case Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO:
                const eligiblePlayers = playerData.getSquad().filter(p => p.status.morale < 80); // Prioritize lower morale
                const playerToTalkTo = getRandomElement(eligiblePlayers.length > 0 ? eligiblePlayers : playerData.getSquad());
                if (playerToTalkTo) {
                    // Trigger actual conversation via modal in playerInteractionLogic
                    playerInteractionLogic.startPlayerConversation(playerToTalkTo, 'motivate'); // Example interaction
                    taskMessage = `You had a conversation with ${playerToTalkTo.name}.`;
                } else {
                    taskMessage = `Tried to talk to players, but everyone seems fine.`;
                }
                break;
            case Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR:
                // Generate a potential new player
                const potentialPlayer = dataGenerator.generatePlayer(null, getRandomInt(1, 2)); // Grassroots quality
                // Trigger recruitment attempt
                playerInteractionLogic.attemptRecruitment(potentialPlayer, gameState.playerClub.id);
                taskMessage = `Spent time looking for new talent.`;
                break;
            case Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE:
                // Placeholder: Successful planning increases chance/yield of next fundraiser event
                taskMessage = `Planning a fundraising event. Details to follow!`;
                // Example: Add a 'pending event' to game state that triggers in a few weeks
                break;
            case Constants.WEEKLY_TASK_TYPES.ADMIN_WORK:
                taskMessage = `Club admin duties handled by the committee.`;
                // Affects committee member satisfaction or club reputation positively slightly
                break;
            case Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH:
                // Chance to find a sponsor
                if (getRandomInt(1, 100) <= (gameState.playerClub.reputation + task.assignedHours) / 2) { // Rep + hours factor
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
                // Placeholder: Prevents breakdown events, or slightly improves facility status
                taskMessage = `Facility checks completed, all seems in order.`;
                break;
        }
        gameState.messages.push({ week: gameState.currentWeek, text: taskMessage });
    });

    // Reset all tasks after processing for the next week
    // New tasks will be generated at the end of advanceWeek
    gameState.weeklyTasks.forEach(task => task.assignedHours = 0); // Reset hours for current week's tasks
    gameState.availableHours = Constants.WEEKLY_BASE_HOURS; // Reset for next week in advanceWeek

    // Note: The actual removal of completed tasks and regeneration happens at the end of advanceWeek.
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
            Constants.TRANSACTION_TYPE.OTHER_EXP, // Or specific MAINTENANCE_EXPENSE
            `Weekly Facility Maintenance`
        );
        // Only add to messages if there's an actual cost
        gameState.messages.push({ week: gameState.currentWeek, text: `Paid £${totalMaintenanceCost.toFixed(2)} for facility maintenance.` });
    }
    // Add other weekly expenses here (e.g., staff wages once implemented)
}

/**
 * Updates player fitness and applies morale decay/changes.
 * @param {object} gameState - The current mutable gameState object.
 */
function updatePlayerStatus(gameState) {
    console.log("Updating player status...");
    gameState.playerClub.squad = gameState.playerClub.squad.map(player => {
        const updatedPlayer = { ...player };

        // Fitness decay for played match / weekly decay
        // Only decay fitness if not already injured or suspended
        if (updatedPlayer.status.injuryStatus === 'Fit' && !updatedPlayer.status.suspended) {
            updatedPlayer.status.fitness = Math.max(0, updatedPlayer.status.fitness - getRandomInt(2, 5)); // Base weekly decay
        }

        // Morale decay (e.g., if not talked to, or recent losses)
        updatedPlayer.status.morale = Math.max(0, updatedPlayer.status.morale - getRandomInt(1, 3)); // Small weekly decay

        // Handle injuries/suspensions (placeholder)
        if (updatedPlayer.status.injuryStatus !== 'Fit' && updatedPlayer.status.injuryReturnDate) {
            // Placeholder: Reduce injury time, e.g., if date is 'Next Week', set to 'Fit'
            if (updatedPlayer.status.injuryReturnDate === "Next Week") { // Simple string check
                updatedPlayer.status.injuryStatus = 'Fit';
                updatedPlayer.status.injuryReturnDate = null;
                Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${updatedPlayer.name} has recovered from injury.` });
            }
        }
        if (updatedPlayer.status.suspended && updatedPlayer.status.suspensionGames > 0) {
            updatedPlayer.status.suspensionGames--;
            if (updatedPlayer.status.suspensionGames === 0) {
                updatedPlayer.status.suspended = false;
                updatedPlayer.status.injuryStatus = 'Fit'; // Clear suspension status
                Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${updatedPlayer.name}'s suspension has ended.` });
            }
        }

        return updatedPlayer;
    });
    playerData.setSquad(gameState.playerClub.squad); // Update playerData's internal state
}

/**
 * Handles end of season logic: promotions, relegations, awards, reset stats, new fixtures.
 * @param {object} gameState - The current mutable gameState object.
 */
function endSeason(gameState) {
    console.log(`--- End of Season ${gameState.currentSeason} ---`);
    gameState.gamePhase = Constants.GAME_PHASE.END_OF_SEASON;

    // 1. Process League Promotions/Relegations
    // Pass ALL clubs (player and opponents) for correct table generation
    const allClubsForLeague = [gameState.playerClub, ...opponentData.getAllOpponentClubs()];
    leagueData.processEndOfSeason(gameState.leagues, allClubsForLeague);

    // After processing, ensure playerClub in gameState has its final position updated
    const playerClubInLeagueData = allClubsForLeague.find(c => c.id === gameState.playerClub.id);
    if (playerClubInLeagueData) {
        gameState.playerClub.finalLeaguePosition = playerClubInLeagueData.finalLeaguePosition;
        // Also update playerClub's leagueStats directly
        gameState.playerClub.leagueStats = { ...playerClubInLeagueData.leagueStats };
    }


    const currentLeague = gameState.leagues[0]; // Assuming one league
    const playerFinalPos = gameState.playerClub.finalLeaguePosition;
    const playerFinalPoints = gameState.playerClub.leagueStats.points;


    let seasonSummaryMessage = `Season ${gameState.currentSeason} concluded. You finished ${playerFinalPos}th in the ${currentLeague.name} with ${playerFinalPoints} points.`;
    let endSeasonModalTitle = 'Season Concluded';

    if (playerFinalPos && playerFinalPos <= currentLeague.promotedTeams) {
        endSeasonModalTitle = 'PROMOTED!';
        seasonSummaryMessage = `PROMOTED! Congratulations! You finished ${playerFinalPos}st in the ${currentLeague.name} with ${playerFinalPoints} points. Prepare for a new challenge!`;
        // Potential prize money for promotion
        const prizeMoney = getRandomInt(500, 1500); // Example prize
        gameState.playerClub.finances = clubData.addTransaction(
            gameState.playerClub.finances,
            prizeMoney,
            Constants.TRANSACTION_TYPE.PRIZE_MONEY,
            'Promotion Prize Money'
        );
        seasonSummaryMessage += ` Received £${prizeMoney.toFixed(2)} prize money.`;

        // Logic to move to next league level (future development)
        // For now, will remain in same league but this is where league ID would change.
    } else if (playerFinalPos && playerFinalPos > currentLeague.numTeams - currentLeague.relegatedTeams) {
        endSeasonModalTitle = 'RELEGATED!';
        seasonSummaryMessage = `RELEGATED! Oh no! You finished ${playerFinalPos}th in the ${currentLeague.name} with ${playerFinalPoints} points. Time for rebuilding.`;
        // Logic to move to lower league level (future development)
    }

    renderers.showModal(endSeasonModalTitle, seasonSummaryMessage, [{ text: 'Review Season', action: renderers.hideModal }]);
    gameState.messages.push({ week: gameState.currentWeek, text: seasonSummaryMessage });


    // 2. Add current season to club history
    gameState.clubHistory.push({
        season: gameState.currentSeason,
        leagueName: currentLeague.name,
        finalLeaguePosition: gameState.playerClub.finalLeaguePosition,
        leagueWins: gameState.playerClub.leagueStats.won,
        leagueDraws: gameState.playerClub.leagueStats.drawn,
        leagueLosses: gameState.playerClub.leagueStats.lost,
        cupProgress: 'No cups yet' // Placeholder for now
    });

    // 3. Reset Seasonal Stats for players and opponents
    gameState.playerClub.squad = playerData.resetPlayerSeasonStats(); // Resets player's squad stats
    opponentData.resetOpponentSeasonalStats(); // Resets opponent's league stats (like played/won etc.)
    // Important: Re-initialize leagueStats for player club as well
    gameState.playerClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };


    // 4. Increment Season and Reset Week
    gameState.currentSeason++;
    gameState.currentWeek = 1;
    gameState.gamePhase = Constants.GAME_PHASE.OFF_SEASON; // Transition to Off-Season

    // 5. Generate New Fixtures for Next Season
    // Ensure all clubs (including player's updated one and opponents) are passed for fixture generation
    currentLeague.currentSeasonFixtures = dataGenerator.generateMatchSchedule(
        gameState.playerClub.id,
        [gameState.playerClub, ...opponentData.getAllOpponentClubs()],
        gameState.currentSeason
    );
    // Important: Re-assign the entire league object back to gameState.leagues
    gameState.leagues[0] = currentLeague;

    // Set initial tasks for off-season (e.g., transfers, facility planning)
    gameState.availableHours = Constants.WEEKLY_BASE_HOURS * 2; // More hours in off-season for deeper tasks
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);

    // End of season processing finished, now UI will update and player can continue.
}

