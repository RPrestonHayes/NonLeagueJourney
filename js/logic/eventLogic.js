// js/logic/eventLogic.js

/**
 * Manages the generation and handling of random in-game events.
 * Events can be positive, negative, or neutral and require player response.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
import * as gameLoop from './gameLoop.js'; // Import gameLoop to call processRemainingWeekEvents
import * as dataGenerator from '../utils/dataGenerator.js';
// REMOVED: import * as playerInteractionLogic from './playerInteractionLogic.js'; // Removed direct import


/**
 * Triggers a random event for the current week.
 * @param {object} gameState - The mutable gameState object.
 * @param {number} eventChanceMultiplier - Multiplier for event chance (e.g., from December conditions).
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @param {function} startRecruitmentDialogueCallback - Callback function for starting recruitment dialogue. // NEW
 * @param {function} startPlayerConversationCallback - Callback function for starting player conversation. // NEW
 * @returns {object|null} The triggered event object if an event occurs, otherwise null.
 */
export function triggerRandomEvent(gameState, eventChanceMultiplier = 1, updateUICallbacks, startRecruitmentDialogueCallback, startPlayerConversationCallback) { // NEW params
    const eventRoll = dataGenerator.getRandomInt(1, 100);
    const baseEventChancePercent = 30; // Base chance
    const actualEventChance = baseEventChancePercent * eventChanceMultiplier; // Apply multiplier

    if (eventRoll > actualEventChance) {
        return null;
    }

    const eventTypes = Object.values(Constants.EVENT_TYPES);
    const chosenEventType = dataGenerator.getRandomElement(eventTypes);

    let eventDisplayTitle = '';
    let eventDisplayMessage = '';
    let event = null;

    switch (chosenEventType) {
        case Constants.EVENT_TYPES.GOOD_VOLUNTEER:
            const newVolunteer = dataGenerator.generateCommitteeMember(dataGenerator.getRandomElement(Object.values(Constants.COMMITTEE_ROLES).filter(r => r !== Constants.COMMITTEE_ROLES.CHAIR)));
            gameState.playerClub.committee = clubData.addCommitteeMember(gameState.playerClub.committee, newVolunteer);
            eventDisplayTitle = 'New Volunteer!';
            eventDisplayMessage = `${newVolunteer.name} has offered to volunteer as your new ${newVolunteer.role}! Their skills will be a great asset.`;
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Welcome them aboard!', action: (gs, uic, context) => {
                    renderers.hideModal();
                    gameLoop.processRemainingWeekEvents(gs, 'random_event', uic); // Pass uic
                } }]
            };
            break;

        case Constants.EVENT_TYPES.BAD_PITCH_DAMAGE:
            const damageAmount = dataGenerator.getRandomInt(10, 30);
            gameState.playerClub.facilities = clubData.updateFacilityCondition(
                gameState.playerClub.facilities,
                Constants.FACILITIES.PITCH,
                -damageAmount
            );
            eventDisplayTitle = 'Pitch Damaged!';
            eventDisplayMessage = `Vandals have damaged the pitch! Condition reduced by ${damageAmount}%. You'll need to allocate time to fix it.`;
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Drat!', action: (gs, uic, context) => {
                    renderers.hideModal();
                    gameLoop.processRemainingWeekEvents(gs, 'random_event', uic); // Pass uic
                } }]
            };
            break;

        case Constants.EVENT_TYPES.NEUTRAL_JOURNALIST:
            eventDisplayTitle = 'Journalist Request';
            eventDisplayMessage = 'A local journalist wants an interview about the club\'s progress. This could be good PR, or a risk...';
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [
                    { text: 'Grant Interview (Risky PR)', action: (gs, uic, context) => {
                        renderers.hideModal();
                        const outcomeRoll = dataGenerator.getRandomInt(1, 100);
                        let prMessage = '';
                        if (outcomeRoll < 40) {
                            prMessage = 'The interview went well! Your reputation has increased slightly.';
                            gameState.playerClub.reputation += 1;
                        } else if (outcomeRoll < 70) {
                            prMessage = 'The interview was neutral. No real impact.';
                        } else {
                            prMessage = 'The journalist twisted your words! Your reputation has decreased slightly.';
                            gameState.playerClub.reputation = Math.max(1, gameState.playerClub.reputation - 1);
                        }
                        renderers.showModal('Interview Outcome', prMessage, [{ text: 'OK', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            gameLoop.processRemainingWeekEvents(gsInner, 'random_event', uicInner); // Pass uicInner
                        }}], gs, uic, context);
                    } },
                    { text: 'Decline Interview (Safe)', action: (gs, uic, context) => {
                        renderers.hideModal();
                        renderers.showModal('Interview Declined', 'You politely declined the interview request. No impact.', [{ text: 'OK', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            gameLoop.processRemainingWeekEvents(gsInner, 'random_event', uicInner); // Pass uicInner
                        }}], gs, uic, context);
                    } }
                ]
            };
            break;

        case Constants.EVENT_TYPES.BAD_PLAYER_ABSENT:
            const absentPlayer = dataGenerator.getRandomElement(gameState.playerClub.squad.filter(p => !p.status.suspended && p.status.injuryStatus === 'Fit'));
            if (absentPlayer) {
                playerData.updatePlayerStats(absentPlayer.id, { status: { ...absentPlayer.status, injuryStatus: 'Absent', injuryReturnDate: 'Next Week' } });
                eventDisplayTitle = 'Player Absent!';
                eventDisplayMessage = `${absentPlayer.name} has called in sick for the upcoming match due to work commitments. You'll be without him this week!`;
                renderers.updateNewsFeed(eventDisplayTitle);
            } else { // Fallback if no eligible player found
                eventDisplayTitle = 'Minor Annoyance';
                eventDisplayMessage = 'A minor issue arose, but was quickly resolved. No major impact.';
            }

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Drat!', action: (gs, uic, context) => {
                    renderers.hideModal();
                    gameLoop.processRemainingWeekEvents(gs, 'random_event', uic); // Pass uic
                } }]
            };
            break;

        case Constants.EVENT_TYPES.GOOD_YOUTH_INTEREST:
            const newYouthPlayer = dataGenerator.generatePlayer(dataGenerator.getRandomElement(Object.values(Constants.PLAYER_POSITIONS)), dataGenerator.getRandomInt(1, 5));
            newYouthPlayer.age = dataGenerator.getRandomInt(16, 18); // Make them younger
            newYouthPlayer.currentClubId = gameState.playerClub.id; // Set their club to yours if they join
            eventDisplayTitle = 'Youth Talent Emerges!';
            eventDisplayMessage = `A promising young talent, ${newYouthPlayer.name} (${newYouthPlayer.age}, ${newYouthPlayer.preferredPosition}), from the local area has expressed interest in joining your club!`;
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [
                    { text: 'Invite to Training (Recruit)', action: (gs, uic, context) => {
                        renderers.hideModal();
                        // Use the passed callback function directly
                        startRecruitmentDialogueCallback(gs, newYouthPlayer, uic); // Pass uic
                    }, isPrimary: true },
                    { text: 'Ignore (Miss Opportunity)', action: (gs, uic, context) => {
                        renderers.hideModal();
                        renderers.showModal('Opportunity Missed', 'You decided to look elsewhere. No impact.', [{ text: 'OK', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            gameLoop.processRemainingWeekEvents(gsInner, 'random_event', uicInner); // Pass uicInner
                        }}], gs, uic, context);
                    } }
                ]
            };
            break;

        case Constants.EVENT_TYPES.BAD_COUNCIL_COMPLAINT:
            eventDisplayTitle = 'Council Complaint';
            eventDisplayMessage = 'The local council has received a complaint about noise/parking on match days. This could lead to a fine or restrictions!';
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Acknowledge (Reputation Risk)', action: (gs, uic, context) => {
                    renderers.hideModal();
                    const outcomeRoll = dataGenerator.getRandomInt(1, 100);
                    let councilMessage = '';
                    if (outcomeRoll < 50) {
                        councilMessage = 'The council issued a warning. No immediate fine, but reputation slightly hit.';
                        gameState.playerClub.reputation = Math.max(1, gameState.playerClub.reputation - 1);
                    } else {
                        councilMessage = 'The council issued a £50 fine. Reputation unaffected, but hit to finances.';
                        gameState.playerClub.finances = clubData.addTransaction(gameState.playerClub.finances, -50, Constants.TRANSACTION_TYPE.OTHER_EXP, 'Council Fine');
                    }
                    renderers.showModal('Council Outcome', councilMessage, [{ text: 'OK', action: (gsInner, uicInner, contextInner) => {
                        renderers.hideModal();
                        gameLoop.processRemainingWeekEvents(gsInner, 'random_event', uicInner); // Pass uicInner
                    }}], gs, uic, context);
                } }]
            };
            break;

        case Constants.EVENT_TYPES.GOOD_SMALL_SPONSOR:
            const sponsorName = `${dataGenerator.getRandomName('first')} ${dataGenerator.getRandomName('last')} Co.`;
            const sponsorAmount = dataGenerator.getRandomInt(50, 200);
            gameState.playerClub.finances = clubData.addTransaction(
                gameState.playerClub.finances,
                sponsorAmount,
                Constants.TRANSACTION_TYPE.SPONSOR_IN,
                `${sponsorName} Sponsorship`
            );
            eventDisplayTitle = 'New Local Sponsor!';
            eventDisplayMessage = `${sponsorName} has offered a small one-time sponsorship of £${sponsorAmount.toFixed(2)} for the club! A welcome financial boost.`;
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Accept with thanks!', action: (gs, uic, context) => {
                    renderers.hideModal();
                    gameLoop.processRemainingWeekEvents(gs, 'random_event', uic); // Pass uic
                } }]
            };
            break;

        default:
            console.warn(`Unhandled event type in triggerRandomEvent: ${chosenEventType}`);
            return null;
    }

    if (event) {
        renderers.showModal(event.title, event.description, event.choices, gameState, updateUICallbacks, 'random_event');
    }
    return event;
}
