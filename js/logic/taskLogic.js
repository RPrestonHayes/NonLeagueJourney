// js/logic/taskLogic.js

/**
 * Handles the specific interactive outcomes and effects of player-assigned weekly tasks.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js';
import * as dataGenerator from '../utils/dataGenerator.js';
import * as playerInteractionLogic from './playerInteractionLogic.js';


/**
 * Processes the immediate outcome of a completed player task, often displaying a modal.
 * This function should always result in a modal being shown (either specific or generic),
 * and the modal's action button(s) will be responsible for hiding it.
 * @param {object} gameState - The mutable gameState object.
 * @param {object} task - The task object that was completed.
 */
export function handleCompletedTaskOutcome(gameState, task) {
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
        case Constants.WEEKLY_TASK_TYPES.PITCH_MAINT:
            const pitchImprovementBase = task.baseHours * 2;
            let pitchImprovementBonus = 0;
            const groundsman = gameState.playerClub.committee.find(c => c.role === Constants.COMMITTEE_ROLES.GRNDS);
            if (groundsman) { pitchImprovementBonus = Math.round(groundsman.skills.groundsKeepingSkill / 2); }
            const totalPitchImprovement = pitchImprovementBase + pitchImprovementBonus;

            gameState.playerClub.facilities = clubData.updateFacilityCondition(gameState.playerClub.facilities, Constants.FACILITIES.PITCH, totalPitchImprovement);
            success = true;
            message = `You spent ${task.baseHours} hours on general pitch maintenance. Condition improved by ${totalPitchImprovement}%. Pitch condition: ${gameState.playerClub.facilities[Constants.FACILITIES.PITCH].condition}%.`;
            title = 'Pitch Maintained';
            break;

        case Constants.WEEKLY_TASK_TYPES.FIX_PITCH_DAMAGE:
            const repairAmountBase = task.baseHours * 3;
            let repairAmountBonus = 0;
            const groundsmanForRepair = gameState.playerClub.committee.find(c => c.role === Constants.COMMITTEE_ROLES.GRNDS);
            if (groundsmanForRepair) { repairAmountBonus = Math.round(groundsmanForRepair.skills.groundsKeepingSkill * 1.5); }
            const totalRepairAmount = repairAmountBase + repairAmountBonus;

            gameState.playerClub.facilities = clubData.updateFacilityCondition(gameState.playerClub.facilities, Constants.FACILITIES.PITCH, totalRepairAmount);
            success = true;
            message = `You focused on repairing specific pitch damage. Condition improved by ${totalRepairAmount}%. Pitch condition: ${gameState.playerClub.facilities[Constants.FACILITIES.PITCH].condition}%.`;
            title = 'Pitch Damage Repaired';
            break;

        case Constants.WEEKLY_TASK_TYPES.CLEAN_CHGRMS_SPECIFIC:
            const cleanAmountBase = task.baseHours * 4;
            let cleanAmountBonus = 0;
            const suitableVolunteer = gameState.playerClub.committee.find(c => c.role === Constants.COMMITTEE_ROLES.SOC || c.role === Constants.COMMITTEE_ROLES.V_COORD);
            if (suitableVolunteer) { cleanAmountBonus = Math.round(suitableVolunteer.skills.workEthic); }
            const totalCleanAmount = cleanAmountBase + cleanAmountBonus;

            gameState.playerClub.facilities = clubData.updateFacilityCondition(gameState.playerClub.facilities, Constants.FACILITIES.CHGRMS, totalCleanAmount);
            success = true;
            message = `You gave the changing rooms a deep clean. Condition improved by ${totalCleanAmount}%. Changing Rooms condition: ${gameState.playerClub.facilities[Constants.FACILITIES.CHGRMS].condition}%.`;
            title = 'Changing Rooms Cleaned';
            break;

        case Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO:
            const playerToTalkTo = dataGenerator.getRandomElement(playerData.getSquad().filter(p => p.status.morale < 80) || playerData.getSquad());
            if (playerToTalkTo) {
                playerInteractionLogic.startPlayerConversation(playerToTalkTo, 'motivate');
                specificModalOpened = true;
            } else {
                title = 'Player Conversation';
                message = `You spent time trying to talk to players, but couldn't find anyone needing a chat.`;
                success = true;
            }
            break;

        case Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR:
            const potentialPlayer = dataGenerator.generatePlayer(null, dataGenerator.getRandomInt(1, 2));
            playerInteractionLogic.attemptRecruitment(potentialPlayer, gameState.playerClub.id);
            specificModalOpened = true;
            break;

        case Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE:
            message = `You put in ${task.baseHours} hours planning a fundraising event. It's set for next month!`;
            title = 'Fundraiser Planned';
            success = true;
            break;

        case Constants.WEEKLY_TASK_TYPES.ADMIN_WORK:
            message = `You diligently handled club administration for ${task.baseHours} hours. All paperwork is up to date.`;
            title = 'Admin Duties Completed';
            success = true;
            break;

        case Constants.WEEKLY_TASK_TYPES.FAC_CHECK:
            message = `You thoroughly checked the club's facilities for ${task.baseHours} hours. All appears to be in order for now.`;
            title = 'Facilities Checked';
            success = true;
            break;

        case Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH:
            const sponsorSearchChance = dataGenerator.getRandomInt(1, 100);
            const baseSponsorChance = 30 + (gameState.playerClub.reputation / 2);
            if (sponsorSearchChance <= baseSponsorChance) {
                const sponsorAmount = dataGenerator.getRandomInt(50, 250);
                const sponsorName = `${dataGenerator.getRandomName('last')} Corp.`;
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
        Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${task.description} completed successfully.` });
    } else {
        Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${task.description} completed with mixed results.` });
    }
    
    // Only show a generic modal IF a specific modal was NOT opened by this task.
    if (!specificModalOpened) {
        renderers.showModal(title, message, [{ text: 'Continue', action: renderers.hideModal }]);
    }
}

