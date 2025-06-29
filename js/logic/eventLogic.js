// js/logic/eventLogic.js

/**
 * Manages the generation and handling of random in-game events.
 * Events can be positive, negative, or neutral and require player response.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js'; // To interact with club finances/facilities
import * as playerData from '../data/playerData.js'; // To interact with player morale/status
import * as renderers from '../ui/renderers.js'; // To show modal events

// --- Helper Functions ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Triggers a random event for the current week.
 * @param {object} gameState - The mutable gameState object.
 * @returns {object|null} The triggered event object if an event occurs, otherwise null.
 */
export function triggerRandomEvent(gameState) {
    const eventRoll = getRandomInt(1, 100); // 1-100 to determine if an event happens
    const EVENT_CHANCE_PERCENT = 30; // 30% chance for an event each week (can be adjusted)

    if (eventRoll > EVENT_CHANCE_PERCENT) {
        return null; // No event this week
    }

    const eventTypes = Object.values(Constants.EVENT_TYPES);
    const chosenEventType = getRandomElement(eventTypes);

    let event = null;
    switch (chosenEventType) {
        case Constants.EVENT_TYPES.BAD_PITCH_DAMAGE:
            event = {
                title: 'Pitch Damaged!',
                description: `A group of local youths (or perhaps wild animals) damaged the pitch overnight. It needs immediate attention!`,
                effect: () => {
                    // Reduce pitch quality, incur cost, add to tasks
                    const damageCost = getRandomInt(50, 150);
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
                choices: [{ text: 'Deal with it!', action: () => {} }] // Action already in effect
            };
            break;
        case Constants.EVENT_TYPES.GOOD_VOLUNTEER:
            const volunteerName = `${dataGenerator.getRandomName('first')} ${dataGenerator.getRandomName('last')}`;
            const volunteerRole = getRandomElement([Constants.COMMITTEE_ROLES.GRNDS, Constants.COMMITTEE_ROLES.SOC, Constants.COMMITTEE_ROLES.V_COORD]); // Example roles
            event = {
                title: 'New Volunteer!',
                description: `${volunteerName} from the local community has offered to volunteer as a ${volunteerRole}. What a boost!`,
                effect: () => {
                    const newVolunteer = dataGenerator.generateCommitteeMember(volunteerRole); // Use committee member generation for volunteers
                    newVolunteer.name = volunteerName; // Set specific name
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
                    // No direct effect, but player can respond with dialogue choice later
                    gameState.messages.push({ week: gameState.currentWeek, text: `Local journalist wants an interview.` });
                },
                choices: [
                    { text: 'Grant Interview (Good PR chance)', action: () => {
                        if (getRandomInt(1, 100) > 50) {
                            renderers.displayMessage('Positive Publicity!', 'The article was very positive, boosting club reputation slightly.');
                            gameState.playerClub.reputation = Math.min(100, gameState.playerClub.reputation + getRandomInt(1, 3));
                        } else {
                            renderers.displayMessage('Mixed Publicity', 'The article was a bit mixed, nothing much changes.');
                        }
                    }},
                    { text: 'Decline Interview (Safe)', action: () => {
                        renderers.displayMessage('No Publicity', 'You politely declined the interview. No news is good news, right?');
                    }}
                ]
            };
            break;
        case Constants.EVENT_TYPES.BAD_EQUIPMENT_BREAK:
            const brokenItem = getRandomElement(['lawnmower', 'goal nets', 'shower heater']);
            const repairCost = getRandomInt(30, 80);
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
                choices: [{ text: 'Oh dear...', action: () => {} }]
            };
            break;
        case Constants.EVENT_TYPES.BAD_PLAYER_ABSENT:
            const absentPlayer = getRandomElement(playerData.getSquad().filter(p => p.status.injuryStatus === 'Fit' && !p.status.suspended));
            if (absentPlayer) {
                event = {
                    title: 'Player Absent!',
                    description: `${absentPlayer.name} has called in sick/has work commitments and won't be available for the upcoming match!`,
                    effect: () => {
                        playerData.updatePlayerStats(absentPlayer.id, {
                            status: {
                                ...absentPlayer.status,
                                suspended: true, // Temporarily use suspended for absence
                                suspensionGames: 1,
                                injuryStatus: 'Absent'
                            }
                        });
                        playerData.updatePlayerMorale(absentPlayer.id, -5); // Morale hit
                        gameState.messages.push({ week: gameState.currentWeek, text: `${absentPlayer.name} is absent this week.` });
                        renderers.updateNewsFeed(`${absentPlayer.name} is unavailable!`);
                    },
                    choices: [{ text: 'Find a replacement!', action: () => {} }]
                };
            } else {
                // If no eligible player to be absent, re-roll or skip event
                return null;
            }
            break;
        case Constants.EVENT_TYPES.GOOD_SMALL_SPONSOR:
            const sponsorName = `${dataGenerator.getRandomName('last')} Co.`;
            const sponsorAmount = getRandomInt(50, 200); // Small, one-time amount
            event = {
                title: 'New Local Sponsor!',
                description: `${sponsorName} has offered a small one-time sponsorship of £${sponsorAmount} for the club!`,
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
                choices: [{ text: 'Accept with thanks!', action: () => {} }]
            };
            break;
        // Add more event types here
        default:
            console.warn(`Unhandled event type: ${chosenEventType}`);
            return null;
    }

    // Apply the event's direct effect immediately
    if (event && event.effect) {
        event.effect();
    }
    return event;
}

