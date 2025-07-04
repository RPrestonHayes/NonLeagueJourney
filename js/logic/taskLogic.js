// js/logic/taskLogic.js

/**
 * Handles the specific interactive outcomes and effects of player-assigned weekly tasks.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
// REMOVED: import * as Main from '../main.js'; // Removed circular dependency
import * as dataGenerator from '../utils/dataGenerator.js';
import * as playerInteractionLogic from './playerInteractionLogic.js'; // Removed direct import


/**
 * Processes the immediate outcome of a completed player task, often displaying a modal.
 * This function should always result in a modal being shown (either specific or generic),
 * and the modal's action button(s) will be responsible for hiding it.
 * @param {object} gameState - The mutable gameState object.
 * @param {object} task - The task object that was completed.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @param {object} playerInteractionModule - The playerInteractionLogic module passed from gameLoop. // NEW: Added playerInteractionModule
 */
export function handleCompletedTaskOutcome(gameState, task, updateUICallbacks, playerInteractionModule) { // NEW params
    console.log(`DEBUG: taskLogic.handleCompletedTaskOutcome called for task type: ${task.type}`);
    let title = task.description;
    let message = '';
    let success = false;
    let specificModalOpened = false; // Flag if a specific interaction (player/recruitment) modal was opened

    // Temporarily hide any currently showing generic modal to avoid layering problems
    const wasGenericModalVisible = renderers.getModalDisplayStatus() === 'flex';
    if (wasGenericModalVisible) {
        renderers.hideModal();
    }

    switch (task.type) {
        case Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO:
            const eligiblePlayers = gameState.playerClub.squad.filter(p => p.status.morale < 70 || (p.currentSeasonStats && p.currentSeasonStats.averageRating < 6.5)); // Added check for currentSeasonStats
            const playerToTalkTo = eligiblePlayers.length > 0 ? dataGenerator.getRandomElement(eligiblePlayers) : dataGenerator.getRandomElement(gameState.playerClub.squad);

            if (playerToTalkTo) {
                const conversationTypes = ['motivate', 'ask_commitment', 'address_form'];
                const chosenConversationType = dataGenerator.getRandomElement(conversationTypes);
                
                // Pass updateUICallbacks to playerInteractionModule functions
                playerInteractionModule.startPlayerConversation(gameState, playerToTalkTo, chosenConversationType, updateUICallbacks); // Pass updateUICallbacks
                specificModalOpened = true;
                success = true; // Task successfully initiated
            } else {
                message = `You wanted to talk to a player, but couldn't find a suitable one this week.`;
                title = 'Player Conversation';
                success = false;
            }
            break;

        case Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR:
            const newPlayer = dataGenerator.generatePlayer(dataGenerator.getRandomElement(Object.values(Constants.PLAYER_POSITIONS)), dataGenerator.getRandomInt(1, 10)); // Generate a new player
            newPlayer.currentClubId = null; // Ensure they are free agents
            
            // Pass updateUICallbacks to playerInteractionModule functions
            playerInteractionModule.startRecruitmentDialogue(gameState, newPlayer, updateUICallbacks); // Pass updateUICallbacks
            specificModalOpened = true;
            success = true; // Task successfully initiated
            break;

        case Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE:
            const fundraisingSuccessChance = 60; // Base chance
            const socialSec = gameState.playerClub.committee.find(cm => cm.role === Constants.COMMITTEE_ROLES.SOC);
            const socialSecBonus = socialSec ? socialSec.skills.communityRelations : 0;
            const actualFundraisingChance = fundraisingSuccessChance + socialSecBonus;

            if (dataGenerator.getRandomInt(1, 100) < actualFundraisingChance) {
                const fundsRaised = dataGenerator.getRandomInt(100, 500);
                gameState.playerClub.finances = clubData.addTransaction(
                    gameState.playerClub.finances,
                    fundsRaised,
                    Constants.TRANSACTION_TYPE.FUNDRAISE_IN,
                    'Community Fundraiser'
                );
                message = `Your fundraising event was a success, bringing in £${fundsRaised.toFixed(2)}!`;
                title = 'Fundraiser Success!';
                success = true;
            } else {
                message = `Despite your best efforts, the fundraising event didn't attract much interest. Better luck next time.`;
                title = 'Fundraiser Disappointment';
                success = false;
            }
            break;

        case Constants.WEEKLY_TASK_TYPES.COMM_ENGAGE:
            message = `You spent time engaging with various committee members. Their satisfaction and loyalty to you increased slightly.`;
            // Implement actual committee member morale/loyalty changes here
            gameState.playerClub.committee.forEach(member => {
                // Example: Increase loyalty by a small random amount
                member.personality.loyaltyToYou = Math.min(20, member.personality.loyaltyToYou + dataGenerator.getRandomInt(1, 3));
                member.personality.currentSatisfaction = Math.min(100, member.personality.currentSatisfaction + dataGenerator.getRandomInt(1, 5));
            });
            title = 'Committee Engagement';
            success = true;
            break;

        case Constants.WEEKLY_TASK_TYPES.ADMIN_WORK:
            message = `You tackled the club's administrative backlog. Everything is now up-to-date.`;
            title = 'Admin Work Completed';
            success = true;
            break;

        case Constants.WEEKLY_TASK_TYPES.FAC_CHECK:
            message = `You performed a general check of all facilities. Minor improvements to condition across the board.`;
            for (const key in gameState.playerClub.facilities) {
                const facility = gameState.playerClub.facilities[key];
                if (facility.level > 0) {
                    gameState.playerClub.facilities = clubData.updateFacilityCondition(
                        gameState.playerClub.facilities, key, 5
                    );
                }
            }
            title = 'Facility Check';
            success = true;
            break;

        case Constants.WEEKLY_TASK_TYPES.PITCH_MAINT:
        case Constants.WEEKLY_TASK_TYPES.FIX_PITCH_DAMAGE:
            const pitch = gameState.playerClub.facilities[Constants.FACILITIES.PITCH];
            if (pitch) {
                const groundsmanSkill = gameState.playerClub.committee.find(cm => cm.role === Constants.COMMITTEE_ROLES.GRNDS)?.skills.groundsKeepingSkill || 0;
                let improvementAmount = 0;
                if (task.type === Constants.WEEKLY_TASK_TYPES.PITCH_MAINT) {
                    improvementAmount = Math.min(pitch.maxCondition - pitch.condition, 6 + Math.round(groundsmanSkill / 2));
                    message = `You performed general maintenance on the pitch. Condition improved by ${improvementAmount}%.`;
                } else { // FIX_PITCH_DAMAGE or Urgent
                    improvementAmount = Math.min(pitch.maxCondition - pitch.condition, 8 + Math.round(groundsmanSkill * 1.5));
                    if (pitch.condition < Constants.PITCH_UNPLAYABLE_THRESHOLD) { // Urgent repair
                        improvementAmount = Math.min(pitch.maxCondition - pitch.condition, 10 + groundsmanSkill * 2);
                        message = `You performed urgent repairs on the unplayable pitch. Condition improved by ${improvementAmount}%.`;
                    } else {
                        message = `You repaired major damage to the pitch. Condition improved by ${improvementAmount}%.`;
                    }
                }
                gameState.playerClub.facilities = clubData.updateFacilityCondition(
                    gameState.playerClub.facilities, Constants.FACILITIES.PITCH, improvementAmount
                );
                title = 'Pitch Maintenance';
                success = true;
            } else {
                message = `No pitch to maintain!`;
                title = 'Pitch Maintenance';
                success = false;
            }
            break;

        case Constants.WEEKLY_TASK_TYPES.CLEAN_CHGRMS_SPECIFIC:
            const chgrms = gameState.playerClub.facilities[Constants.FACILITIES.CHGRMS];
            if (chgrms) {
                const secretarySkill = gameState.playerClub.committee.find(cm => cm.role === Constants.COMMITTEE_ROLES.SEC)?.skills.administration || 0;
                const improvementAmount = Math.min(chgrms.maxCondition - chgrms.condition, 8 + Math.round(secretarySkill / 2));
                gameState.playerClub.facilities = clubData.updateFacilityCondition(
                    gameState.playerClub.facilities, Constants.FACILITIES.CHGRMS, improvementAmount
                );
                message = `You deep cleaned the changing rooms. Condition improved by ${improvementAmount}%.`;
                title = 'Changing Rooms Cleaned';
                success = true;
            } else {
                message = `No changing rooms to clean!`;
                title = 'Changing Rooms Cleaned';
                success = false;
            }
            break;

        case Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH:
            const sponsorSearchSuccessChance = 50;
            if (dataGenerator.getRandomInt(1, 100) < sponsorSearchSuccessChance) {
                const sponsorName = `${dataGenerator.getRandomName('first')} ${dataGenerator.getRandomName('last')} Co.`;
                const sponsorAmount = dataGenerator.getRandomInt(100, 500);
                gameState.playerClub.finances = clubData.addTransaction(
                    gameState.playerClub.finances,
                    sponsorAmount,
                    Constants.TRANSACTION_TYPE.SPONSOR_IN,
                    `${sponsorName} Sponsorship`
                );
                message = `Great news! Your search for sponsors paid off. ${sponsorName} has offered a one-time sponsorship of £${sponsorAmount.toFixed(2)}!`;
                title = 'New Sponsor Found!';
                success = true;
            } else {
                message = `You spent ${task.baseHours} hours looking for sponsors, but couldn't secure any deals this week. Better luck next time.`;
                title = 'Sponsor Search';
                success = false;
            }
            break;

        default:
            console.warn(`Unhandled task type in handleCompletedTaskOutcome: ${task.type}`);
            message = `Task "${task.description}" completed.`;
            title = 'Task Completed';
            success = true;
            break;
    }

    if (success) {
        gameState.messages.push({ week: gameState.currentWeek, text: `${task.description} completed successfully.` });
    } else {
        gameState.messages.push({ week: gameState.currentWeek, text: `${task.description} completed with mixed results.` });
    }
    
    // Only show a generic modal IF a specific modal was NOT opened by this task.
    if (!specificModalOpened) {
        renderers.showModal(title, message, [{ text: 'Continue', action: (gs, uic, context) => {
            renderers.hideModal();
            uic.processRemainingWeekEvents(gs, 'task_outcome', uic); // Pass uic
        }}], gameState, updateUICallbacks, 'task_outcome'); // Pass updateUICallbacks
    }
}
