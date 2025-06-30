// js/logic/eventLogic.js

/**
 * Manages the generation and handling of random in-game events.
 * Events can be positive, negative, or neutral and require player response.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js';
import * as dataGenerator from '../utils/dataGenerator.js'; // FIX: Import dataGenerator as a namespace


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
    let eventDisplayTitle = '';
    let eventDisplayMessage = '';

    switch (chosenEventType) {
        case Constants.EVENT_TYPES.BAD_PITCH_DAMAGE:
            const damageCost = dataGenerator.getRandomInt(50, 150);
            gameState.playerClub.finances = clubData.addTransaction(
                gameState.playerClub.finances,
                -damageCost,
                Constants.TRANSACTION_TYPE.OTHER_EXP,
                'Pitch Damage Repair'
            );
            gameState.playerClub.facilities = clubData.updateFacilityCondition(
                gameState.playerClub.facilities, Constants.FACILITIES.PITCH, -dataGenerator.getRandomInt(20, 50)
            );
            eventDisplayTitle = 'Pitch Damaged!';
            eventDisplayMessage = `A group of local youths (or perhaps wild animals) damaged the pitch overnight. It will cost £${damageCost.toFixed(2)} to start repairs, and its condition has dropped to ${gameState.playerClub.facilities[Constants.FACILITIES.PITCH].condition}%.`;
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Drat!', action: renderers.hideModal }]
            };
            break;

        case Constants.EVENT_TYPES.GOOD_VOLUNTEER:
            const volunteerName = `${dataGenerator.getRandomName('first')} ${dataGenerator.getRandomName('last')}`;
            const volunteerRole = dataGenerator.getRandomElement([Constants.COMMITTEE_ROLES.GRNDS, Constants.COMMITTEE_ROLES.SOC, Constants.COMMITTEE_ROLES.V_COORD]);
            const newVolunteer = dataGenerator.generateCommitteeMember(volunteerRole);
            newVolunteer.name = volunteerName;
            gameState.playerClub.committee = clubData.addCommitteeMember(gameState.playerClub.committee, newVolunteer);
            
            eventDisplayTitle = 'New Volunteer!';
            eventDisplayMessage = `${volunteerName} from the local community has offered to volunteer as a ${volunteerRole}! This is a great boost for the club.`;
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Welcome them aboard!', action: renderers.hideModal }]
            };
            break;

        case Constants.EVENT_TYPES.NEUTRAL_JOURNALIST:
            eventDisplayTitle = 'Local Press Interest!';
            eventDisplayMessage = 'A reporter from the local paper wants to do an article on your club. This is a chance for good PR!';
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [
                    { text: 'Grant Interview (Good PR chance)', action: () => {
                        let outcomeMsg = '';
                        if (dataGenerator.getRandomInt(1, 100) > 50) {
                            gameState.playerClub.reputation = Math.min(100, gameState.playerClub.reputation + dataGenerator.getRandomInt(1, 3));
                            outcomeMsg = `The article was very positive, boosting club reputation slightly to ${gameState.playerClub.reputation}%.`;
                        } else {
                            outcomeMsg = `The article was a bit mixed, nothing much changes.`;
                        }
                        renderers.showModal('Publicity Outcome', outcomeMsg, [{ text: 'Continue', action: renderers.hideModal }]); // Use showModal
                        Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `Journalist interview: ${outcomeMsg}` });
                    }},
                    { text: 'Decline Interview (Safe)', action: () => {
                        renderers.showModal('No Publicity', 'You politely declined the interview. No news is good news, right?', [{ text: 'Continue', action: renderers.hideModal }]); // Use showModal
                        Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `Journalist interview declined.` });
                    }}
                ]
            };
            break;

        case Constants.EVENT_TYPES.BAD_EQUIPMENT_BREAK:
            const brokenItem = dataGenerator.getRandomElement(['lawnmower', 'goal nets', 'shower heater']);
            const repairCost = dataGenerator.getRandomInt(30, 80);
            gameState.playerClub.finances = clubData.addTransaction(
                gameState.playerClub.finances,
                -repairCost,
                Constants.TRANSACTION_TYPE.OTHER_EXP,
                `Repair ${brokenItem}`
            );
            eventDisplayTitle = 'Equipment Breakdown!';
            eventDisplayMessage = `Your old ${brokenItem} has broken down. It cost £${repairCost.toFixed(2)} for emergency repairs.`;
            renderers.updateNewsFeed(eventDisplayTitle);

            event = {
                title: eventDisplayTitle,
                description: eventDisplayMessage,
                choices: [{ text: 'Oh dear...', action: renderers.hideModal }]
            };
            break;

        case Constants.EVENT_TYPES.BAD_PLAYER_ABSENT:
            const absentPlayerCandidates = playerData.getSquad().filter(p => p.status.injuryStatus === 'Fit' && !p.status.suspended);
            const absentPlayer = dataGenerator.getRandomElement(absentPlayerCandidates);
            if (absentPlayer) {
                const updatedPlayerSquad = playerData.updatePlayerStats(absentPlayer.id, {
                    suspended: true,
                    suspensionGames: 1,
                    injuryStatus: 'Absent'
                });
                gameState.playerClub.squad = updatedPlayerSquad;
                playerData.updatePlayerMorale(absentPlayer.id, -5);

                eventDisplayTitle = 'Player Absent!';
                eventDisplayMessage = `${absentPlayer.name} has called in sick/has work commitments and won't be available for the upcoming match! Morale dropped slightly.`;
                renderers.updateNewsFeed(eventDisplayTitle);

                event = {
                    title: eventDisplayTitle,
                    description: eventDisplayMessage,
                    choices: [{ text: 'Drat!', action: renderers.hideModal }]
                };
            } else {
                return null;
            }
            break;

        case Constants.EVENT_TYPES.GOOD_SMALL_SPONSOR:
            const sponsorName = `${dataGenerator.getRandomName('first')} ${dataGenerator.getRandomName('last')} Co.`; // Use getRandomName
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
                choices: [{ text: 'Accept with thanks!', action: renderers.hideModal }]
            };
            break;

        default:
            console.warn(`Unhandled event type in triggerRandomEvent: ${chosenEventType}`);
            return null;
    }

    if (event) {
        renderers.showModal(event.title, event.description, event.choices);
    }
    return event;
}

