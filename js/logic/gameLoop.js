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
import * as playerInteractionLogic from './playerInteractionLogic.js'; // Correct path
import * as committeeLogic from './committeeLogic.js'; // Correct path
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
 * It initiates the sequence of events for the current week.
 * @param {object} gameState - The current mutable gameState object.
 * @param {number} [resumeStep=0] - Internal parameter to resume week processing from a specific step.
 * @returns {boolean} True if an interactive modal was displayed by this execution of advanceWeek,
 * false otherwise. If true, the caller (main.js) should NOT finalize the week, but
 * wait for the modal's action to trigger processAIMatchesAndFinalizeWeek or finalizeWeekProcessing.
 */
export function advanceWeek(gameState, resumeStep = 0) {
    console.log(`--- Starting processing for Season ${gameState.currentSeason}, Week ${gameState.currentWeek} (Resume Step: ${resumeStep}) ---`);

    const updateUICallbacks = Main.getUpdateUICallbacks();

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
        processPlayerTasks(gameState);
        applyNaturalFacilityChanges(gameState);
        if (renderers.getModalDisplayStatus() === 'flex') { return true; } 
        applyWeeklyExpenses(gameState);
        if (renderers.getModalDisplayStatus() === 'flex') { return true; } 
    }

    // --- Ordered Processing of Weekly Events ---
    // Each step checks if a modal is already active. If not, it attempts to trigger its event.
    // If an event triggers a modal, it returns true, and the modal's dismissal will call
    // processRemainingWeekEvents to continue.

    // Step 1: Committee Meeting
    if (resumeStep <= 1 && gameState.currentWeek > 0 && gameState.currentWeek % Constants.COMMITTEE_MEETING_FREQUENCY_WEEKS === 0 && renderers.getModalDisplayStatus() === 'none') {
        console.log("DEBUG: Monthly committee meeting scheduled.");
        committeeLogic.startCommitteeMeeting(gameState); // This shows a modal
        gameState.messages.push({ week: gameState.currentWeek, text: `Monthly committee meeting held.` });
        return true; // Modal shown, execution stops here
    }

    // Step 2: Random Event
    if (resumeStep <= 2 && (gameState.currentWeek > Constants.PRE_SEASON_WEEKS || gameState.gamePhase === Constants.GAME_PHASE.PRE_SEASON_PLANNING) && renderers.getModalDisplayStatus() === 'none') {
        const eventMultiplier = (currentMonthName === 'December') ? Constants.DECEMBER_BAD_EVENT_CHANCE_MULTIPLIER : 1;
        const triggeredEvent = eventLogic.triggerRandomEvent(gameState, eventMultiplier); // This might show a modal
        if (triggeredEvent) {
            gameState.messages.push({ week: gameState.currentWeek, text: `${triggeredEvent.title}: ${triggeredEvent.description}` });
            return true; // Modal shown, execution stops here
        }
    }

    // --- Match Logic & Cup Announcements: Order is CRITICAL ---
    const currentLeague = gameState.leagues[0];
    const isLeagueMatchCalendarWeek = currentMonthBlock && currentMonthBlock.isLeague;
    const isCupMatchWeek = Constants.COUNTY_CUP_MATCH_WEEKS.includes(gameState.currentWeek);
    // const isCupAnnouncementWeek = Constants.COUNTY_CUP_ANNOUNCEMENT_WEEKS.includes(gameState.currentWeek); // Removed from here

    // Step 3: County Cup Match (Takes precedence for player's match)
    // If it's a cup match week, handle the player's cup match or week off.
    // This will either show a match briefing modal or a "week off" modal.
    if (resumeStep <= 3 && renderers.getModalDisplayStatus() === 'none' && isCupMatchWeek) {
        handleCountyCupMatch(gameState); // This function will always show a modal if player has a match/bye/eliminated
        return true; // Stop here, modal dismissal will continue the flow
    }

    // Step 4: League Match (Only if NOT a dedicated Cup Match Week)
    // If it's a regular league week and not a cup match week, simulate league matches.
    if (resumeStep <= 4 && renderers.getModalDisplayStatus() === 'none' && isLeagueMatchCalendarWeek && !isCupMatchWeek && currentLeague) {
        const leagueMatchWeekNum = gameState.currentWeek - Constants.PRE_SEASON_WEEKS;
        const currentWeekBlock = currentLeague.currentSeasonFixtures.find(weekBlock => 
            weekBlock.week === leagueMatchWeekNum && weekBlock.competition === Constants.COMPETITION_TYPE.LEAGUE
        );

        if (currentWeekBlock && currentWeekBlock.matches.length > 0) {
            const playerMatch = currentWeekBlock.matches.find(match =>
                match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id
            );

            if (playerMatch) {
                if (!gameState.playerClub.facilities[Constants.FACILITIES.PITCH].isUsable && playerMatch.homeTeamId === gameState.playerClub.id && renderers.getModalDisplayStatus() === 'none') {
                    renderers.showModal('Match Postponed!', `Your pitch is unplayable! The home match against ${playerMatch.awayTeamName} has been postponed.`, [{ text: 'Drat!', action: (gs, uic, context) => {
                        renderers.hideModal();
                        processAIMatchesAndFinalizeWeek(gs, currentWeekBlock, playerMatch.id);
                    } }], gameState, updateUICallbacks, 'match_postponed');
                    gameState.messages.push({ week: gameState.currentWeek, text: `Home match against ${playerMatch.awayTeamName} postponed due to unplayable pitch.` });
                    playerMatch.result = "P-P";
                    playerMatch.played = true;
                    return true;
                } else if (renderers.getModalDisplayStatus() === 'none') {
                    matchLogic.preMatchBriefing(gameState, playerMatch);
                    return true;
                }
            } else {
                // If no player match, but there are AI league matches, process them
                processAIMatchesAndFinalizeWeek(gameState, currentWeekBlock, null);
                return true; // This will show a modal if AI matches were played, or finalize if not.
            }
        }
    }

    // Step 5: Quiet Week (Fallback if no other major event/match happened)
    // Only show if no other modal is currently active.
    // Note: Cup announcements are now handled in finalizeWeekProcessing
    if (resumeStep <= 5 && renderers.getModalDisplayStatus() === 'none') {
        renderers.showModal('Quiet Week', 'Nothing major happened this week. Focus on building your club!', [], gameState, updateUICallbacks, 'quiet_week');
        console.log(gameState.currentWeek)
        gameState.messages.push({ week: gameState.currentWeek, text: `A quiet week in the season.` });
        return true;
    }

    // If we reach here, it means all possible events for the week have been processed or skipped,
    // and no modal was displayed by this direct execution path.
    // This typically means a modal was already active from a prior step (e.g., a task completion).
    console.log("DEBUG: advanceWeek finished, no new modal triggered. Assuming prior modal handled continuation.");
    // If no modal was triggered by advanceWeek, then finalize the week directly.
    finalizeWeekProcessing(gameState, 'no_modal_triggered_by_advance_week'); // Call finalize directly
    return false; // Indicate no modal was shown by this direct call
}

/**
 * Orchestrates the continuation of weekly processing after a modal is dismissed.
 * This is called by the action handlers of modals.
 * @param {object} gameState - The mutable gameState.
 * @param {string} dismissalContext - The context from which the modal was dismissed.
 */
export function processRemainingWeekEvents(gameState, dismissalContext) { // EXPORTED
    console.log(`DEBUG: processRemainingWeekEvents called. Context: ${dismissalContext}.`);
    const updateUICallbacks = Main.getUpdateUICallbacks();

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
        case 'half_time_action_outcome': // Dismissed half-time action outcome
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
        case 'cup_draw_with_customization':
            nextStepToResume = 7; // These contexts mean the week is fully processed or game is starting/ending
            break;
        default:
            console.warn(`DEBUG: Unhandled dismissal context: ${dismissalContext}. Resuming from step 0.`);
            nextStepToResume = 0;
            break;
    }

    // Now, call advanceWeek again, telling it where to resume.
    // If nextStepToResume is 7, it means the week's processing is complete, so we finalize.
    if (nextStepToResume === 7) {
        finalizeWeekProcessing(gameState, dismissalContext);
    } else {
        advanceWeek(gameState, nextStepToResume);
    }
}



/**
 * Handles the simulation of AI-only matches for the current week and then finalizes the week processing.
 * This is called by modal actions after a player's interactive match (or if player has no match).
 * @param {object} gameState - The current mutable gameState.
 * @param {object} currentWeekBlock - The fixture block for this week (can be league or cup).
 * @param {string|null} playerMatchId - The ID of the player's match for the week, or null if none.
 */
export function processAIMatchesAndFinalizeWeek(gameState, currentWeekBlock, playerMatchId) { // EXPORTED
    console.log(`DEBUG: processAIMatchesAndFinalizeWeek called for ${currentWeekBlock?.competition || 'Unknown'} matches. Simulating AI matches if any.`);
    let aiMatchesPlayed = false;
    const updateUICallbacks = Main.getUpdateUICallbacks();

    const aiMatches = currentWeekBlock?.matches.filter(match =>
        match.id !== playerMatchId && !match.played
    ) || [];

    for (const match of aiMatches) {
        const matchResult = matchLogic.simulateMatch(
            match.homeTeamId,
            match.awayTeamId,
            gameState.playerClub,
            opponentData.getAllOpponentClubs(null), // Pass all clubs for simulation
            playerData.getSquad()
        );

        if (currentWeekBlock.competition === Constants.COMPETITION_TYPE.LEAGUE) {
            gameState.leagues = leagueData.updateLeagueTable(
                gameState.leagues,
                gameState.leagues[0].id,
                match.homeTeamId,
                match.awayTeamId,
                matchResult.homeScore,
                matchResult.awayScore
            );
            gameState.leagues = leagueData.updateMatchResult(
                gameState.leagues,
                gameState.leagues[0].id,
                match.id,
                `${matchResult.homeScore}-${matchResult.awayScore}`
            );
        } else if (currentWeekBlock.competition === Constants.COMPETITION_TYPE.COUNTY_CUP) {
            const winnerId = matchResult.homeScore > matchResult.awayScore ? matchResult.homeTeamId :
                             (matchResult.awayScore > matchResult.homeScore ? matchResult.awayTeamId : null);
            
            // Update inCup and eliminatedFromCup status for AI teams in the cup
            gameState.countyCup.teams = gameState.countyCup.teams.map(team => {
                if (team.id === matchResult.homeTeamId) {
                    return { ...team, inCup: (matchResult.homeScore > matchResult.awayScore), eliminatedFromCup: (matchResult.homeScore <= matchResult.awayScore) };
                }
                if (team.id === matchResult.awayTeamId) {
                    return { ...team, inCup: (matchResult.awayScore > matchResult.homeScore), eliminatedFromCup: (matchResult.awayScore <= matchResult.homeScore) };
                }
                return team;
            });
            
            const cupMatchIndex = gameState.countyCup.fixtures.findIndex(fixtureBlock => fixtureBlock.week === currentWeekBlock.week);
            if (cupMatchIndex !== -1) {
                const matchInFixtureBlockIndex = gameState.countyCup.fixtures[cupMatchIndex].matches.findIndex(m => m.id === match.id);
                if (matchInFixtureBlockIndex !== -1) {
                    gameState.countyCup.fixtures[cupMatchIndex].matches[matchInFixtureBlockIndex].result = `${matchResult.homeScore}-${matchResult.awayScore}`;
                    gameState.countyCup.fixtures[cupMatchIndex].matches[matchInFixtureBlockIndex].played = true;
                }
            }
        }
        console.log(`DEBUG: AI match simulated: ${matchResult.homeTeamName} ${matchResult.homeScore}-${matchResult.awayScore} ${matchResult.awayTeamName} (${currentWeekBlock.competition})`);
        aiMatchesPlayed = true;
    }

    if (gameState.leagues && gameState.leagues.length > 0 && gameState.leagues[0].allClubsData) {
        // This line is crucial: it updates opponentData's internal list with the latest league data.
        // This is why allClubsInGameWorld in opponentData needs to be comprehensive.
        opponentData.setAllOpponentClubs(gameState.leagues[0].allClubsData);

        const playerClubInLeagueData = gameState.leagues[0].allClubsData.find(c => c.id === gameState.playerClub.id);
        if (playerClubInLeagueData) {
            gameState.playerClub.leagueStats = { ...playerClubInLeagueData.leagueStats };
        }
    }

    Main.updateUI();

    if (aiMatchesPlayed && renderers.getModalDisplayStatus() === 'none') {
        renderers.showModal('Matches Played', `Other ${currentWeekBlock?.competition || 'Unknown'} matches were played this week.`, [], gameState, updateUICallbacks, 'ai_matches_summary');
        gameState.messages.push({ week: gameState.currentWeek, text: `Other ${currentWeekBlock?.competition || 'Unknown'} matches played this week.` });
    } else {
        finalizeWeekProcessing(gameState, 'no_ai_matches_or_modal_active');
    }
}

/**
 * Handles the announcement and draw for a county cup round.
 * @param {object} gameState - The current mutable gameState object.
 */
export function handleCountyCupAnnouncement(gameState) { // EXPORTED
    const updateUICallbacks = Main.getUpdateUICallbacks();
    const currentRoundWeek = gameState.currentWeek;
    const currentRoundNum = Constants.COUNTY_CUP_ANNOUNCEMENT_WEEKS.indexOf(currentRoundWeek) + 1;
    gameState.countyCup.currentRound = currentRoundNum;
    
    // --- FIX: Filter out eliminated teams strictly from the pool for the draw ---
    // Only include teams that are explicitly inCup === true AND not eliminatedFromCup === true
    let teamsInCup = gameState.countyCup.teams.filter(team => team.inCup === true && team.eliminatedFromCup === false && team.id !== 'BYE');
    
    // Ensure player's team is explicitly added if they are active and not already in the filtered list
    // This handles cases where playerClub might not be in countyCup.teams initially or its status is outdated.
    if (gameState.countyCup.playerTeamStatus === 'Active' && !teamsInCup.some(t => t.id === gameState.playerClub.id)) {
        teamsInCup.push(gameState.playerClub);
    }
    // --- END FIX ---

    if (gameState.countyCup.playerTeamStatus === 'Eliminated' || teamsInCup.length < 2) {
        const message = gameState.countyCup.playerTeamStatus === 'Eliminated' ?
            'You have already been eliminated from the County Cup. No draw for you this round.' :
            'The County Cup draw is announced, but there are not enough teams for a full round.';
        renderers.showModal('County Cup Draw', message, [], gameState, updateUICallbacks, 'cup_draw_no_match');
        return;
    }

    let playerInCup = teamsInCup.find(t => t.id === gameState.playerClub.id);
    if (!playerInCup && gameState.countyCup.playerTeamStatus === 'Active') {
        // This block might be redundant if the above filtering is robust, but keeping for safety.
        teamsInCup.push(gameState.playerClub);
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
        match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id
    );

    if (playerMatch) {
        drawMessage += `Your match: **${playerMatch.homeTeamName} vs ${playerMatch.awayTeamName}**\n\n`;
        if (playerMatch.opponentClubFromOutsideLeague) {
            gameState.countyCup.opponentToCustomize = playerMatch.opponentClubFromOutsideLeague;
            drawMessage += `You've drawn a team from outside your league: ${playerMatch.opponentClubFromOutsideLeague.name}! You can customize them before the match.`;
            renderers.showModal('County Cup Draw!', drawMessage, [
                { text: 'Customize Opponent', action: (gs, uic, context) => {
                    renderers.hideModal();
                    renderers.renderOpponentCustomizationModal([gs.countyCup.opponentToCustomize]);
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
                        uicInner.finalizeWeekProcessing(gsInner, contextInner);
                    }, isPrimary: true }]
                    , gs, uic, context);
                }, isPrimary: true },
                { text: 'Continue Without Customizing', action: (gs, uic, context) => {
                    renderers.hideModal();
                    // --- FIX START: Add opponentToCustomize to global list if customization is skipped ---
                    if (gs.countyCup.opponentToCustomize) {
                        const currentGlobalClubs = opponentData.getAllOpponentClubs(null);
                        // Only add if it's not already present in the global list
                        if (!currentGlobalClubs.some(c => c.id === gs.countyCup.opponentToCustomize.id)) {
                            opponentData.setAllOpponentClubs([...currentGlobalClubs, gs.countyCup.opponentToCustomize]);
                        }
                    }
                    // --- FIX END ---
                    uic.finalizeWeekProcessing(gs, context);
                } }
            ], gameState, updateUICallbacks, 'cup_draw_with_customization');
        } else {
            drawMessage += `\n\nSee the Fixtures screen for the full draw.`;
            renderers.showModal('County Cup Draw!', drawMessage, [], gameState, updateUICallbacks, 'cup_draw_normal');
        }
    } else {
        drawMessage += `You have a BYE this round!\n\n`;
        drawMessage += `See the Fixtures screen for other matches.`;
        renderers.showModal('County Cup Draw!', drawMessage, [], gameState, updateUICallbacks, 'cup_draw_bye');
    }

    gameState.messages.push({ week: currentRoundWeek, text: `County Cup ${Constants.COUNTY_CUP_ROUND_NAMES[matchWeekForThisRound]} draw announced.` });
}


/**
 * Handles the County Cup Match Day processing.
 * @param {object} gameState - The current mutable gameState object.
 * @returns {void}
 */
export function handleCountyCupMatch(gameState) { // EXPORTED
    const updateUICallbacks = Main.getUpdateUICallbacks();
    const currentWeek = gameState.currentWeek;
    const currentCupRoundName = Constants.COUNTY_CUP_ROUND_NAMES[currentWeek];

    const currentWeekCupBlock = gameState.countyCup.fixtures.find(block => block.week === currentWeek && block.competition === Constants.COMPETITION_TYPE.COUNTY_CUP);

    if (!currentWeekCupBlock || currentWeekCupBlock.matches.length === 0) {
        const message = gameState.countyCup.playerTeamStatus === 'Eliminated' ?
            `You have already been eliminated from the County Cup. This is a week off.` :
            `No County Cup matches scheduled this week.`;
        renderers.showModal('County Cup', message, [], gameState, updateUICallbacks, 'cup_match_none_or_eliminated');
        return;
    }

    const playerMatch = currentWeekCupBlock.matches.find(match =>
        match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id
    );

    if (playerMatch) {
        if (playerMatch.awayTeamId === 'BYE') {
            renderers.showModal('County Cup', `You have a BYE this County Cup round.`, [], gameState, updateUICallbacks, 'cup_match_bye_player');
            processAIMatchesAndFinalizeWeek(gameState, currentWeekCupBlock, null);
            return;
        }
        
        if (gameState.countyCup.playerTeamStatus === 'Active') {
            matchLogic.preMatchBriefing(gameState, playerMatch);
            return;
        } else {
            // If playerMatch exists but playerTeamStatus is not 'Active' (e.g., 'Eliminated' from a previous round)
            renderers.showModal('County Cup', `You were expected to play, but your cup status is ${gameState.countyCup.playerTeamStatus}. This is a week off.`, [], gameState, updateUICallbacks, 'cup_match_unexpected_status');
            processAIMatchesAndFinalizeWeek(gameState, currentWeekCupBlock, null);
            return;
        }
    } else {
        // No player match in this block, process AI matches.
        if (gameState.countyCup.playerTeamStatus === 'Eliminated') {
            renderers.showModal('County Cup', `You were eliminated from the County Cup. This is a week off.`, [], gameState, updateUICallbacks, 'cup_match_eliminated_ai_only');
        } else {
            renderers.showModal('County Cup', `You have no County Cup match this week. Other matches are being played.`, [], gameState, updateUICallbacks, 'cup_match_no_player_match_ai_only');
        }
        processAIMatchesAndFinalizeWeek(gameState, currentWeekCupBlock, null);
        return;
    }
}

/**
 * This function encapsulates the very final steps of the week progression.
 * It's called by the last action button in the modal chain (e.g., after the match report).
 * @param {object} gameState - The mutable gameState.
 * @param {string} dismissalContext - The type of modal that was just dismissed, or reason for direct call.
 */
export function finalizeWeekProcessing(gameState, dismissalContext) { // EXPORTED to be called by modal actions
    console.log(`DEBUG: finalizeWeekProcessing called. Context: ${dismissalContext}. Finishing week processing.`);

    // --- NEW: Handle County Cup Announcement *before* week increments ---
    // This ensures the announcement happens for the current week, after matches.
    // It will show a modal, and that modal's dismissal will call finalizeWeekProcessing again,
    // but with a cup_draw_... context, allowing the week to finally increment.
    if (Constants.COUNTY_CUP_ANNOUNCEMENT_WEEKS.includes(gameState.currentWeek) && 
        !['cup_draw_no_match', 'cup_draw_normal', 'cup_draw_bye', 'cup_draw_with_customization'].includes(dismissalContext)) {
        
        console.log(`DEBUG: Triggering County Cup Announcement for Week ${gameState.currentWeek}`);
        handleCountyCupAnnouncement(gameState);
        return; // IMPORTANT: Return here. The dismissal of the cup announcement modal will call finalizeWeekProcessing again.
    }
    // --- END NEW ---


    // These steps now only occur once all match/event modals are dismissed and flow is returned.
    // 7. Update Player Fitness/Morale (Post-match/Weekly Decay)
    const playerLeagueMatchForWeek = gameState.leagues[0]?.currentSeasonFixtures
        .find(wb => wb.week === (gameState.currentWeek - Constants.PRE_SEASON_WEEKS) && wb.competition === Constants.COMPETITION_TYPE.LEAGUE)?.matches
        .find(match => match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id); // Check both home/away
    
    const playerCupMatchForWeek = gameState.countyCup.fixtures
        .find(wb => wb.week === gameState.currentWeek && wb.competition === Constants.COMPETITION_TYPE.COUNTY_CUP)?.matches
        .find(match => match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id); // Check both home/away

    const wasPlayerHomeMatch = !!playerLeagueMatchForWeek || !!playerCupMatchForWeek; // True if player had any match this week.

    applyMatchDayFacilityDamage(gameState, wasPlayerHomeMatch);
    updatePlayerStatus(gameState);

    // 8. Advance Week Counter
    if (typeof gameState === 'object' && gameState !== null) {
        gameState.currentWeek++;
    } else {
        console.error("ERROR: gameState is not an object in finalizeWeekProcessing. Cannot advance week.");
        return; // Prevent further errors
    }

    // 9. Check for End of Season
    if (gameState.currentWeek > Constants.TOTAL_LEAGUE_WEEKS) {
        endSeason(gameState);
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
        Main.updateUI();
        Main.saveGame(false);
        renderers.renderGameScreen('homeScreen');
    }
    console.log(`DEBUG: Week ${gameState.currentWeek - 1} finished. Next: Week ${gameState.currentWeek}`);
}


/**
 * Processes the tasks that the player has allocated hours to for the current week.
 * @param {object} gameState - The current mutable gameState object.
 */
function processPlayerTasks(gameState) {
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
 * @returns {void}
 */
function applyNaturalFacilityChanges(gameState) {
    const facilities = gameState.playerClub.facilities;
    const updateUICallbacks = Main.getUpdateUICallbacks();

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
                    renderers.hideModal();
                    gameLoop.processRemainingWeekEvents(gs, 'facility_degraded');
                } }], gameState, updateUICallbacks, 'facility_degraded');
                gameState.messages.push({ week: gameState.currentWeek, text: `Facility Degraded: ${facility.name} from Grade ${oldGrade} to Grade ${newGrade}.` });
                return;
            }
        }
    }
}

/**
 * Applies match-day specific facility damage (e.g., pitch wear, changing room mess).
 * @param {object} gameState - The current mutable gameState object.
 * @param {boolean} isHomeMatch - True if the match was played at player's home ground.
 */
function applyMatchDayFacilityDamage(gameState, isHomeMatch) {
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
                Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${updatedPlayer.name} has recovered from injury.` });
            }
        }
        if (updatedPlayer.status.suspended && updatedPlayer.status.suspensionGames > 0) {
            updatedPlayer.status.suspensionGames--;
            if (updatedPlayer.status.suspensionGames === 0) {
                updatedPlayer.status.suspended = false;
                updatedPlayer.status.injuryStatus = 'Fit'; // Reset injury status as well if it was 'Absent'
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
    const updateUICallbacks = Main.getUpdateUICallbacks();

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

    renderers.showModal(endSeasonModalTitle, seasonSummaryMessage, [{ text: 'Review Season', action: (gs, uic, context) => {
        renderers.hideModal();
        finalizeWeekProcessing(gs, context);
    } }], gameState, updateUICallbacks, 'end_of_season_review');
    gameState.messages.push({ week: gameState.currentWeek, text: `Season ${gameState.currentSeason} concluded.` });


    gameState.playerClub.squad = playerData.resetPlayerSeasonStats();
    opponentData.resetOpponentSeasonalStats();
    gameState.playerClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    
    // Reset cup status for next season
    gameState.countyCup = {
        competitionId: dataGenerator.generateUniqueId('CUP'),
        teams: [...gameState.leagues[0].allClubsData], // Start with league teams for next season's cup pool
        fixtures: [],
        currentRound: 0,
        playerTeamStatus: 'Active', // Player team is active in cup for new season
        opponentToCustomize: null
    };

    // Add a few extra potential cup opponents from the region for the new season
    for (let i = 0; i < 5; i++) { // Add 5 extra potential cup teams
        const newOpponent = opponentData.generateSingleOpponentClub(Main.gameState.playerCountyData, dataGenerator.getRandomInt(8, 15)); // Generate with varied quality
        if (!gameState.countyCup.teams.some(team => team.id === newOpponent.id)) {
            newOpponent.inCup = true;
            newOpponent.eliminatedFromCup = false;
            gameState.countyCup.teams.push(newOpponent);
            opponentData.setAllOpponentClubs([...opponentData.getAllOpponentClubs(null), newOpponent]);
        }
    }


    gameState.currentSeason++;
    gameState.currentWeek = 1;
    gameState.gamePhase = Constants.GAME_PHASE.OFF_SEASON;

    // Regenerate league fixtures for new season
    currentLeague.currentSeasonFixtures = dataGenerator.generateMatchSchedule(
        gameState.playerClub.id,
        [gameState.playerClub, ...opponentData.getAllOpponentClubs(gameState.playerClub.id)],
        gameState.currentSeason,
        Constants.COMPETITION_TYPE.LEAGUE
    );
    gameState.leagues[0] = currentLeague;

    renderers.renderGameScreen('homeScreen');
    renderers.showModal(`Season ${gameState.currentSeason - 1} Concluded!`, `Prepare for Season ${gameState.currentSeason}.`, [{ text: 'Continue', action: (gs, uic, context) => {
        renderers.hideModal();
        finalizeWeekProcessing(gs, context);
    } }], gameState, updateUICallbacks, 'season_start_continue');
}
