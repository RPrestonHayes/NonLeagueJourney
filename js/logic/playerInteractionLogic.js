// js/logic/playerInteractionLogic.js

/**
 * Manages player-specific interactions, such as conversations, morale adjustments,
 * and recruitment dialogues.
 */

import * as Constants from '../utils/constants.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
// REMOVED: import * as Main from '../main.js'; // Removed circular dependency
import { getRandomInt, getRandomElement, getRandomName } from '../utils/dataGenerator.js';


/**
 * Initiates a conversation with a specific player.
 * Presents dialogue choices and applies effects based on player's response.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} player - The player object to interact with.
 * @param {string} interactionType - The type of interaction (e.g., 'motivate', 'ask_commitment', 'address_form').
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
export function startPlayerConversation(gameState, player, interactionType, updateUICallbacks) {
    console.log(`DEBUG: playerInteractionLogic.startPlayerConversation called for ${player.name}, type: ${interactionType}`);
    let title = `Talking to ${player.name}`;
    let message = '';
    let choices = [];

    switch (interactionType) {
        case 'motivate':
            message = `You pull ${player.name} aside for a motivational chat. "Keep your head up, mate. We know what you can do."`;
            choices = [
                {
                    text: 'Focus on recent performance',
                    action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                        renderers.hideModal();
                        let outcomeMessage = ''; // Initialize
                        let moraleChange = 0;
                        // Check if player.currentSeasonStats and averageRating exist
                        if (player.currentSeasonStats && typeof player.currentSeasonStats.averageRating !== 'undefined' && player.currentSeasonStats.averageRating < 6.0) {
                            moraleChange = getRandomInt(5, 10);
                            outcomeMessage = `${player.name} seems to respond well to your directness. Morale increased!`;
                        } else {
                            moraleChange = getRandomInt(1, 3);
                            outcomeMessage = `${player.name} acknowledges your words. Morale slightly increased.`;
                        }
                        gs.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange); // Use gs.playerClub
                        renderers.showModal('Conversation Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            uicInner.processRemainingWeekEvents(gsInner, 'player_conversation', uicInner); // Pass uicInner
                        }}], gs, uic, context); // Pass gs, uic, context to nested modal
                    }
                },
                {
                    text: 'Emphasize team spirit',
                    action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                        renderers.hideModal();
                        let outcomeMessage = '';
                        let moraleChange = 0;
                        if (player.traits.loyalty > 10) {
                            moraleChange = getRandomInt(7, 12);
                            outcomeMessage = `${player.name} is a team player and appreciates your focus on unity. Morale significantly increased!`;
                        } else {
                            moraleChange = getRandomInt(2, 5);
                            outcomeMessage = `${player.name} nods. Morale slightly increased.`;
                        }
                        gs.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange); // Use gs.playerClub
                        renderers.showModal('Conversation Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            uicInner.processRemainingWeekEvents(gsInner, 'player_conversation', uicInner); // Pass uicInner
                        }}], gs, uic, context); // Pass gs, uic, context to nested modal
                    }
                }
            ];
            break;
        case 'ask_commitment':
            message = `You ask ${player.name} about his future at the club. "We're building something special here, and we want you to be a part of it long-term."`;
            choices = [
                {
                    text: 'Offer new contract (if available)',
                    action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                        renderers.hideModal();
                        let outcomeMessage = ''; // Initialize
                        // Check if player.overallRating exists before using it
                        const playerOverallRating = player.overallRating || 1; // Default to 1 if undefined
                        if (player.age < 25 && playerOverallRating > 10 && gs.playerClub.finances.balance > 100) { // Use gs.playerClub
                            outcomeMessage = `${player.name} is happy to discuss terms. He's keen to stay! (Contract negotiation to be implemented)`;
                            // Trigger a follow-up task/event for contract negotiation
                        } else {
                            outcomeMessage = `${player.name} isn't interested in a new deal right now.`;
                        }
                        renderers.showModal('Commitment Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            uicInner.processRemainingWeekEvents(gsInner, 'player_conversation', uicInner); // Pass uicInner
                        }}], gs, uic, context);
                    }
                },
                {
                    text: 'Emphasize club vision',
                    action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                        renderers.hideModal();
                        let outcomeMessage = '';
                        if (player.traits.ambition < 10 && player.traits.loyalty > 15) {
                            outcomeMessage = `${player.name} is swayed by the club's long-term vision. His commitment has deepened.`;
                            player.traits.commitmentLevel = 'High'; // Direct change for now
                        } else {
                            outcomeMessage = `${player.name} listens politely, but remains non-committal.`;
                        }
                        // Morale change for this path as well
                        gs.playerClub.squad = playerData.updatePlayerMorale(player.id, getRandomInt(-2, 2)); // Use gs.playerClub
                        renderers.showModal('Commitment Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            uicInner.processRemainingWeekEvents(gsInner, 'player_conversation', uicInner); // Pass uicInner
                        }}], gs, uic, context);
                    }
                }
            ];
            break;
        case 'address_form':
            message = `You address ${player.name}'s recent dip in form. "You're better than this. What's going on?"`;
            choices = [
                {
                    text: 'Offer extra training',
                    action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                        renderers.hideModal();
                        let outcomeMessage = ''; // Initialize
                        let moraleChange = 0;
                        if (player.traits.professionalism > 10) {
                            outcomeMessage = `${player.name} accepts the challenge. His form should improve.`;
                            moraleChange = getRandomInt(2, 5);
                            // Future: Add temporary stat boost or faster form recovery
                        } else {
                            outcomeMessage = `${player.name} seems unenthusiastic. No immediate change.`;
                            moraleChange = getRandomInt(-2, 0);
                        }
                        gs.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange); // Use gs.playerClub
                        renderers.showModal('Form Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            uicInner.processRemainingWeekEvents(gsInner, 'player_conversation', uicInner); // Pass uicInner
                        }}], gs, uic, context);
                    }
                },
                {
                    text: 'Suggest a break',
                    action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                        renderers.hideModal();
                        let outcomeMessage = '';
                        let moraleChange = 0;
                        if (player.traits.temperament < 5) { // More volatile players might appreciate a break
                            outcomeMessage = `${player.name} is grateful for the understanding. Morale improved.`;
                            moraleChange = getRandomInt(5, 10);
                            // Future: Player might miss next match, but return refreshed
                        } else {
                            outcomeMessage = `${player.name} is confused by the suggestion. Morale slightly dipped.`;
                            moraleChange = getRandomInt(-3, -1);
                        }
                        gs.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange); // Use gs.playerClub
                        renderers.showModal('Form Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                            renderers.hideModal();
                            uicInner.processRemainingWeekEvents(gsInner, 'player_conversation', uicInner); // Pass uicInner
                        }}], gs, uic, context);
                    }
                }
            ];
            break;
        default:
            message = `You had a general chat with ${player.name}.`;
            choices = [{ text: 'OK', action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                renderers.hideModal();
                uic.processRemainingWeekEvents(gs, 'player_conversation', uic); // Pass uic
            }}]; // Default action
            break;
    }

    renderers.showModal(title, message, choices, gameState, updateUICallbacks, 'player_conversation');
}

/**
 * Initiates a recruitment dialogue with a new player who has expressed interest.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} newPlayer - The player object to recruit.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
export function startRecruitmentDialogue(gameState, newPlayer, updateUICallbacks) {
    console.log(`DEBUG: playerInteractionLogic.startRecruitmentDialogue called for ${newPlayer.name}`);
    const title = `Recruiting ${newPlayer.name}`;
    const message = `Young talent ${newPlayer.name} (${newPlayer.age}, ${newPlayer.preferredPosition}) is interested in joining. How do you convince them?`;
    // Ensure newPlayer.overallRating exists or default it for the chance calculation
    const playerOverallRating = newPlayer.overallRating || 1; // Default to 1 if undefined
    const successChance = 50 + (newPlayer.traits.ambition < 10 ? 10 : 0) + (playerOverallRating < 10 ? 10 : 0); // Easier to recruit less ambitious/lower rated

    const choices = [
        {
            text: 'Promise regular first-team football',
            action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                renderers.hideModal(); // Hide choice modal
                let outcomeMessage = ''; // Initialize
                let actualChance = successChance;
                if (playerOverallRating < 8) actualChance += getRandomInt(5, 10); // Use playerOverallRating

                if (getRandomInt(1, 100) < actualChance) {
                    gs.playerClub.squad = playerData.addPlayer(newPlayer, gs.playerClub.id);
                    outcomeMessage = `SUCCESS! ${newPlayer.name} is convinced by the promise of game time and joins the club!`;
                    gs.messages.push({ week: gs.currentWeek, text: `New signing: ${newPlayer.name} joins the squad!` });
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                        renderers.hideModal();
                        uicInner.processRemainingWeekEvents(gsInner, 'recruitment_outcome', uicInner); // Pass uicInner
                    }}], gs, uic, context);
                } else {
                    outcomeMessage = `FAILED. ${newPlayer.name} isn't convinced by your promises and looks elsewhere.`;
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                        renderers.hideModal();
                        uicInner.processRemainingWeekEvents(gsInner, 'recruitment_outcome', uicInner); // Pass uicInner
                    }}], gs, uic, context);
                }
            },
            isPrimary: true
        },
        {
            text: 'Emphasize local camaraderie',
            action: (gs, uic, context) => { // gs and uic are passed from renderers.showModal
                renderers.hideModal(); // Hide choice modal
                let outcomeMessage = ''; // Initialize
                let actualChance = successChance;
                if (newPlayer.traits.loyalty > 15) actualChance += getRandomInt(2, 5);

                if (getRandomInt(1, 100) < actualChance) {
                    gs.playerClub.squad = playerData.addPlayer(newPlayer, gs.playerClub.id);
                    outcomeMessage = `SUCCESS! ${newPlayer.name} is swayed by the promise of local camaraderie and joins the club!`;
                    gs.messages.push({ week: gs.currentWeek, text: `New signing: ${newPlayer.name} joins the squad!` });
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                        renderers.hideModal();
                        uicInner.processRemainingWeekEvents(gsInner, 'recruitment_outcome', uicInner); // Pass uicInner
                    }}], gs, uic, context);
                } else {
                    outcomeMessage = `FAILED. ${newPlayer.name} thanks you but prefers to stay with his current setup.`;
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: (gsInner, uicInner, contextInner) => {
                        renderers.hideModal();
                        uicInner.processRemainingWeekEvents(gsInner, 'recruitment_outcome', uicInner); // Pass uicInner
                    }}], gs, uic, context);
                }
            }
        }
    ];

    renderers.showModal(title, message, choices, gameState, updateUICallbacks);
}
