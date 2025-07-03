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
import * as playerInteractionLogic from './playerInteractionLogic.js'; // Keep import here, pass it down
import * as committeeLogic from './committeeLogic.js'; // Correct path
import * as renderers from '../ui/renderers.js';
// REMOVED: import * as Main from '../main.js'; // This caused circular dependency


// --- Helper Functions (internal to gameLoop.js) ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Helper function to check if a specific team has a cup match scheduled for a given week.
 * @param {string} teamId - The ID of the team to check.
 * @param {number} week - The absolute game week to check.
 * @param {Array<object>} countyCupFixtures - The array of all county cup fixture blocks.
 * @returns {boolean} True if the team has a cup match this week, false otherwise.
 */
function hasCupMatchThisWeek(teamId, week, countyCupFixtures) {
    const cupWeekBlock = countyCupFixtures.find(wb => wb.week === week && wb.competition === Constants.COMPETITION_TYPE.COUNTY_CUP);
    if (cupWeekBlock) {
        return cupWeekBlock.matches.some(match =>
            (match.homeTeamId === teamId || match.awayTeamId === teamId) && match.awayTeamId !== 'BYE' // Exclude BYE matches
        );
    }
    return false;
}


/**
 * Processes the tasks that the player has allocated hours to for the current week.
 * @param {object} gameState - The current mutable gameState object.
 */
function processPlayerTasks(gameState) { // Internal helper, now receives gameState
    console.log("DEBUG: Processing weekly tasks (just logging now, outcomes handled on click)...");
    const tasksToProcess = gameState.weeklyTasks.filter(task => task.completed);

    if (tasksToProcess.length === 0 && (Constants.WEEKLY_BASE_HOURS - gameState.availableHours) > 0) {
        console.warn("DEBUG: Player allocated time but no tasks were marked as completed.");
    }

    tasksToProcess.forEach(task => {
        console.log(`DEBUG: Task: ${task.description} was marked completed this week.`);
    });

    gameState.weeklyTasks.forEach(task => {
        task.assignedHours = 0;
        task.completed = false;
    });
}

/**
 * Applies natural weekly facility changes (decay/improvement) and checks for grade degradation.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @returns {void}
 */
function applyNaturalFacilityChanges(gameState, updateUICallbacks) { // Now receives updateUICallbacks
    const facilities = gameState.playerClub.facilities;

    for (const key in facilities) {
        const facility = facilities[key];
        if (facility.level > 0) {
            let improvementAmount = 0;
            if (facility.naturalImprovementPerWeek > 0) {
                const groundsman = gameState.playerClub.committee.find(c => c.role === Constants.COMMITTEE_ROLES.GRNDS);
                improvementAmount = facility.naturalImprovementPerWeek;
                if (groundsman) {
                    improvementAmount += Math.round(groundsman.skills.groundsKeepingSkill / 2);
                }
            } else {
                improvementAmount = -getRandomInt(1, 3);
            }
            
            gameState.playerClub.facilities = clubData.updateFacilityCondition(
                gameState.playerClub.facilities, key, improvementAmount
            );

            const oldGrade = facility.grade;
            const updatedFacilitiesAfterDegradeCheck = clubData.degradeFacilityGrade(gameState.playerClub.facilities, key);
            if (updatedFacilitiesAfterDegradeCheck) {
                gameState.playerClub.facilities = updatedFacilitiesAfterDegradeCheck;
                const newGrade = gameState.playerClub.facilities[key].grade;
                renderers.showModal('Facility Degraded!', `${facility.name} condition has been poor, degrading from Grade ${oldGrade} to Grade ${newGrade}!`, [{ text: 'Drat!', action: (gs, uic, context) => {
                    gameLoop.processRemainingWeekEvents(gs, 'facility_degraded', uic); // Pass uic
                } }], gameState, updateUICallbacks, 'facility_degraded');
                gameState.messages.push({ week: gameState.currentWeek, text: `Facility Degraded: ${facility.name} from Grade ${oldGrade} to Grade ${newGrade}.` });
                return;
            }
        }
    }
}

/**
 * Applies weekly expenses to the club's finances.
 * @param {object} gameState - The current mutable gameState object.
 */
function applyWeeklyExpenses(gameState) { // Internal helper, now receives gameState
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
 * Applies match-day specific facility damage (e.g., pitch wear, changing room mess).
 * @param {object} gameState - The current mutable gameState object.
 * @param {boolean} isHomeMatch - True if the match was played at player's home ground.
 */
function applyMatchDayFacilityDamage(gameState, isHomeMatch) { // Internal helper, now receives gameState
    if (!isHomeMatch) return;

    const facilities = gameState.playerClub.facilities;
    const teamMorale = playerData.getSquad().reduce((sum, p) => sum + p.status.morale, 0) / playerData.getSquad().length;

    if (facilities[Constants.FACILITIES.PITCH].level > 0 && facilities[Constants.FACILITIES.PITCH].isUsable) {
        let pitchDamage = getRandomInt(Math.round(facilities[Constants.FACILITIES.PITCH].damagePerMatch * 0.7), facilities[Constants.FACILITIES.PITCH].damagePerMatch);

        gameState.playerClub.facilities = clubData.updateFacilityCondition(
            gameState.playerClub.facilities, Constants.FACILITIES.PITCH, -pitchDamage
        );
        gameState.messages.push({ week: gameState.currentWeek, text: `Pitch condition reduced by match wear (-${pitchDamage}%).` });
    }

    if (facilities[Constants.FACILITIES.CHGRMS].level > 0 && facilities[Constants.FACILITIES.CHGRMS].isUsable) {
        let crDamage = getRandomInt(Math.round(facilities[Constants.FACILITIES.CHGRMS].damagePerMatch * 0.7), facilities[Constants.FACILITIES.CHGRMS].damagePerMatch);
        if (teamMorale < 50) {
            const moralePenaltyFactor = (50 - teamMorale) / 50;
            crDamage += Math.round(facilities[Constants.FACILITIES.CHGRMS].damagePerMatch * 2 * moralePenaltyFactor);
        }
        crDamage = getRandomInt(Math.round(crDamage * 0.7), crDamage);

        gameState.playerClub.facilities = clubData.updateFacilityCondition(
            gameState.playerClub.facilities, Constants.FACILITIES.CHGRMS, -crDamage
        );
        gameState.messages.push({ week: gameState.currentWeek, text: `Changing rooms condition reduced by match activity (-${crDamage}%).` });
    }
}


/**
 * Updates player fitness and applies morale decay/changes.
 * @param {object} gameState - The current mutable gameState object.
 */
function updatePlayerStatus(gameState) { // Internal helper, now receives gameState
    console.log("DEBUG: Updating player status...");
    const squad = gameState.playerClub?.squad || [];
    if (!Array.isArray(squad) || squad.length === 0) {
        console.warn("DEBUG: Player squad is empty or not an array. Skipping player status update. Current squad:", squad);
        return;
    }

    gameState.playerClub.squad = squad.map(player => {
        const updatedPlayer = { ...player };

        if (updatedPlayer.status.injuryStatus === 'Fit' && !updatedPlayer.status.suspended) {
            updatedPlayer.status.fitness = Math.max(0, updatedPlayer.status.fitness - dataGenerator.getRandomInt(2, 5));
        }

        updatedPlayer.status.morale = Math.max(0, Math.min(100, updatedPlayer.status.morale - dataGenerator.getRandomInt(1, 3)));

        if (updatedPlayer.status.injuryStatus !== 'Fit' && updatedPlayer.status.injuryReturnDate) {
            if (updatedPlayer.status.injuryReturnDate === "Next Week") {
                updatedPlayer.status.injuryStatus = 'Fit';
                updatedPlayer.status.injuryReturnDate = null;
                gameState.messages.push({ week: gameState.currentWeek, text: `${updatedPlayer.name} has recovered from injury.` }); // Use passed gameState
            }
        }
        if (updatedPlayer.status.suspended && updatedPlayer.status.suspensionGames > 0) {
            updatedPlayer.status.suspensionGames--;
            if (updatedPlayer.status.suspensionGames === 0) {
                updatedPlayer.status.suspended = false;
                updatedPlayer.status.injuryStatus = 'Fit'; // Reset injury status as well if it was 'Absent'
                gameState.messages.push({ week: gameState.currentWeek, text: `${updatedPlayer.name}'s suspension has ended.` }); // Use passed gameState
            }
        }

        return updatedPlayer;
    });
    playerData.setSquad(gameState.playerClub.squad);
}

/**
 * Handles end of season logic: promotions, relegations, awards, reset stats, new fixtures.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
function endSeason(gameState, updateUICallbacks) { // Now receives updateUICallbacks
    console.log(`--- End of Season ${gameState.currentSeason} ---`);
    gameState.gamePhase = Constants.GAME_PHASE.END_OF_SEASON;

    // Find the player's current league to get its name for the summary
    const playerCurrentLeague = gameState.leagues.find(l => l.id === gameState.playerClub.currentLeagueId);
    const allClubsInGameWorld = opponentData.getAllOpponentClubs(null); // Get all clubs for processing

    // Process end of season for ALL leagues
    const updatedLeaguesAfterSeason = gameState.leagues.map(league => {
        const clubsInThisLeague = allClubsInGameWorld.filter(club => club.currentLeagueId === league.id);
        // Pass the league as an array to processEndOfSeason
        const processedLeague = leagueData.processEndOfSeason([league], clubsInThisLeague)[0]; 

        // Update currentLeagueId for promoted/relegated clubs in allClubsInGameWorld
        processedLeague.allClubsData.forEach(clubInLeague => {
            const originalClubInGameWorld = allClubsInGameWorld.find(c => c.id === clubInLeague.id);
            if (originalClubInGameWorld) {
                originalClubInGameWorld.finalLeaguePosition = clubInLeague.finalLeaguePosition; // Update final position
                // Logic for promotion/relegation and updating currentLeagueId will be handled here or in leagueData.processEndOfSeason
                // For now, assume processEndOfSeason handles updating currentLeagueId for clubs in allClubsInGameWorld
            }
        });
        return processedLeague;
    });
    gameState.leagues = updatedLeaguesAfterSeason;

    // Update player club's final position and league stats from the updated allClubsInGameWorld
    const playerClubInGameWorld = allClubsInGameWorld.find(c => c.id === gameState.playerClub.id);
    if (playerClubInGameWorld) {
        gameState.playerClub.finalLeaguePosition = playerClubInGameWorld.finalLeaguePosition;
        gameState.playerClub.leagueStats = { ...playerClubInGameWorld.leagueStats };
        gameState.playerClub.currentLeagueId = playerClubInGameWorld.currentLeagueId; // Ensure currentLeagueId is updated
    }


    const playerFinalPos = gameState.playerClub.finalLeaguePosition;
    const playerFinalPoints = gameState.playerClub.leagueStats.points;


    let seasonSummaryMessage = `Season ${gameState.currentSeason} concluded. You finished ${playerFinalPos}th in the ${playerCurrentLeague?.name || 'your league'} with ${playerFinalPoints} points.`;
    let endSeasonModalTitle = 'Season Concluded';

    if (playerFinalPos && playerCurrentLeague) {
        if (playerFinalPos <= playerCurrentLeague.promotedTeams) {
            endSeasonModalTitle = 'PROMOTED!';
            seasonSummaryMessage = `PROMOTED! Congratulations! You finished ${playerFinalPos}st in the ${playerCurrentLeague.name} with ${playerFinalPoints} points. Prepare for a new challenge!`;
            const prizeMoney = dataGenerator.getRandomInt(500, 1500);
            gameState.playerClub.finances = clubData.addTransaction(
                gameState.playerClub.finances,
                prizeMoney,
                Constants.TRANSACTION_TYPE.PRIZE_MONEY,
                'Promotion Prize Money'
            );
            seasonSummaryMessage += ` Received £${prizeMoney.toFixed(2)} prize money.`;
        } else if (playerFinalPos > (playerCurrentLeague.numTeams - playerCurrentLeague.relegatedTeams)) {
            endSeasonModalTitle = 'RELEGATED!';
            seasonSummaryMessage = `RELEGATED! Oh no! You finished ${playerFinalPos}th in the ${playerCurrentLeague.name} with ${playerFinalPoints} points. Time for rebuilding.`;
        }
    }

    renderers.showModal(endSeasonModalTitle, seasonSummaryMessage, [{ text: 'Review Season', action: (gs, uic, context) => {
        renderers.hideModal();
        gameLoop.finalizeWeekProcessing(gs, 'end_of_season_review', uic); // Pass uic
    } }], gameState, updateUICallbacks, 'end_of_season_review');
    gameState.messages.push({ week: gameState.currentWeek, text: `Season ${gameState.currentSeason} concluded.` });


    gameState.playerClub.squad = playerData.resetPlayerSeasonStats();
    opponentData.resetOpponentSeasonalStats(); // Resets stats for all AI clubs
    
    // Reset league stats for player club
    gameState.playerClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    
    // Reset cup status for next season
    gameState.countyCup = {
        competitionId: dataGenerator.generateUniqueId('CUP'),
        teams: [...opponentData.getAllOpponentClubs(null)], // Start with ALL clubs in game world for next season's cup pool
        fixtures: [],
        currentRound: 0,
        playerTeamStatus: 'Active', // Player team is active in cup for new season
        opponentToCustomize: null
    };

    // No need to add extra cup opponents here, as generateRegionalClubPool already created all 60.
    // The cup draw logic will pull from allClubsInGameWorld.

    gameState.currentSeason++;
    gameState.currentWeek = 1;
    gameState.gamePhase = Constants.GAME_PHASE.OFF_SEASON;

    // Regenerate league fixtures for all leagues for new season
    gameState.leagues.forEach(league => {
        league.currentSeasonFixtures = dataGenerator.generateMatchSchedule(
            gameState.playerClub.id,
            league.allClubsData, // Pass only clubs relevant to this league
            gameState.currentSeason,
            Constants.COMPETITION_TYPE.LEAGUE
        );
    });

    renderers.renderGameScreen('homeScreen');
    renderers.showModal(`Season ${gameState.currentSeason - 1} Concluded!`, `Prepare for Season ${gameState.currentSeason}.`, [{ text: 'Continue', action: (gs, uic, context) => {
        renderers.hideModal();
        gameLoop.finalizeWeekProcessing(gs, 'season_start_continue', uic); // Pass uic
    } }], gameState, updateUICallbacks, 'season_start_continue');
}


/**
 * Advances the game by one week. This is the central function called from main.js.
 * It initiates the sequence of events for the current week.
 * @param {object} gameState - The current mutable gameState object.
 * @param {number} [resumeStep=0] - Internal parameter to resume week processing from a specific step.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @returns {boolean} True if an interactive modal was displayed by this execution of advanceWeek,
 * false otherwise. If true, the caller (main.js) should NOT finalize the week, but
 * wait for the modal's action to trigger processAIMatchesAndFinalizeWeek or finalizeWeekProcessing.
 */
export function advanceWeek(gameState, resumeStep = 0, updateUICallbacks) { // Now receives updateUICallbacks
    console.log(`--- Starting processing for Season ${gameState.currentSeason}, Week ${gameState.currentWeek} (Resume Step: ${resumeStep}) ---`);

    // NEW: Set processing flag to true at the very start of the week's processing
    // Use gameState directly, as Main.gameState might not be updated yet in some contexts
    gameState.isProcessingWeek = true; 

    // Define currentMonthBlock and currentMonthName at the top of the function
    const currentMonthBlock = Constants.GAME_WEEK_TO_MONTH_MAP.find(block => {
        let cumulative = 0;
        for(let i=0; i<Constants.GAME_WEEK_TO_MONTH_MAP.indexOf(block); i++) {
            cumulative += Constants.GAME_WEEK_TO_MONTH_MAP[i].weeks;
        }
        return gameState.currentWeek > cumulative && gameState.currentWeek <= cumulative + block.weeks;
    });
    const currentMonthName = currentMonthBlock ? Constants.MONTH_NAMES[(Constants.SEASON_START_MONTH_INDEX + currentMonthBlock.monthIdxOffset) % 12] : '';


    if (gameState.gamePhase === Constants.GAME_PHASE.SETUP || gameState.gamePhase === Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION) {
         renderers.showModal('Game Not Ready', 'Complete game setup and customization before advancing the week.', [{text: 'Continue', action: (gs, uic, context) => renderers.hideModal(), isPrimary: true }], gameState, updateUICallbacks, 'game_not_ready');
         return true; // This modal should block progression
    }

    // If this is the initial call for the week, do the basic weekly setup
    if (resumeStep === 0) {
        processPlayerTasks(gameState); // Now correctly called as an internal function
        applyNaturalFacilityChanges(gameState, updateUICallbacks); // Now correctly called as an internal function, pass updateUICallbacks
        if (renderers.getModalDisplayStatus() === 'flex') { return true; } 
        applyWeeklyExpenses(gameState); // Now correctly called as an internal function
        if (renderers.getModalDisplayStatus() === 'flex') { return true; } 
    }

    // --- Ordered Processing of Weekly Events ---
    // Each step checks if a modal is already active. If not, it attempts to trigger its event.
    // If an event triggers a modal, it returns true, and the modal's dismissal will call
    // processRemainingWeekEvents to continue.

    // Step 1: Committee Meeting
    if (resumeStep <= 1 && gameState.currentWeek > 0 && gameState.currentWeek % Constants.COMMITTEE_MEETING_FREQUENCY_WEEKS === 0 && renderers.getModalDisplayStatus() === 'none') {
        console.log("DEBUG: Monthly committee meeting scheduled.");
        committeeLogic.startCommitteeMeeting(gameState, updateUICallbacks); // Pass updateUICallbacks
        gameState.messages.push({ week: gameState.currentWeek, text: `Monthly committee meeting held.` });
        return true; // Modal shown, execution stops here
    }

    // Step 2: Random Event
    if (resumeStep <= 2 && (gameState.currentWeek > Constants.PRE_SEASON_WEEKS || gameState.gamePhase === Constants.GAME_PHASE.PRE_SEASON_PLANNING) && renderers.getModalDisplayStatus() === 'none') {
        const eventMultiplier = (currentMonthName === 'December') ? Constants.DECEMBER_BAD_EVENT_CHANCE_MULTIPLIER : 1;
        // Pass playerInteractionLogic to eventLogic.triggerRandomEvent
        const triggeredEvent = eventLogic.triggerRandomEvent(gameState, eventMultiplier, updateUICallbacks, playerInteractionLogic); // Pass updateUICallbacks, playerInteractionLogic
        if (triggeredEvent) {
            gameState.messages.push({ week: gameState.currentWeek, text: `${triggeredEvent.title}: ${triggeredEvent.description}` });
            return true; // Modal shown, execution stops here
        }
    }

    // --- Match Logic & Cup Announcements: Order is CRITICAL ---
    const isLeagueMatchCalendarWeek = currentMonthBlock && currentMonthBlock.isLeague;
    const isCupMatchWeek = Constants.COUNTY_CUP_MATCH_WEEKS.includes(gameState.currentWeek);

    // Step 3: County Cup Match (Takes precedence for player's match)
    // If it's a cup match week, handle the player's cup match or week off.
    // This will either show a match briefing modal or a "week off" modal.
    if (resumeStep <= 3 && renderers.getModalDisplayStatus() === 'none' && isCupMatchWeek) {
        handleCountyCupMatch(gameState, updateUICallbacks); // Pass updateUICallbacks
        return true; // Stop here, modal dismissal will continue the flow
    }

    // Step 4: League Match (Only if NOT a dedicated Cup Match Week)
    // If it's a regular league week and not a cup match week, simulate league matches.
    if (resumeStep <= 4 && renderers.getModalDisplayStatus() === 'none' && isLeagueMatchCalendarWeek && !isCupMatchWeek && gameState.playerClub?.currentLeagueId) { // Check for playerClub.currentLeagueId
        const currentAbsoluteGameWeek = gameState.currentWeek;
        // Find the player's current league
        const playerCurrentLeague = gameState.leagues.find(l => l.id === gameState.playerClub.currentLeagueId);
        let currentWeekLeagueBlock = playerCurrentLeague?.currentSeasonFixtures.find(wb =>
            wb.week === currentAbsoluteGameWeek && wb.competition === Constants.COMPETITION_TYPE.LEAGUE
        );

        if (currentWeekLeagueBlock && currentWeekLeagueBlock.matches.length > 0) {
            const matchesToProcess = [];
            const matchesToReschedule = [];

            // Iterate over a copy of the matches to avoid issues with modification during iteration
            for (const match of [...currentWeekLeagueBlock.matches]) {
                const homeTeamHasCupMatch = hasCupMatchThisWeek(match.homeTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures);
                const awayTeamHasCupMatch = hasCupMatchThisWeek(match.awayTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures);

                if (homeTeamHasCupMatch || awayTeamHasCupMatch) {
                    // Reschedule this league match
                    const rescheduled = leagueData.rescheduleLeagueMatch(
                        gameState.leagues, // Pass all leagues
                        match.homeTeamId, // Pass home team ID
                        match.awayTeamId, // Pass away team ID
                        currentAbsoluteGameWeek,
                        // Use findNextAvailableLeagueWeek to get a valid future slot
                        leagueData.findNextAvailableLeagueWeek(gameState.leagues, gameState.playerClub.id, Constants.TOTAL_LEAGUE_WEEKS + 1) // Start search after regular season
                    );
                    if (rescheduled) {
                        gameState.leagues = rescheduled;
                        gameState.messages.push({ week: gameState.currentWeek, text: `League match between ${match.homeTeamName} and ${match.awayTeamName} rescheduled due to cup clash.` });
                        matchesToReschedule.push(match.id); // Mark for removal from currentWeekLeagueBlock
                    }
                } else {
                    matchesToProcess.push(match);
                }
            }

            // Update currentWeekLeagueBlock.matches by filtering out rescheduled ones
            if (matchesToReschedule.length > 0) {
                currentWeekLeagueBlock.matches = currentWeekLeagueBlock.matches.filter(match => !matchesToReschedule.includes(match.id));
                // IMPORTANT: Since we modified currentWeekLeagueBlock.matches, we need to update the league's fixtures array
                // with this new version of the week block. Otherwise, the original fixtures object still contains the rescheduled matches.
                const leagueFixtureBlockIndex = playerCurrentLeague.currentSeasonFixtures.findIndex(wb => wb.week === currentAbsoluteGameWeek && wb.competition === Constants.COMPETITION_TYPE.LEAGUE);
                if (leagueFixtureBlockIndex !== -1) {
                    playerCurrentLeague.currentSeasonFixtures[leagueFixtureBlockIndex] = { ...currentWeekLeagueBlock };
                }
            }

            const playerMatch = matchesToProcess.find(match =>
                match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id
            );

            if (playerMatch) {
                if (!gameState.playerClub.facilities[Constants.FACILITIES.PITCH].isUsable && playerMatch.homeTeamId === gameState.playerClub.id && renderers.getModalDisplayStatus() === 'none') {
                    renderers.showModal('Match Postponed!', `Your pitch is unplayable! The home match against ${playerMatch.awayTeamName} has been postponed.`, [{ text: 'Drat!', action: (gs, uic, context) => {
                        renderers.hideModal();
                        processAIMatchesAndFinalizeWeek(gs, playerMatch.id, uic); // Pass playerMatch.id, uic
                    } }], gameState, updateUICallbacks, 'match_postponed');
                    gameState.messages.push({ week: gameState.currentWeek, text: `Home match against ${playerMatch.awayTeamName} postponed due to unplayable pitch.` });
                    playerMatch.result = "P-P";
                    playerMatch.played = true;
                    return true;
                } else if (renderers.getModalDisplayStatus() === 'none') {
                    matchLogic.preMatchBriefing(gameState, playerMatch, updateUICallbacks); // Pass updateUICallbacks
                    return true;
                }
            } else if (matchesToProcess.length > 0) {
                // If no player match, but there are AI league matches that didn't clash, process them
                processAIMatchesAndFinalizeWeek(gameState, null, updateUICallbacks); // Pass null for playerMatchId, uic
                return true; // This will show a modal if AI matches were played, or finalize if not.
            }
        }
    }

    // Step 5: Quiet Week (Fallback if no other major event/match happened)
    // Only show if no other modal is currently active.
    if (resumeStep <= 5 && renderers.getModalDisplayStatus() === 'none') {
        // Collect all AI matches for this week (both league and cup)
        const currentAbsoluteGameWeek = gameState.currentWeek;
        // Find player's current league to get its fixtures
        const playerCurrentLeague = gameState.leagues.find(l => l.id === gameState.playerClub?.currentLeagueId); // Optional chaining
        const leagueWeekBlock = playerCurrentLeague?.currentSeasonFixtures.find(wb => wb.week === currentAbsoluteGameWeek && wb.competition === Constants.COMPETITION_TYPE.LEAGUE);
        const currentWeekCupBlock = gameState.countyCup.fixtures.find(block => block.week === currentAbsoluteGameWeek && block.competition === Constants.COMPETITION_TYPE.COUNTY_CUP);

        let allAIMatchesForWeek = [];
        if (leagueWeekBlock && leagueWeekBlock.matches.length > 0) {
            allAIMatchesForWeek.push(...leagueWeekBlock.matches.filter(match =>
                !match.played && match.result === null && // Only unplayed matches
                !hasCupMatchThisWeek(match.homeTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures) && // Home team not in cup
                !hasCupMatchThisWeek(match.awayTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures) // Away team not in cup
            ));
        }
        if (currentWeekCupBlock && currentWeekCupBlock.matches.length > 0) {
            allAIMatchesForWeek.push(...currentWeekCupBlock.matches.filter(match =>
                match.homeTeamId !== gameState.playerClub?.id && match.awayTeamId !== gameState.playerClub?.id && // Ensure it's an AI match, optional chaining
                !match.played && match.awayTeamId !== 'BYE'
            ));
        }

        if (allAIMatchesForWeek.length > 0) {
            renderers.showModal('Quiet Week (AI Matches Played)', 'No direct events for you, but other matches were played this week.', [], gameState, updateUICallbacks, 'quiet_week');
            processAIMatchesAndFinalizeWeek(gameState, null, updateUICallbacks); // Pass null for playerMatchId, uic
        } else {
            renderers.showModal('Quiet Week', 'Nothing major happened this week. Focus on building your club!', [], gameState, updateUICallbacks, 'quiet_week');
            console.log(gameState.currentWeek)
            gameState.messages.push({ week: gameState.currentWeek, text: `A quiet week in the season.` });
            finalizeWeekProcessing(gameState, 'quiet_week', updateUICallbacks); // Directly finalize if truly quiet, pass uic
        }
        return true;
    }

    // If we reach here, it means all possible events for the week have been processed or skipped,
    // and no modal was displayed by this direct execution path.
    // This typically means a modal was already active from a prior step (e.g., a task completion).
    console.log("DEBUG: advanceWeek finished, no new modal triggered. Assuming prior modal handled continuation.");
    // If no modal was triggered by advanceWeek, then finalize the week directly.
    finalizeWeekProcessing(gameState, 'no_modal_triggered_by_advance_week', updateUICallbacks); // Call finalize directly, pass uic
    return false; // Indicate no modal was shown by this direct call
}

/**
 * Orchestrates the continuation of weekly processing after a modal is dismissed.
 * This is called by the action handlers of modals.
 * @param {object} gameState - The mutable gameState.
 * @param {string} dismissalContext - The context from which the modal was dismissed.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
export function processRemainingWeekEvents(gameState, dismissalContext, updateUICallbacks) { // Now receives updateUICallbacks
    console.log(`DEBUG: processRemainingWeekEvents called. Context: ${dismissalContext}.`);

    // Determine the current step based on the dismissal context to resume from the next logical step
    let nextStepToResume = 0; // Default to start of week processing if context is unclear

    // Map dismissal contexts to the *next* step to resume from in advanceWeek
    switch (dismissalContext) {
        case 'game_not_ready':
        case 'allocate_more_time':
            nextStepToResume = 0; // Restart week processing if these early modals were dismissed
            break;
        case 'facility_degraded': // Dismissed a facility modal
            nextStepToResume = 2; // Resume from Random Event check
            break;
        case 'monthly_committee_meeting': // Dismissed a committee modal (start, passed, failed, input error)
        case 'committee_no_proposals':
        case 'committee_meeting_start':
        case 'proposal_passed':
        case 'proposal_failed':
        case 'club_identity_updated':
        case 'kit_colors_updated':
        case 'input_error':
            nextStepToResume = 2; // Resume from Random Event check
            break;
        case 'random_event': // Dismissed a random event modal
            nextStepToResume = 3; // Resume from County Cup Match check
            break;
        case 'pre_match_briefing': // Dismissed match briefing (player match about to start)
        case 'half_time_options': // Dismissed half-time options
        case 'half-time-action-outcome': // Dismissed half-time action outcome
            nextStepToResume = 5; // After player match, go to Quiet Week check (cup announcement now in finalize)
            break;
        case 'match_postponed': // Player's league match postponed
        case 'cup_match_bye_player': // Player had a bye in cup
        case 'cup_match_unexpected_status': // Player had unexpected cup status
        case 'ai_matches_summary': // Dismissed AI match summary (after player match or AI-only week)
        case 'cup_match_eliminated_ai_only': // Player eliminated, AI matches processed
        case 'cup_match_bye_ai_only': // Player had bye, AI matches processed
        case 'cup_match_none_or_eliminated': // No cup match, or eliminated
        case 'cup_match_no_player_match_ai_only': // No player cup match, AI matches processed
        case 'opponent_not_found_pre_match': // Added for safety if opponent not found
            nextStepToResume = 5; // After match processing (player or AI), go to Quiet Week check (cup announcement now in finalize)
            break;
        case 'quiet_week': // Dismissed quiet week
            nextStepToResume = 6; // Quiet week is the very last step in advanceWeek, so finalize
            break;
        // Contexts that indicate full week processing is done or game state changes
        case 'game_loaded':
        case 'welcome_new_game':
        case 'club_born':
        case 'rivals_customized':
        case 'game_loaded_confirm':
        case 'no_save_found':
        case 'new_game_confirm':
        case 'season_start_continue':
        case 'end_of_season_review':
        case 'no_modal_triggered_by_advance_week': // Added for direct finalize call
        // ADDED: Contexts from cup announcement modals that should lead to finalization
        case 'cup_draw_no_match':
        case 'cup_draw_normal':
        case 'cup_draw_bye':
        case 'cup_draw_with_customization': // Modified this case
        case 'cup_opponent_customized_final': // NEW: Specific context for cup opponent customization completion
            nextStepToResume = 7; // These contexts mean the week is fully processed or game is starting/ending
            break;
        default:
            console.warn(`DEBUG: Unhandled dismissal context: ${dismissalContext}. Resuming from step 0.`);
            nextStepToResume = 0;
            break;
    }

    // Now, call advanceWeek again, telling it where to resume.
    // If nextStepToResume === 7, it means the week's processing is complete, so we finalize.
    if (nextStepToResume === 7) {
        finalizeWeekProcessing(gameState, dismissalContext, updateUICallbacks); // Pass updateUICallbacks
    } else {
        advanceWeek(gameState, nextStepToResume, updateUICallbacks); // Pass updateUICallbacks
    }
}



/**
 * Handles the simulation of AI-only matches for the current week and then finalizes the week processing.
 * This function now *always* retrieves the relevant matches for the current week from gameState.
 * @param {object} gameState - The current mutable gameState.
 * @param {string|null} playerMatchId - The ID of the player's match for the week, or null if none.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
export function processAIMatchesAndFinalizeWeek(gameState, playerMatchId, updateUICallbacks) { // currentWeekBlock parameter removed, updateUICallbacks added
    console.log(`DEBUG: processAIMatchesAndFinalizeWeek called. Simulating AI matches for Week ${gameState.currentWeek}.`);
    
    let aiMatchesPlayed = false;

    const currentAbsoluteGameWeek = gameState.currentWeek;
    // Iterate through all leagues to find their respective current week blocks
    let allLeagueWeekBlocks = [];
    if (gameState.leagues && gameState.leagues.length > 0) {
        gameState.leagues.forEach(league => {
            const leagueBlock = league.currentSeasonFixtures.find(wb => wb.week === currentAbsoluteGameWeek && wb.competition === Constants.COMPETITION_TYPE.LEAGUE);
            if (leagueBlock) {
                allLeagueWeekBlocks.push(leagueBlock);
            }
        });
    }

    const currentWeekCupBlock = gameState.countyCup.fixtures.find(block => block.week === currentAbsoluteGameWeek && block.competition === Constants.COMPETITION_TYPE.COUNTY_CUP);

    let allAIMatchesForWeek = [];

    // Collect AI league matches from all leagues that should be played this week
    allLeagueWeekBlocks.forEach(leagueWeekBlock => {
        const nonRescheduledLeagueMatches = leagueWeekBlock.matches.filter(match =>
            match.id !== playerMatchId && // Exclude player's match if it was passed
            !match.played && match.result === null && // Only unplayed matches
            !hasCupMatchThisWeek(match.homeTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures) && // Home team not in cup
            !hasCupMatchThisWeek(match.awayTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures) // Away team not in cup
        );
        allAIMatchesForWeek.push(...nonRescheduledLeagueMatches);
    });


    // Collect AI cup matches that should be played this week
    if (currentWeekCupBlock && currentWeekCupBlock.matches.length > 0) {
        const aiCupMatches = currentWeekCupBlock.matches.filter(match =>
            match.id !== playerMatchId && // Exclude player's match if it was passed
            match.homeTeamId !== gameState.playerClub?.id && match.awayTeamId !== gameState.playerClub?.id && // Ensure it's an AI match, optional chaining for playerClub
            !match.played && match.awayTeamId !== 'BYE' // Only unplayed and not BYE matches
        );
        allAIMatchesForWeek.push(...aiCupMatches);
    }

    console.log("DEBUG: Matches identified for AI simulation:", allAIMatchesForWeek.map(m => `${m.homeTeamName} vs ${m.awayTeamName} (${m.competition})`));


    for (const match of allAIMatchesForWeek) {
        const matchResult = matchLogic.simulateMatch(
            match.homeTeamId,
            match.awayTeamId,
            gameState.playerClub,
            opponentData.getAllOpponentClubs(null), // Pass all clubs for simulation
            playerData.getSquad() // Pass playerData.getSquad() for consistency, though it's only used if playerClub matches
        );

        // Update the specific fixture block for the simulated match
        if (match.competition === Constants.COMPETITION_TYPE.LEAGUE) {
            // Find the correct league for this match by checking if either team is in its allClubsData
            const targetLeague = gameState.leagues.find(l => l.allClubsData.some(c => c.id === match.homeTeamId || c.id === match.awayTeamId));
            if (targetLeague) {
                const targetLeagueBlock = targetLeague.currentSeasonFixtures.find(wb => wb.week === match.week && wb.competition === Constants.COMPETITION_TYPE.LEAGUE);
                if (targetLeagueBlock) {
                    const matchIndexInBlock = targetLeagueBlock.matches.findIndex(m => m.id === match.id);
                    if (matchIndexInBlock !== -1) {
                        targetLeagueBlock.matches[matchIndexInBlock].result = `${matchResult.homeScore}-${matchResult.awayScore}`;
                        targetLeagueBlock.matches[matchIndexInBlock].played = true;
                    }
                }
                // Update league table stats for the specific league
                gameState.leagues = leagueData.updateLeagueTable(
                    gameState.leagues,
                    targetLeague.id, // Pass the ID of the specific league
                    match.homeTeamId,
                    match.awayTeamId,
                    matchResult.homeScore,
                    matchResult.awayScore
                );
            } else {
                console.warn(`WARNING: League not found for AI match ${match.homeTeamName} vs ${match.awayTeamName}. Cannot update table.`);
            }
        } else if (match.competition === Constants.COMPETITION_TYPE.COUNTY_CUP) {
            const targetCupBlock = gameState.countyCup.fixtures.find(wb => wb.week === match.week && wb.competition === Constants.COMPETITION_TYPE.COUNTY_CUP);
            if (targetCupBlock) {
                const matchIndexInBlock = targetCupBlock.matches.findIndex(m => m.id === match.id);
                if (matchIndexInBlock !== -1) {
                    targetCupBlock.matches[matchIndexInBlock].result = `${matchResult.homeScore}-${matchResult.awayScore}`;
                    targetCupBlock.matches[matchIndexInBlock].played = true;
                }
            }
            // Determine winner/loser for cup progression
            const homeTeamWon = matchResult.homeScore > matchResult.awayScore;
            const awayTeamWon = matchResult.awayScore > matchResult.homeScore;

            // Update inCup and eliminatedFromCup status for AI teams in the cup
            gameState.countyCup.teams = gameState.countyCup.teams.map(team => {
                if (team.id === matchResult.homeTeamId) {
                    return { ...team, inCup: homeTeamWon, eliminatedFromCup: !homeTeamWon };
                }
                if (team.id === matchResult.awayTeamId) {
                    return { ...team, inCup: awayTeamWon, eliminatedFromCup: !awayTeamWon };
                }
                return team;
            });
        }
        console.log(`DEBUG: AI match simulated: ${matchResult.homeTeamName} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeamName} (${match.competition})`);
        aiMatchesPlayed = true;
    }

    // Ensure opponentData's global list is updated with the latest state of all clubs
    // Flatten all league clubs from all leagues, then add cup teams and player club
    const allClubsAfterAIMatches = Array.from(new Map([
        ...(gameState.leagues.flatMap(league => league.allClubsData) || []).map(c => [c.id, c]),
        ...(gameState.countyCup?.teams || []).map(c => [c.id, c]),
        [gameState.playerClub?.id, gameState.playerClub] // Ensure player club is also included, optional chaining
    ]).values());
    opponentData.setAllOpponentClubs(allClubsAfterAIMatches);


    // Update player club's league stats from the comprehensive list after all AI matches are done
    const playerClubInAllClubs = allClubsAfterAIMatches.find(c => c.id === gameState.playerClub?.id); // Optional chaining
    if (playerClubInAllClubs && gameState.playerClub) { // Ensure playerClub exists
        gameState.playerClub.leagueStats = { ...playerClubInAllClubs.leagueStats };
    }

    updateUICallbacks.updateUI(); // Use passed updateUICallbacks

    if (aiMatchesPlayed && renderers.getModalDisplayStatus() === 'none') {
        renderers.showModal('Matches Played', `Other matches were played this week.`, [], gameState, updateUICallbacks, 'ai_matches_summary');
        gameState.messages.push({ week: gameState.currentWeek, text: `Other matches played this week.` });
    } else {
        finalizeWeekProcessing(gameState, 'no_ai_matches_or_modal_active', updateUICallbacks); // Pass updateUICallbacks
    }
}

/**
 * Handles the announcement and draw for a county cup round.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
export function handleCountyCupAnnouncement(gameState, updateUICallbacks) { // Now receives updateUICallbacks
    const currentRoundWeek = gameState.currentWeek;
    const currentRoundNum = Constants.COUNTY_CUP_ANNOUNCEMENT_WEEKS.indexOf(currentRoundWeek) + 1;
    gameState.countyCup.currentRound = currentRoundNum;
    
    // --- FIX: Filter out eliminated teams strictly from the pool for the draw ---
    // Only include teams that are explicitly inCup === true AND not eliminatedFromCup === true
    let teamsInCup = gameState.countyCup.teams.filter(team => team.inCup === true && team.eliminatedFromCup === false && team.id !== 'BYE');
    
    // Ensure player's team is explicitly added if they are active and not already in the filtered list
    // This handles cases where playerClub might not be in countyCup.teams initially or its status is outdated.
    if (gameState.countyCup.playerTeamStatus === 'Active' && gameState.playerClub && !teamsInCup.some(t => t.id === gameState.playerClub.id)) { // Optional chaining
        teamsInCup.push(gameState.playerClub); // Use passed gameState.playerClub
    }
    // --- END FIX ---

    if (gameState.countyCup.playerTeamStatus === 'Eliminated' || teamsInCup.length < 2) {
        const message = gameState.countyCup.playerTeamStatus === 'Eliminated' ?
            'You have already been eliminated from the County Cup. No draw for you this round.' :
            'The County Cup draw is announced, but there are not enough teams for a full round.';
        renderers.showModal('County Cup Draw', message, [], gameState, updateUICallbacks, 'cup_draw_no_match');
        return;
    }

    let playerInCup = teamsInCup.find(t => t.id === gameState.playerClub?.id); // Optional chaining
    if (!playerInCup && gameState.countyCup.playerTeamStatus === 'Active') {
        // This block might be redundant if the above filtering is robust, but keeping for safety.
        teamsInCup.push(gameState.playerClub); // Use passed gameState.playerClub
    } else if (playerInCup && gameState.countyCup.playerTeamStatus === 'Not Entered') {
        gameState.countyCup.playerTeamStatus = 'Active';
    }

    const matchWeekForThisRound = Constants.COUNTY_CUP_MATCH_WEEKS[currentRoundNum - 1];
    const cupFixturesThisRound = leagueData.generateCupFixtures(
        gameState.countyCup.competitionId,
        teamsInCup, // Pass the filtered list of teams
        gameState.currentSeason,
        matchWeekForThisRound
    );

    if (cupFixturesThisRound.length > 0) {
        const existingBlockIndex = gameState.countyCup.fixtures.findIndex(fb => fb.week === matchWeekForThisRound && fb.competition === Constants.COMPETITION_TYPE.COUNTY_CUP);
        if (existingBlockIndex !== -1) {
            gameState.countyCup.fixtures[existingBlockIndex] = {
                week: matchWeekForThisRound,
                competition: Constants.COMPETITION_TYPE.COUNTY_CUP,
                matches: cupFixturesThisRound
            };
        } else {
            gameState.countyCup.fixtures.push({
                week: matchWeekForThisRound,
                competition: Constants.COMPETITION_TYPE.COUNTY_CUP,
                matches: cupFixturesThisRound
            });
        }
    }

    let drawMessage = `The draw for County Cup ${Constants.COUNTY_CUP_ROUND_NAMES[matchWeekForThisRound]} is out!\n\n`;
    const playerMatch = cupFixturesThisRound.find(match =>
        match.homeTeamId === gameState.playerClub?.id || match.awayTeamId === gameState.playerClub?.id // Optional chaining
    );

    // Log playerMatch details for debugging
    console.log("DEBUG: handleCountyCupAnnouncement - playerMatch:", playerMatch);
    console.log("DEBUG: handleCountyCupAnnouncement - matchWeekForThisRound:", matchWeekForThisRound);


    if (playerMatch) {
        drawMessage += `Your match: **${playerMatch.homeTeamName} vs ${playerMatch.awayTeamName}**\n\n`;
        // --- FIX START: Ensure opponentClubFromOutsideLeague is correctly checked and used ---
        if (playerMatch.opponentClubFromOutsideLeague && playerMatch.opponentClubFromOutsideLeague.id !== 'BYE') { // Ensure it's a real club
            gameState.countyCup.opponentToCustomize = playerMatch.opponentClubFromOutsideLeague;
            drawMessage += `You've drawn a team from outside your league: ${playerMatch.opponentClubFromOutsideLeague.name}! You can customize them before the match.`;
            renderers.showModal('County Cup Draw!', drawMessage, [
                { text: 'Customize Opponent', action: (gs, uic, context) => {
                    renderers.hideModal();
                    // Pass 'cup_opponent' context to the customization modal
                    renderers.renderOpponentCustomizationModal([gs.countyCup.opponentToCustomize], 'cup_opponent');
                    // Nested modal for customization. Its "Save & Continue" action will handle progression.
                    renderers.showModal(`Customize ${gs.countyCup.opponentToCustomize.name}`, `You can adjust the name and colors of this cup opponent. They might be a team you encounter in higher leagues!`, [{ text: 'Save & Continue', action: (gsInner, uicInner, contextInner) => {
                        const customizedOpponent = {};
                        const opponentItem = document.getElementById('opponentListCustomization').querySelector('.opponent-custom-item');
                        if (opponentItem) {
                            const clubId = opponentItem.querySelector('input[data-field="name"]').dataset.clubId;
                            const name = opponentItem.querySelector(`input[data-field="name"][data-club-id="${clubId}"]`).value.trim();
                            const nickname = opponentItem.querySelector(`input[data-field="nickname"][data-club-id="${clubId}"]`).value.trim();
                            const primaryColor = opponentItem.querySelector(`input[data-field="primaryColor"][data-club-id="${clubId}"]`).value;
                            const secondaryColor = opponentItem.querySelector(`input[data-field="secondaryColor"][data-club-id="${clubId}"]`).value;
                            Object.assign(customizedOpponent, {id: clubId, name, nickname, kitColors: {primary: primaryColor, secondary: secondaryColor}});
                        }
                        
                        // Update the opponent in the main allClubsInGameWorld list
                        const globalOpponentList = opponentData.getAllOpponentClubs(null); // Get current global list
                        const globalOpponentIndex = globalOpponentList.findIndex(t => t.id === customizedOpponent.id);
                        if (globalOpponentIndex !== -1) {
                            Object.assign(globalOpponentList[globalOpponentIndex], customizedOpponent);
                            opponentData.setAllOpponentClubs(globalOpponentList); // Update the global list
                        } else {
                            // This case should ideally not happen if opponentData.getAllOpponentClubs(null)
                            // already includes opponentToCustomize, but as a fallback:
                            opponentData.setAllOpponentClubs([...globalOpponentList, customizedOpponent]);
                        }

                        // Update in countyCup.teams as well
                        const cupTeamIndex = gsInner.countyCup.teams.findIndex(t => t.id === customizedOpponent.id);
                        if(cupTeamIndex !== -1) {
                            Object.assign(gsInner.countyCup.teams[cupTeamIndex], customizedOpponent);
                        }
                        
                        renderers.hideOpponentCustomizationModal();
                        // Show final confirmation modal after customization, then finalize week.
                        renderers.showModal('Opponent Customized!', `You've customized ${customizedOpponent.name}. Your County Cup match against them is scheduled for ${Main.getCalendarWeekString(matchWeekForThisRound)}.`, [{ text: 'Continue', action: (gsFinal, uicFinal, contextFinal) => {
                            renderers.hideModal();
                            console.log("DEBUG: Final customization modal 'Continue' clicked. Calling finalizeWeekProcessing with 'cup_opponent_customized_final'.");
                            gameLoop.finalizeWeekProcessing(gsFinal, 'cup_opponent_customized_final', uicFinal); // Pass new context, uicFinal
                        }}], gsInner, uicInner, contextInner); // Pass all necessary state and callbacks
                    }, isPrimary: true }]
                    , gameState, updateUICallbacks, 'cup_draw_with_customization'); // Use gameState, updateUICallbacks
                }, isPrimary: true },
                { text: 'Continue Without Customizing', action: (gs, uic, context) => {
                    renderers.hideModal();
                    // Show final confirmation modal when skipping customization, then finalize week.
                    const opponentName = playerMatch.homeTeamId === gs.playerClub?.id ? playerMatch.awayTeamName : playerMatch.homeTeamName; // Optional chaining
                    renderers.showModal('County Cup Draw Confirmed!', `Your County Cup match against ${opponentName} is scheduled for ${Main.getCalendarWeekString(matchWeekForThisRound)}.`, [{ text: 'Continue', action: (gsFinal, uicFinal, contextFinal) => {
                        renderers.hideModal();
                        console.log("DEBUG: Skip customization modal 'Continue' clicked. Calling finalizeWeekProcessing with 'cup_draw_normal'.");
                        gameLoop.finalizeWeekProcessing(gsFinal, 'cup_draw_normal', uicFinal); // Pass context, uicFinal
                    }}], gameState, updateUICallbacks, 'cup_draw_normal'); // Use gameState, updateUICallbacks
                } }
            ], gameState, updateUICallbacks, 'cup_draw_with_customization');
        } else { // No external opponent, or BYE
            drawMessage += `\n\nSee the Fixtures screen for the full draw. Your match is scheduled for ${Main.getCalendarWeekString(matchWeekForThisRound)}.`;
            renderers.showModal('County Cup Draw!', drawMessage, [], gameState, updateUICallbacks, 'cup_draw_normal');
        }
        // --- FIX END ---
    } else {
        drawMessage += `You have a BYE this round!\n\n`;
        drawMessage += `See the Fixtures screen for other matches. Your BYE is for the week of ${Main.getCalendarWeekString(matchWeekForThisRound)}.`;
        renderers.showModal('County Cup Draw!', drawMessage, [], gameState, updateUICallbacks, 'cup_draw_bye');
    }

    gameState.messages.push({ week: currentRoundWeek, text: `County Cup ${Constants.COUNTY_CUP_ROUND_NAMES[matchWeekForThisRound]} draw announced.` });
}


/**
 * Handles the County Cup Match Day processing.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @returns {void}
 */
export function handleCountyCupMatch(gameState, updateUICallbacks) { // Now receives updateUICallbacks
    const currentWeek = gameState.currentWeek;
    const currentCupRoundName = Constants.COUNTY_CUP_ROUND_NAMES[currentWeek];

    const currentWeekCupBlock = gameState.countyCup.fixtures.find(block => block.week === currentWeek && block.competition === Constants.COMPETITION_TYPE.COUNTY_CUP);

    // --- NEW: Collect all AI matches for this week (both league and cup) ---
    // Find the player's current league to get its fixtures
    const playerCurrentLeague = gameState.leagues.find(l => l.id === gameState.playerClub?.currentLeagueId); // Optional chaining
    const currentAbsoluteGameWeek = gameState.currentWeek;
    const leagueWeekBlock = playerCurrentLeague?.currentSeasonFixtures.find(wb => wb.week === currentAbsoluteGameWeek && wb.competition === Constants.COMPETITION_TYPE.LEAGUE);

    let allAIMatchesForWeek = [];

    // Add AI league matches that are not rescheduled
    if (leagueWeekBlock && leagueWeekBlock.matches.length > 0) {
        const nonRescheduledLeagueMatches = leagueWeekBlock.matches.filter(match =>
            !match.played && match.result === null && // Only unplayed matches
            !hasCupMatchThisWeek(match.homeTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures) && // Home team not in cup
            !hasCupMatchThisWeek(match.awayTeamId, currentAbsoluteGameWeek, gameState.countyCup.fixtures) // Away team not in cup
        );
        allAIMatchesForWeek.push(...nonRescheduledLeagueMatches);
    }

    // Add AI cup matches (excluding player's match if it exists and is handled separately)
    if (currentWeekCupBlock && currentWeekCupBlock.matches.length > 0) {
        const aiCupMatches = currentWeekCupBlock.matches.filter(match =>
            match.homeTeamId !== gameState.playerClub?.id && match.awayTeamId !== gameState.playerClub?.id && // Ensure it's an AI match, optional chaining
            !match.played && match.awayTeamId !== 'BYE'
        );
        allAIMatchesForWeek.push(...aiCupMatches);
    }
    // --- END NEW ---


    if (!currentWeekCupBlock || currentWeekCupBlock.matches.length === 0) {
        const message = gameState.countyCup.playerTeamStatus === 'Eliminated' ?
            `You have already been eliminated from the County Cup. This is a week off.` :
            `No County Cup matches scheduled this week.`;
        renderers.showModal('County Cup', message, [], gameState, updateUICallbacks, 'cup_match_none_or_eliminated');
        
        // Process combined AI matches if any, then finalize
        if (allAIMatchesForWeek.length > 0) {
            // Create a dummy currentWeekBlock for processAIMatchesAndFinalizeWeek
            processAIMatchesAndFinalizeWeek(gameState, null, updateUICallbacks); // Pass null for playerMatchId, uic
        } else {
            finalizeWeekProcessing(gameState, 'cup_match_none_or_eliminated', updateUICallbacks);
        }
        return;
    }

    const playerMatch = currentWeekCupBlock.matches.find(match =>
        match.homeTeamId === gameState.playerClub?.id || match.awayTeamId === gameState.playerClub?.id // Optional chaining
    );

    if (playerMatch) {
        if (playerMatch.awayTeamId === 'BYE') {
            renderers.showModal('County Cup', `You have a BYE this County Cup round.`, [], gameState, updateUICallbacks, 'cup_match_bye_player');
            // Process combined AI matches if any, then finalize
            if (allAIMatchesForWeek.length > 0) {
                processAIMatchesAndFinalizeWeek(gameState, null, updateUICallbacks); // Pass null for playerMatchId, uic
            } else {
                finalizeWeekProcessing(gameState, 'cup_match_bye_player', updateUICallbacks);
            }
            return;
        }
        
        if (gameState.countyCup.playerTeamStatus === 'Active') {
            matchLogic.preMatchBriefing(gameState, playerMatch, updateUICallbacks); // Pass updateUICallbacks
            return;
        } else {
            // If playerMatch exists but playerTeamStatus is not 'Active' (e.g., 'Eliminated' from a previous round)
            renderers.showModal('County Cup', `You were expected to play, but your cup status is ${gameState.countyCup.playerTeamStatus}. This is a week off.`, [], gameState, updateUICallbacks, 'cup_match_unexpected_status');
            // Process combined AI matches if any, then finalize
            if (allAIMatchesForWeek.length > 0) {
                processAIMatchesAndFinalizeWeek(gameState, null, updateUICallbacks); // Pass null for playerMatchId, uic
            } else {
                finalizeWeekProcessing(gameState, 'cup_match_unexpected_status', updateUICallbacks);
            }
            return;
        }
    } else {
        // No player match in this block, process AI matches.
        if (gameState.countyCup.playerTeamStatus === 'Eliminated') {
            renderers.showModal('County Cup', `You were eliminated from the County Cup. This is a week off.`, [], gameState, updateUICallbacks, 'cup_match_eliminated_ai_only');
        } else {
            renderers.showModal('County Cup', `You have no County Cup match this week. Other matches are being played.`, [], gameState, updateUICallbacks, 'cup_match_no_player_match_ai_only');
        }
        // Process combined AI matches if any, then finalize
        if (allAIMatchesForWeek.length > 0) {
            processAIMatchesAndFinalizeWeek(gameState, null, updateUICallbacks); // Pass null for playerMatchId, uic
        } else {
            finalizeWeekProcessing(gameState, 'cup_match_no_player_match_ai_only', updateUICallbacks);
        }
        return;
    }
}

/**
 * This function encapsulates the very final steps of the week progression.
 * It's called by the last action button in the modal chain (e.g., after the match report).
 * @param {object} gameState - The mutable gameState.
 * @param {string} dismissalContext - The context from which the modal was dismissed.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
export function finalizeWeekProcessing(gameState, dismissalContext, updateUICallbacks) { // Now receives updateUICallbacks
    console.log(`DEBUG: finalizeWeekProcessing called. Context: ${dismissalContext}. Finishing week processing.`);
    // Log the current game week and dismissal context for debugging
    console.log(`DEBUG: finalizeWeekProcessing: Current Week: ${gameState.currentWeek}, Dismissal Context: ${dismissalContext}`);
    const isAnnouncementWeek = Constants.COUNTY_CUP_ANNOUNCEMENT_WEEKS.includes(gameState.currentWeek);
    const isDismissalContextExcluded = ['cup_draw_no_match', 'cup_draw_normal', 'cup_draw_bye', 'cup_draw_with_customization', 'cup_opponent_customized_final'].includes(dismissalContext);
    
    console.log(`DEBUG: isAnnouncementWeek: ${isAnnouncementWeek}`);
    console.log(`DEBUG: isDismissalContextExcluded: ${isDismissalContextExcluded}`);
    console.log(`DEBUG: Condition for re-triggering announcement: ${isAnnouncementWeek && !isDismissalContextExcluded}`);


    // --- Handle County Cup Announcement *before* week increments ---
    // This ensures the announcement happens for the current week, after matches.
    // It will show a modal, and that modal's dismissal will call finalizeWeekProcessing again,
    // but with a cup_draw_... context, allowing the week to finally increment.
    if (isAnnouncementWeek && !isDismissalContextExcluded) {
        
        console.log(`DEBUG: Triggering County Cup Announcement for Week ${gameState.currentWeek}`);
        handleCountyCupAnnouncement(gameState, updateUICallbacks); // Pass updateUICallbacks
        return; // IMPORTANT: Return here. The dismissal of the cup announcement modal will call finalizeWeekProcessing again.
    }
    // --- END NEW ---


    // These steps now only occur once all match/event modals are dismissed and flow is returned.
    // 7. Update Player Fitness/Morale (Post-match/Weekly Decay)
    // FIX: Ensure playerClub and currentLeagueId are valid before attempting to find league match
    const playerLeagueMatchForWeek = gameState.playerClub?.currentLeagueId ? 
        gameState.leagues.find(l => l.id === gameState.playerClub.currentLeagueId)?.currentSeasonFixtures
            .find(wb => wb.week === (gameState.currentWeek) && wb.competition === Constants.COMPETITION_TYPE.LEAGUE)?.matches
            .find(match => match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id)
        : null;
    
    const playerCupMatchForWeek = gameState.countyCup.fixtures
        .find(wb => wb.week === gameState.currentWeek && wb.competition === Constants.COMPETITION_TYPE.COUNTY_CUP)?.matches
        .find(match => match.homeTeamId === gameState.playerClub?.id || match.awayTeamId === gameState.playerClub?.id); // Optional chaining

    const wasPlayerHomeMatch = !!playerLeagueMatchForWeek || !!playerCupMatchForWeek; // True if player had any match this week.

    applyMatchDayFacilityDamage(gameState, wasPlayerHomeMatch);
    updatePlayerStatus(gameState);

    // 8. Advance Week Counter
    if (typeof gameState === 'object' && gameState !== null) {
        gameState.currentWeek++;
    } else {
        console.error("ERROR: gameState is not an object in finalizeWeekProcessing. Cannot advance week.");
        // NEW: Reset flag on error to allow retrying
        gameState.isProcessingWeek = false; // Use gameState directly
        return; // Prevent further errors
    }

    // 9. Check for End of Season
    if (gameState.currentWeek > Constants.TOTAL_LEAGUE_WEEKS) {
        endSeason(gameState, updateUICallbacks); // Pass updateUICallbacks
    } else {
        const nextMonthBlock = Constants.GAME_WEEK_TO_MONTH_MAP.find(block => {
            let cumulative = 0;
            for(let i=0; i<Constants.GAME_WEEK_TO_MONTH_MAP.indexOf(block); i++) {
                cumulative += Constants.GAME_WEEK_TO_MONTH_MAP[i].weeks;
            }
            return (gameState.currentWeek > cumulative && gameState.currentWeek <= cumulative + block.weeks) || 
                   (gameState.currentWeek + 1 > cumulative && gameState.currentWeek + 1 <= cumulative + block.weeks);
        });
        const nextMonthName = nextMonthBlock ? Constants.MONTH_NAMES[(Constants.SEASON_START_MONTH_INDEX + nextMonthBlock.monthIdxOffset) % 12] : '';
        
        gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
        if (nextMonthName === 'December') {
            gameState.availableHours = Math.max(0, Constants.WEEKLY_BASE_HOURS - Constants.DECEMBER_HOURS_REDUCTION);
        }

        gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
        gameState.gamePhase = Constants.GAME_PHASE.WEEKLY_PLANNING;
        updateUICallbacks.updateUI(); // Use passed updateUICallbacks
        updateUICallbacks.saveGame(false); // Use passed updateUICallbacks
        renderers.renderGameScreen('homeScreen');
    }

    // NEW: Reset processing flag at the very end of successful week finalization
    gameState.isProcessingWeek = false; // Use gameState directly

    console.log(`DEBUG: Week ${gameState.currentWeek - 1} finished. Next: Week ${gameState.currentWeek}`);
}
