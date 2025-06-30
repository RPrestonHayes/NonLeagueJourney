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
import * as taskLogic from './taskLogic.js';
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
 * @returns {boolean} True if an interactive modal was displayed by this execution of advanceWeek,
 * false otherwise. If true, the caller (main.js) should NOT finalize the week, but
 * wait for the modal's action to trigger processAIMatchesAndFinalizeWeek or finalizeWeekProcessing.
 */
export function advanceWeek(gameState) {
    console.log(`--- Starting processing for Season ${gameState.currentSeason}, Week ${gameState.currentWeek} ---`);

    // Ensure Main.getUpdateUICallbacks is available for all modal calls
    const updateUICallbacks = Main.getUpdateUICallbacks();

    if (gameState.gamePhase === Constants.GAME_PHASE.SETUP || gameState.gamePhase === Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION) {
         renderers.showModal('Game Not Ready', 'Complete game setup and customization before advancing the week.', [{text: 'Continue', action: (gs, uic, context) => renderers.hideModal(), isPrimary: true }], gameState, updateUICallbacks, 'game_not_ready');
         return true; // A modal was shown
    }

    // 1. Process Player's Weekly Tasks (Effects already applied by clicking 'Do Task' button)
    processPlayerTasks(gameState);

    // 2. Apply Natural Facility Decay/Improvement & Check Grade Degradation (can show modal)
    applyNaturalFacilityChanges(gameState);
    if (renderers.getModalDisplayStatus() === 'flex') {
        return true; // Modal shown, synchronous flow stops, action will continue chain
    }

    // 3. Apply Weekly Expenses
    applyWeeklyExpenses(gameState);
    
    // 4. Handle December Special Conditions (reduced hours, increased bad events)
    // Check if current week falls within December's defined weeks (approximate)
    const currentMonthBlock = Constants.GAME_WEEK_TO_MONTH_MAP.find(block => {
        let cumulative = 0;
        for(let i=0; i<Constants.GAME_WEEK_TO_MONTH_MAP.indexOf(block); i++) {
            cumulative += Constants.GAME_WEEK_TO_MONTH_MAP[i].weeks;
        }
        return gameState.currentWeek > cumulative && gameState.currentWeek <= cumulative + block.weeks;
    });

    const currentMonthName = currentMonthBlock ? Constants.MONTH_NAMES[(Constants.SEASON_START_MONTH_INDEX + currentMonthBlock.monthIdxOffset) % 12] : '';
    
    if (currentMonthName === 'December') {
        // Reduce available hours by December amount at the start of the week
        if (gameState.availableHours === Constants.WEEKLY_BASE_HOURS) { // Only apply once per December week
            gameState.availableHours = Math.max(0, Constants.WEEKLY_BASE_HOURS - Constants.DECEMBER_HOURS_REDUCTION);
            gameState.messages.push({ week: gameState.currentWeek, text: `December conditions: Available hours reduced by ${Constants.DECEMBER_HOURS_REDUCTION} due to winter weather/holidays.` });
            renderers.updateNewsFeed(`Winter is here! Fewer hours available this week.`);
        }
    }


    // 5. Check for Monthly Committee Meeting (can show modal)
    if (gameState.currentWeek > 0 && gameState.currentWeek % Constants.COMMITTEE_MEETING_FREQUENCY_WEEKS === 0 && renderers.getModalDisplayStatus() === 'none') {
        console.log("DEBUG: Monthly committee meeting scheduled.");
        committeeLogic.startCommitteeMeeting(gameState); // This will show a modal
        gameState.messages.push({ week: gameState.currentWeek, text: `Monthly committee meeting held.` });
        return true; // Modal shown, execution stops here until dismissal
    }

    // 6. Trigger Random Event (can show modal)
    if ((gameState.currentWeek > Constants.PRE_SEASON_WEEKS || gameState.gamePhase === Constants.GAME_PHASE.PRE_SEASON_PLANNING) && renderers.getModalDisplayStatus() === 'none') {
        const eventMultiplier = (currentMonthName === 'December') ? Constants.DECEMBER_BAD_EVENT_CHANCE_MULTIPLIER : 1;
        const triggeredEvent = eventLogic.triggerRandomEvent(gameState, eventMultiplier); // Pass event multiplier
        if (triggeredEvent) {
            gameState.messages.push({ week: gameState.currentWeek, text: `${triggeredEvent.title}: ${triggeredEvent.description}` });
            return true; // Modal shown, execution stops here until dismissal
        }
    }

    // 7. County Cup Logic (Announcement or Match Day)
    if (renderers.getModalDisplayStatus() === 'none') {
        if (Constants.COUNTY_CUP_ANNOUNCEMENT_WEEKS.includes(gameState.currentWeek)) {
            handleCountyCupAnnouncement(gameState);
            return true; // Modal shown
        } else if (Constants.COUNTY_CUP_MATCH_WEEKS.includes(gameState.currentWeek)) {
            handleCountyCupMatch(gameState);
            return true; // Modal shown
        }
    }


    // 8. League Match Logic: Pre-Match Briefing (for player), Simulation, Post-Match Report
    const currentLeague = gameState.leagues[0];

    // Only schedule league matches during the league match weeks
    if (gameState.currentWeek > Constants.PRE_SEASON_WEEKS && gameState.currentWeek <= Constants.TOTAL_LEAGUE_WEEKS && currentLeague) {
        const matchWeekIndex = gameState.currentWeek - Constants.PRE_SEASON_WEEKS; // Adjust for league match week number
        const currentWeekBlock = currentLeague.currentSeasonFixtures.find(weekBlock => weekBlock.week === matchWeekIndex && weekBlock.competition === Constants.COMPETITION_TYPE.LEAGUE);

        if (currentWeekBlock && currentWeekBlock.matches.length > 0) {
            const playerMatch = currentWeekBlock.matches.find(match =>
                match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id
            );

            if (playerMatch) {
                // If player's home match and pitch is unplayable (shows modal)
                if (!gameState.playerClub.facilities[Constants.FACILITIES.PITCH].isUsable && playerMatch.homeTeamId === gameState.playerClub.id && renderers.getModalDisplayStatus() === 'none') {
                    renderers.showModal('Match Postponed!', `Your pitch is unplayable! The home match against ${playerMatch.awayTeamName} has been postponed.`, [{ text: 'Drat!', action: (gs, uic, context) => {
                        renderers.hideModal();
                        processAIMatchesAndFinalizeWeek(gs, currentWeekBlock, playerMatch.id);
                    } }], gameState, updateUICallbacks, 'match_postponed');
                    gameState.messages.push({ week: gameState.currentWeek, text: `Home match against ${playerMatch.awayTeamName} postponed due to unplayable pitch.` });
                    playerMatch.result = "P-P";
                    playerMatch.played = true;
                    return true; // Modal shown, stop synchronous flow
                } else if (renderers.getModalDisplayStatus() === 'none') {
                    // Start the interactive player match sequence (shows pre-match briefing modal)
                    matchLogic.preMatchBriefing(gameState, playerMatch);
                    return true; // Modal shown, stop synchronous flow
                }
            } else {
                // No player match this week, but there are AI matches. Process AI matches directly.
                processAIMatchesAndFinalizeWeek(gameState, currentWeekBlock, null);
                return true; // A modal (AI summary or Quiet Week if no AI matches) might be shown by that function
            }
        }
    }


    // If we reach here and no modal was shown by any of the events/matches, then it's a truly quiet week.
    // Show "Quiet Week" modal and signal that a modal was shown.
    if (renderers.getModalDisplayStatus() === 'none') {
        renderers.showModal('Quiet Week', 'Nothing major happened this week. Focus on building your club!', [], gameState, updateUICallbacks, 'quiet_week');
        console.log(gameState.currentWeek)
        gameState.messages.push({ week: gameState.currentWeek, text: `A quiet week in the season.` });
        return true; // A modal was shown
    }

    // If we reach this point, it means some interaction (like a task click) already triggered a modal
    // and this synchronous `advanceWeek` function is completing its execution.
    // The previous modal's action should have called finalizeWeekProcessing.
    console.log("DEBUG: advanceWeek finished, a modal was already active from a prior task/event.");
    return false; // No *new* modal was explicitly opened in this advanceWeek path
}

/**
 * Handles the simulation of AI-only matches for the current week and then finalizes the week processing.
 * This is called by modal actions after a player's interactive match (or if player has no match).
 * @param {object} gameState - The current mutable gameState.
 * @param {object} currentWeekBlock - The fixture block for this week (can be league or cup).
 * @param {string|null} playerMatchId - The ID of the player's match for the week, or null if none.
 */
export function processAIMatchesAndFinalizeWeek(gameState, currentWeekBlock, playerMatchId) {
    console.log(`DEBUG: processAIMatchesAndFinalizeWeek called for ${currentWeekBlock.competition} matches. Simulating AI matches if any.`);
    let aiMatchesPlayed = false;
    const updateUICallbacks = Main.getUpdateUICallbacks(); // Get callbacks here

    const aiMatches = currentWeekBlock.matches.filter(match =>
        match.id !== playerMatchId && !match.played
    );

    for (const match of aiMatches) {
        // AI matches for both League and Cup use the same simulation
        const matchResult = matchLogic.simulateMatch(
            match.homeTeamId,
            match.awayTeamId,
            gameState.playerClub,
            opponentData.getAllOpponentClubs(gameState.playerClub.id),
            playerData.getSquad()
        );

        if (currentWeekBlock.competition === Constants.COMPETITION_TYPE.LEAGUE) {
            gameState.leagues = leagueData.updateLeagueTable(
                gameState.leagues,
                gameState.leagues[0].id, // Use the current league ID
                match.homeTeamId,
                match.awayTeamId,
                matchResult.homeScore,
                matchResult.awayScore
            );
            gameState.leagues = leagueData.updateMatchResult(
                gameState.leagues,
                gameState.leagues[0].id, // Use the current league ID
                match.id,
                `${matchResult.homeScore}-${matchResult.awayScore}`
            );
        } else if (currentWeekBlock.competition === Constants.COMPETITION_TYPE.COUNTY_CUP) {
            // For AI cup matches, update their status and move to next round or eliminate
            const winnerId = matchResult.homeScore > matchResult.awayScore ? matchResult.homeTeamId :
                             (matchResult.awayScore > matchResult.homeScore ? matchResult.awayTeamId : null); // Handle draws in cup (replays, or next round based on rules)

            // Simplistic cup progression for AI: winner advances, loser eliminated
            // This would need more complex logic for actual cup rules (replays, penalties, etc.)
            gameState.countyCup.teams = gameState.countyCup.teams.map(team => {
                if (team.id === matchResult.homeTeamId || team.id === matchResult.awayTeamId) {
                    if (team.id === winnerId) {
                        return { ...team, inCup: true, eliminatedFromCup: false }; // Winner remains in cup
                    } else {
                        return { ...team, inCup: false, eliminatedFromCup: true }; // Loser eliminated
                    }
                }
                return team;
            });
            
            // Update the cup fixture itself
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

    // After all AI matches are processed, ensure opponentData's internal state is synchronized
    if (gameState.leagues && gameState.leagues.length > 0 && gameState.leagues[0].allClubsData) {
        opponentData.setAllOpponentClubs(gameState.leagues[0].allClubsData);

        const playerClubInLeagueData = gameState.leagues[0].allClubsData.find(c => c.id === gameState.playerClub.id);
        if (playerClubInLeagueData) {
            gameState.playerClub.leagueStats = { ...playerClubInLeagueData.leagueStats };
        }
    }

    // Crucial: After processing all AI matches and updating the state,
    // explicitly call updateUI to re-render the fixtures screen.
    Main.updateUI();


    // After AI matches are processed, show a summary if AI matches were played AND no other modal is already open.
    if (aiMatchesPlayed && renderers.getModalDisplayStatus() === 'none') {
        renderers.showModal('Matches Played', `Other ${currentWeekBlock.competition} matches were played this week.`, [], gameState, updateUICallbacks, 'ai_matches_summary');
        gameState.messages.push({ week: gameState.currentWeek, text: `Other ${currentWeekBlock.competition} matches played this week.` });
    } else {
        // No AI matches played, or modal already open. Just finalize the week directly.
        finalizeWeekProcessing(gameState, 'no_ai_matches_or_modal_active');
    }
}

/**
 * Handles the announcement and draw for a county cup round.
 * @param {object} gameState - The current mutable gameState object.
 */
function handleCountyCupAnnouncement(gameState) {
    const updateUICallbacks = Main.getUpdateUICallbacks();
    const currentRoundWeek = gameState.currentWeek;
    const currentRoundNum = Constants.COUNTY_CUP_ANNOUNCEMENT_WEEKS.indexOf(currentRoundWeek) + 1;
    gameState.countyCup.currentRound = currentRoundNum;
    
    // Filter teams that are still in the cup
    let teamsInCup = gameState.countyCup.teams.filter(team => team.inCup !== false && team.id !== 'BYE');
    
    // If player team is eliminated or no teams left, skip draw
    if (gameState.countyCup.playerTeamStatus === 'Eliminated' || teamsInCup.length < 2) {
        const message = gameState.countyCup.playerTeamStatus === 'Eliminated' ?
            'You have already been eliminated from the County Cup. No draw for you this round.' :
            'The County Cup draw is announced, but there are not enough teams for a full round.';
        renderers.showModal('County Cup Draw', message, [], gameState, updateUICallbacks, 'cup_draw_no_match');
        return;
    }

    // Ensure player team is always included if active
    let playerInCup = teamsInCup.find(t => t.id === gameState.playerClub.id);
    if (!playerInCup && gameState.countyCup.playerTeamStatus === 'Active') {
        teamsInCup.push(gameState.playerClub); // Re-add player if somehow missing
    } else if (playerInCup && gameState.countyCup.playerTeamStatus === 'Not Entered') {
        gameState.countyCup.playerTeamStatus = 'Active'; // If found in draw, ensure status is active
    }

    // Generate cup fixtures for this round
    const cupFixturesThisRound = leagueData.generateCupFixtures(
        gameState.countyCup.competitionId,
        teamsInCup,
        gameState.currentSeason,
        currentRoundWeek + 2 // Match week is 2 weeks after announcement
    );

    // Add to main county cup fixtures
    gameState.countyCup.fixtures.push({
        week: currentRoundWeek + 2,
        competition: Constants.COMPETITION_TYPE.COUNTY_CUP,
        matches: cupFixturesThisRound
    });

    // Display the draw to the player
    let drawMessage = `The draw for County Cup ${Constants.COUNTY_CUP_ROUND_NAMES[currentRoundWeek + 2]} is out!\n\n`;
    const playerMatch = cupFixturesThisRound.find(match =>
        match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id
    );

    if (playerMatch) {
        drawMessage += `Your match: **${playerMatch.homeTeamName} vs ${playerMatch.awayTeamName}**\n\n`;
        // Check if opponent needs customization (if they are a new, higher-tier team)
        if (playerMatch.opponentClubFromOutsideLeague) {
            gameState.countyCup.opponentToCustomize = playerMatch.opponentClubFromOutsideLeague;
            drawMessage += `You've drawn a team from outside your league: ${playerMatch.opponentClubFromOutsideLeague.name}! You can customize them before the match.`;
            renderers.showModal('County Cup Draw!', drawMessage, [
                { text: 'Customize Opponent', action: (gs, uic, context) => {
                    renderers.hideModal();
                    renderers.renderOpponentCustomizationModal([gs.countyCup.opponentToCustomize]);
                    renderers.showModal(`Customize ${gs.countyCup.opponentToCustomize.name}`, `You can customize your cup opponent. They might be a team you encounter in higher leagues!`, [{ text: 'Save & Continue', action: (gsInner, uicInner, contextInner) => {
                        const customizedOpponents = [];
                        const opponentItems = document.getElementById('opponentListCustomization').querySelectorAll('.opponent-custom-item');
                        opponentItems.forEach(item => {
                            const clubId = item.querySelector('input[data-field="name"]').dataset.clubId;
                            const name = item.querySelector(`input[data-field="name"][data-club-id="${clubId}"]`).value.trim();
                            const nickname = item.querySelector(`input[data-field="nickname"][data-club-id="${clubId}"]`).value.trim();
                            const primaryColor = item.querySelector(`input[data-field="primaryColor"][data-club-id="${clubId}"]`).value;
                            const secondaryColor = item.querySelector(`input[data-field="secondaryColor"][data-club-id="${clubId}"]`).value;
                            customizedOpponents.push({id: clubId, name, nickname, kitColors: {primary: primaryColor, secondary: secondaryColor}});
                        });
                        // Update the county cup teams array with the customized opponent
                        const opponentIndex = gsInner.countyCup.teams.findIndex(t => t.id === customizedOpponents[0].id);
                        if(opponentIndex !== -1) {
                            Object.assign(gsInner.countyCup.teams[opponentIndex], customizedOpponents[0]);
                        }
                        renderers.hideOpponentCustomizationModal();
                        uicInner.finalizeWeekProcessing(gsInner, contextInner);
                    }, isPrimary: true }]
                    , gs, uic, context); // Pass gs, uic, context to the customization modal
                }, isPrimary: true },
                { text: 'Continue Without Customizing', action: (gs, uic, context) => {
                    renderers.hideModal();
                    uic.finalizeWeekProcessing(gs, context);
                } }
            ], gameState, updateUICallbacks, 'cup_draw_with_customization');
        } else {
            drawMessage += `\n\nSee the Fixtures screen for the full draw.`;
            renderers.showModal('County Cup Draw!', drawMessage, [], gameState, updateUICallbacks, 'cup_draw_normal');
        }
    } else {
        // Player got a bye or not in draw (if odd number of teams)
        drawMessage += `You have a BYE this round!\n\n`;
        drawMessage += `See the Fixtures screen for other matches.`;
        renderers.showModal('County Cup Draw!', drawMessage, [], gameState, updateUICallbacks, 'cup_draw_bye');
    }

    gameState.messages.push({ week: currentRoundWeek, text: `County Cup ${Constants.COUNTY_CUP_ROUND_NAMES[currentRoundWeek + 2]} draw announced.` });
}


/**
 * Handles the County Cup Match Day processing.
 * @param {object} gameState - The current mutable gameState object.
 */
function handleCountyCupMatch(gameState) {
    const updateUICallbacks = Main.getUpdateUICallbacks();
    const currentWeek = gameState.currentWeek;
    const currentCupRoundName = Constants.COUNTY_CUP_ROUND_NAMES[currentWeek];

    // Find the current week's cup fixtures
    const currentWeekCupBlock = gameState.countyCup.fixtures.find(block => block.week === currentWeek);

    if (!currentWeekCupBlock || currentWeekCupBlock.matches.length === 0) {
        // This should theoretically not happen if announcements are correct
        renderers.showModal('County Cup', `No County Cup matches scheduled this week.`, [], gameState, updateUICallbacks, 'cup_match_none');
        return;
    }

    const playerMatch = currentWeekCupBlock.matches.find(match =>
        match.homeTeamId === gameState.playerClub.id || match.awayTeamId === gameState.playerClub.id
    );

    if (playerMatch) {
        if (gameState.countyCup.playerTeamStatus === 'Eliminated') {
            // Player already eliminated, this match shouldn't exist in fixtures or is a display error
            renderers.showModal('County Cup', `You were already eliminated from the County Cup. This is a week off.`, [], gameState, updateUICallbacks, 'cup_match_eliminated');
            return;
        }

        // Simulate player's cup match
        // Note: simulateSecondHalf already handles updating Main.gameState.leagues for results,
        // but we need to update gameState.countyCup.fixtures and playerTeamStatus
        matchLogic.preMatchBriefing(gameState, playerMatch); // Will chain to simulateFirstHalf/SecondHalf
        return; // Execution continues from matchLogic's modal action
    } else {
        // Player either has a BYE or is eliminated, and we are processing AI matches
        if (gameState.countyCup.playerTeamStatus === 'Eliminated') {
            renderers.showModal('County Cup', `You were eliminated from the County Cup. This is a week off.`, [], gameState, updateUICallbacks, 'cup_match_eliminated_ai_only');
        } else { // Player has a BYE
            renderers.showModal('County Cup', `You have a BYE this County Cup round. Other matches are being played.`, [], gameState, updateUICallbacks, 'cup_match_bye_ai_only');
        }
        processAIMatchesAndFinalizeWeek(gameState, currentWeekCupBlock, null); // Simulate AI cup matches
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

    // These steps now only occur once all match/event modals are dismissed and flow is returned.
    // 7. Update Player Fitness/Morale (Post-match/Weekly Decay)
    // Check if player had a home match in either league or cup this week to apply facility damage
    const playerMatchForWeek = gameState.leagues[0]?.currentSeasonFixtures
        .find(wb => wb.week === (gameState.currentWeek - Constants.PRE_SEASON_WEEKS) && wb.competition === Constants.COMPETITION_TYPE.LEAGUE)?.matches // Check league fixtures
        .find(match => match.homeTeamId === gameState.playerClub.id) ||
                           gameState.countyCup.fixtures
        .find(wb => wb.week === gameState.currentWeek && wb.competition === Constants.COMPETITION_TYPE.COUNTY_CUP)?.matches // Check cup fixtures
        .find(match => match.homeTeamId === gameState.playerClub.id);
    
    const wasPlayerHomeMatch = !!playerMatchForWeek; // True if any home match for player this week

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
    // The season now runs for Constants.TOTAL_LEAGUE_WEEKS. Any weeks beyond that are off-season.
    if (gameState.currentWeek > Constants.TOTAL_LEAGUE_WEEKS) {
        endSeason(gameState); // endSeason will handle its own modal and its action will call finalizeWeekProcessing again for final UI/save
    } else {
        // This is the normal end-of-week path.
        // Reset available hours for the NEXT week, accounting for December reduction
        const nextMonthBlock = Constants.GAME_WEEK_TO_MONTH_MAP.find(block => {
            let cumulative = 0;
            for(let i=0; i<Constants.GAME_WEEK_TO_MONTH_MAP.indexOf(block); i++) {
                cumulative += Constants.GAME_WEEK_TO_MONTH_MAP[i].weeks;
            }
            return (gameState.currentWeek > cumulative && gameState.currentWeek <= cumulative + block.weeks) || // Current week in block
                   (gameState.currentWeek + 1 > cumulative && gameState.currentWeek + 1 <= cumulative + block.weeks); // Next week in block
        });
        const nextMonthName = nextMonthBlock ? Constants.MONTH_NAMES[(Constants.SEASON_START_MONTH_INDEX + nextMonthBlock.monthIdxOffset) % 12] : '';
        
        gameState.availableHours = Constants.WEEKLY_BASE_HOURS; // Reset to base
        if (nextMonthName === 'December') {
            gameState.availableHours = Math.max(0, Constants.WEEKLY_BASE_HOURS - Constants.DECEMBER_HOURS_REDUCTION);
        }

        gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
        gameState.gamePhase = Constants.GAME_PHASE.WEEKLY_PLANNING;
        Main.updateUI(); // Update UI to show new week's tasks etc.
        Main.saveGame(false); // Save silently
        renderers.renderGameScreen('homeScreen'); // FIX: Explicitly render home screen here
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

    // Reset assignedHours and completed status for the next week's planning
    gameState.weeklyTasks.forEach(task => {
        task.assignedHours = 0;
        task.completed = false; // Reset completed status for next week
    });
}

/**
 * Applies natural weekly facility changes (decay/improvement) and checks for grade degradation.
 * @param {object} gameState - The current mutable gameState object.
 */
function applyNaturalFacilityChanges(gameState) {
    const facilities = gameState.playerClub.facilities;
    const updateUICallbacks = Main.getUpdateUICallbacks(); // Get callbacks here

    for (const key in facilities) {
        const facility = facilities[key];
        if (facility.level > 0) {
            if (facility.naturalImprovementPerWeek > 0) {
                const groundsman = gameState.playerClub.committee.find(c => c.role === Constants.COMMITTEE_ROLES.GRNDS);
                let improvementAmount = facility.naturalImprovementPerWeek;
                if (groundsman) {
                    improvementAmount += Math.round(groundsman.skills.groundsKeepingSkill / 2);
                }
                gameState.playerClub.facilities = clubData.updateFacilityCondition(
                    gameState.playerClub.facilities, key, improvementAmount
                );
            } else {
                const decayAmount = getRandomInt(1, 3);
                 gameState.playerClub.facilities = clubData.updateFacilityCondition(
                    gameState.playerClub.facilities, key, -decayAmount
                );
            }

            const oldGrade = facility.grade;
            const updatedFacilitiesAfterDegradeCheck = clubData.degradeFacilityGrade(gameState.playerClub.facilities, key);
            if (updatedFacilitiesAfterDegradeCheck) {
                gameState.playerClub.facilities = updatedFacilitiesAfterDegradeCheck;
                const newGrade = gameState.playerClub.facilities[key].grade;
                renderers.showModal('Facility Degraded!', `${facility.name} condition has been poor, degrading from Grade ${oldGrade} to Grade ${newGrade}!`, [{ text: 'Drat!', action: (gs, uic, context) => {
                    renderers.hideModal();
                    finalizeWeekProcessing(gs, context);
                } }], gameState, updateUICallbacks, 'facility_degraded');
                gameState.messages.push({ week: gameState.currentWeek, text: `Facility Degraded: ${facility.name} from Grade ${oldGrade} to Grade ${newGrade}.` });
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

    // Pitch damage
    if (facilities[Constants.FACILITIES.PITCH].level > 0 && facilities[Constants.FACILITIES.PITCH].isUsable) {
        let pitchDamage = getRandomInt(Math.round(facilities[Constants.FACILITIES.PITCH].damagePerMatch * 0.7), facilities[Constants.FACILITIES.PITCH].damagePerMatch);

        gameState.playerClub.facilities = clubData.updateFacilityCondition(
            gameState.playerClub.facilities, Constants.FACILITIES.PITCH, -pitchDamage
        );
        gameState.messages.push({ week: gameState.currentWeek, text: `Pitch condition reduced by match wear (-${pitchDamage}%).` });
    }

    // Changing Rooms damage (affected by team morale)
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
    const updateUICallbacks = Main.getUpdateUICallbacks(); // Get callbacks here

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
    gameState.messages.push({ week: gameState.currentWeek, text: seasonSummaryMessage });


    gameState.playerClub.squad = playerData.resetPlayerSeasonStats();
    opponentData.resetOpponentSeasonalStats();
    gameState.playerClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    
    // Reset cup status for next season
    gameState.countyCup = {
        competitionId: dataGenerator.generateUniqueId('CUP'),
        teams: [...gameState.leagues[0].allClubsData], // Reset cup teams to current league teams
        fixtures: [],
        currentRound: 0,
        playerTeamStatus: 'Active',
        opponentToCustomize: null
    };


    gameState.currentSeason++;
    gameState.currentWeek = 1;
    gameState.gamePhase = Constants.GAME_PHASE.OFF_SEASON;

    // Regenerate league fixtures for new season
    currentLeague.currentSeasonFixtures = dataGenerator.generateMatchSchedule(
        gameState.playerClub.id,
        [gameState.playerClub, ...opponentData.getAllOpponentClubs(gameState.playerClub.id)],
        gameState.currentSeason
    );
    gameState.leagues[0] = currentLeague;

    renderers.renderGameScreen('homeScreen'); // Re-render to show new season's details
    renderers.showModal(`Season ${gameState.currentSeason - 1} Concluded!`, `Prepare for Season ${gameState.currentSeason}.`, [{ text: 'Continue', action: (gs, uic, context) => {
        renderers.hideModal();
        finalizeWeekProcessing(gs, context);
    } }], gameState, updateUICallbacks, 'season_start_continue');
}
