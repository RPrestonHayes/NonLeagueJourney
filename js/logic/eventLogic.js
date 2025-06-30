// js/logic/eventLogic.js

/**
 * Manages the generation and handling of random in-game events.
 * Events can be positive, negative, or neutral and require player response.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
// NEW: Import dataGenerator module
import * as dataGenerator from '../utils/dataGenerator.js';


// --- Helper Functions (moved here for module scope, or imported if external) ---
// Note: getRandomInt and getRandomElement are now exported from dataGenerator, so use dataGenerator.getRandomInt
// No need to define them locally here if imported.


/**
 * Triggers a random event for the current week.
 * @param {object} gameState - The mutable gameState object.
 * @returns {object|null} The triggered event object if an event occurs, otherwise null.
 */
export function triggerRandomEvent(gameState) {
    const eventRoll = dataGenerator.getRandomInt(1, 100); // Use dataGenerator.getRandomInt
    const EVENT_CHANCE_PERCENT = 30;

    if (eventRoll > EVENT_CHANCE_PERCENT) {
        return null;
    }

    const eventTypes = Object.values(Constants.EVENT_TYPES);
    const chosenEventType = dataGenerator.getRandomElement(eventTypes); // Use dataGenerator.getRandomElement

    let event = null;
    switch (chosenEventType) {
        case Constants.EVENT_TYPES.BAD_PITCH_DAMAGE:
            event = {
                title: 'Pitch Damaged!',
                description: `A group of local youths (or perhaps wild animals) damaged the pitch overnight. It needs immediate attention!`,
                effect: () => {
                    const damageCost = dataGenerator.getRandomInt(50, 150); // Use dataGenerator.getRandomInt
                    gameState.playerClub.finances = clubData.addTransaction(
                        gameState.playerClub.finances,
                        -damageCost,
                        Constants.TRANSACTION_TYPE.OTHER_EXP,
                        'Pitch Damage Repair'
                    );
                    gameState.playerClub.facilities[Constants.FACILITIES.PITCH].status = 'Damaged';
                    gameState.messages.push({ week: gameState.currentWeek, text: `Pitch damaged, cost £${damageCost.toFixed(2)} to repair.` });
                    renderers.updateNewsFeed(`Pitch damaged! Cost £${damageCost.toFixed(2)}.`);
                },
                choices: [{ text: 'Deal with it!', action: () => {} }]
            };
            break;
        case Constants.EVENT_TYPES.GOOD_VOLUNTEER:
            const volunteerName = `${dataGenerator.getRandomName('first')} ${dataGenerator.getRandomName('last')}`;
            const volunteerRole = dataGenerator.getRandomElement([Constants.COMMITTEE_ROLES.GRNDS, Constants.COMMITTEE_ROLES.SOC, Constants.COMMITTEE_ROLES.V_COORD]);
            event = {
                title: 'New Volunteer!',
                description: `${volunteerName} from the local community has offered to volunteer as a ${volunteerRole}. What a boost!`,
                effect: () => {
                    const newVolunteer = dataGenerator.generateCommitteeMember(volunteerRole);
                    newVolunteer.name = volunteerName; // Set specific name from event context
                    gameState.playerClub.committee = clubData.addCommitteeMember(gameState.playerClub.committee, newVolunteer);
                    gameState.messages.push({ week: gameState.currentWeek, text: `New volunteer: ${volunteerName} joins as ${volunteerRole}.` });
                    renderers.updateNewsFeed(`New volunteer joins: ${volunteerName}!`);
                },
                choices: [{ text: 'Welcome them aboard!', action: () => {} }]
            };
            break;
        case Constants.EVENT_TYPES.NEUTRAL_JOURNALIST:
            event = {
                title: 'Local Press Interest!',
                description: 'A reporter from the local paper wants to do an article on your club. Good PR, but you need to be careful what you say!',
                effect: () => {
                    gameState.messages.push({ week: gameState.currentWeek, text: `Local journalist wants an interview.` });
                },
                choices: [
                    { text: 'Grant Interview (Good PR chance)', action: () => {
                        if (dataGenerator.getRandomInt(1, 100) > 50) { // Use dataGenerator.getRandomInt
                            renderers.displayMessage('Positive Publicity!', 'The article was very positive, boosting club reputation slightly.');
                            gameState.playerClub.reputation = Math.min(100, gameState.playerClub.reputation + dataGenerator.getRandomInt(1, 3)); // Use dataGenerator.getRandomInt
                        } else {
                            renderers.displayMessage('Mixed Publicity', 'The article was a bit mixed, nothing much changes.');
                        }
                        renderers.hideModal(); // Hide modal after action taken
                    }},
                    { text: 'Decline Interview (Safe)', action: () => {
                        renderers.displayMessage('No Publicity', 'You politely declined the interview. No news is good news, right?');
                        renderers.hideModal(); // Hide modal after action taken
                    }}
                ]
            };
            break;
        case Constants.EVENT_TYPES.BAD_EQUIPMENT_BREAK:
            const brokenItem = dataGenerator.getRandomElement(['lawnmower', 'goal nets', 'shower heater']); // Use dataGenerator.getRandomElement
            const repairCost = dataGenerator.getRandomInt(30, 80); // Use dataGenerator.getRandomInt
            event = {
                title: 'Equipment Breakdown!',
                description: `Your old ${brokenItem} has broken down. You'll need to pay for repairs or replace it.`,
                effect: () => {
                    gameState.playerClub.finances = clubData.addTransaction(
                        gameState.playerClub.finances,
                        -repairCost,
                        Constants.TRANSACTION_TYPE.OTHER_EXP,
                        `Repair ${brokenItem}`
                    );
                    gameState.messages.push({ week: gameState.currentWeek, text: `${brokenItem} broke, cost £${repairCost.toFixed(2)} to fix.` });
                    renderers.updateNewsFeed(`${brokenItem} broke down!`);
                },
                choices: [{ text: 'Oh dear...', action: () => {renderers.hideModal();} }] // Add action to hide modal
            };
            break;
        case Constants.EVENT_TYPES.BAD_PLAYER_ABSENT:
            // Ensure player is not already injured/suspended/absent
            const absentPlayerCandidates = playerData.getSquad().filter(p => p.status.injuryStatus === 'Fit' && !p.status.suspended);
            const absentPlayer = dataGenerator.getRandomElement(absentPlayerCandidates); // Use dataGenerator.getRandomElement
            if (absentPlayer) {
                event = {
                    title: 'Player Absent!',
                    description: `${absentPlayer.name} has called in sick/has work commitments and won't be available for the upcoming match!`,
                    effect: () => {
                        // Mark player as absent/suspended for 1 game
                        const updatedPlayerSquad = playerData.updatePlayerStats(absentPlayer.id, {
                            suspended: true,
                            suspensionGames: 1, // Simplified to 1 game absence
                            injuryStatus: 'Absent' // Mark as absent for clarity
                        });
                        // Since updatePlayerStats returns the new squad array, we should update gameState with it
                        gameState.playerClub.squad = updatedPlayerSquad;
                        playerData.updatePlayerMorale(absentPlayer.id, -5); // Morale hit
                        gameState.messages.push({ week: gameState.currentWeek, text: `${absentPlayer.name} is absent this week.` });
                        renderers.updateNewsFeed(`${absentPlayer.name} is unavailable!`);
                    },
                    choices: [{ text: 'Find a replacement!', action: () => {renderers.hideModal();} }] // Add action to hide modal
                };
            } else {
                return null; // No eligible player to be absent
            }
            break;
        case Constants.EVENT_TYPES.GOOD_SMALL_SPONSOR:
            const sponsorName = `${dataGenerator.getRandomName('last')} Co.`;
            const sponsorAmount = dataGenerator.getRandomInt(50, 200);
            event = {
                title: 'New Local Sponsor!',
                description: `${sponsorName} has offered a small one-time sponsorship of £${sponsorAmount.toFixed(2)} for the club!`,
                effect: () => {
                    gameState.playerClub.finances = clubData.addTransaction(
                        gameState.playerClub.finances,
                        sponsorAmount,
                        Constants.TRANSACTION_TYPE.SPONSOR_IN,
                        `${sponsorName} Sponsorship`
                    );
                    gameState.messages.push({ week: gameState.currentWeek, text: `Received £${sponsorAmount.toFixed(2)} sponsorship from ${sponsorName}.` });
                    renderers.updateNewsFeed(`New sponsor: ${sponsorName}!`);
                },
                choices: [{ text: 'Accept with thanks!', action: () => {renderers.hideModal();} }] // Add action to hide modal
            };
            break;
        default:
            console.warn(`Unhandled event type: ${chosenEventType}`);
            return null;
    }

    if (event && event.effect) {
        // The effect is applied here, before the modal is shown, so the state is updated.
        // The event's effect function will already have modified gameState.
    }
    return event; // Return the event object for gameLoop to display the modal
}

