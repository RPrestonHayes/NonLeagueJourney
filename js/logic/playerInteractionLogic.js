// js/logic/playerInteractionLogic.js

/**
 * Manages player-specific interactions, such as conversations, morale adjustments,
 * and recruitment dialogues.
 */

import * as Constants from '../utils/constants.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js'; // Import Main to update game state after interaction if necessary, or trigger UI update

// --- Helper Functions ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Initiates a conversation with a specific player.
 * Presents dialogue choices and applies effects based on player's response.
 * @param {object} player - The player object to interact with.
 * @param {string} interactionType - The type of interaction (e.g., 'motivate', 'ask_commitment', 'address_form').
 */
export function startPlayerConversation(player, interactionType) {
    let title = `Talking to ${player.name}`;
    let message = '';
    let choices = []; // Declare choices here

    switch (interactionType) {
        case 'motivate':
            message = `You pull ${player.name} aside for a motivational chat. "Keep your head up, mate. We know what you can do."`;
            choices = [
                {
                    text: 'Focus on recent performance',
                    action: () => {
                        let moraleChange = getRandomInt(3, 8);
                        let feedback = '';
                        if (player.status.morale < 50) {
                            moraleChange = getRandomInt(8, 15); // Bigger boost if very low
                            feedback = `"${player.name} seems re-energized after your talk, morale greatly improved."`;
                        } else {
                            feedback = `"${player.name} appreciates the support. Morale slightly boosted."`;
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.displayMessage('Player Morale', `${player.name} morale is now ${player.status.morale}%. ${feedback}`);
                        Main.updateUI();
                        renderers.hideModal(); // Hide modal after action taken
                    },
                    isPrimary: true
                },
                {
                    text: 'Remind him of team goals',
                    action: () => {
                        let moraleChange = getRandomInt(1, 5);
                        let feedback = '';
                        if (player.traits.ambition > 7) {
                            moraleChange += getRandomInt(2, 5);
                            feedback = `"${player.name} is fired up by the team's ambition. Morale improved."`;
                        } else {
                            feedback = `"${player.name} nods. Morale slightly improved."`;
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.displayMessage('Player Morale', `${player.name} morale is now ${player.status.morale}%. ${feedback}`);
                        Main.updateUI();
                        renderers.hideModal(); // Hide modal after action taken
                    }
                }
            ];
            break;

        case 'ask_commitment':
            message = `You approach ${player.name} to discuss his commitment. "How are you feeling about things, commitment-wise?"`;
            choices = [
                {
                    text: 'Emphasize club’s future',
                    action: () => {
                        let moraleChange = 0;
                        let feedback = '';
                        if (player.traits.commitmentLevel === 'Low') {
                            feedback = `"${player.name} looks a bit sheepish, but promises to try harder. Commitment unchanged for now."`;
                        } else if (player.traits.commitmentLevel === 'Medium') {
                            feedback = `"${player.name} confirms he's still invested. Commitment slightly reinforced."`;
                            moraleChange = 3;
                        } else {
                            feedback = `"${player.name} reaffirms his dedication. Commitment already high."`;
                            moraleChange = 1;
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.displayMessage('Player Commitment', feedback);
                        Main.updateUI();
                        renderers.hideModal(); // Hide modal after action taken
                    },
                    isPrimary: true
                },
                {
                    text: 'Offer to help with issues (if any)',
                    action: () => {
                        message = `"${player.name} appreciates the offer, but says he's fine. Morale slightly up."`;
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, 2);
                        renderers.displayMessage('Player Support', message);
                        Main.updateUI();
                        renderers.hideModal(); // Hide modal after action taken
                    }
                }
            ];
            break;

        case 'address_form':
            message = `You need to talk to ${player.name} about his recent dip in form. "What's going on out there, mate?"`;
            choices = [
                {
                    text: 'Be direct, demand more',
                    action: () => {
                        let moraleChange = -getRandomInt(5, 10);
                        let feedback = '';
                        if (player.traits.temperament < 5) { // Fiery player might react badly
                            moraleChange = -getRandomInt(10, 15);
                            feedback = `"${player.name} seems agitated and morale drops significantly."`;
                        } else {
                            feedback = `"${player.name} seems to take it on board. Morale slightly drops, but might improve performance."`;
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.displayMessage('Player Performance', `${player.name} morale is now ${player.status.morale}%. ${feedback}`);
                        Main.updateUI();
                        renderers.hideModal(); // Hide modal after action taken
                    },
                    isPrimary: true
                },
                {
                    text: 'Offer support, identify solutions',
                    action: () => {
                        let moraleChange = getRandomInt(1, 5);
                        let feedback = `"${player.name} responds positively to your supportive approach. Morale slightly up."`;
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.displayMessage('Player Performance', `${player.name} morale is now ${player.status.morale}%. ${feedback}`);
                        Main.updateUI();
                        renderers.hideModal(); // Hide modal after action taken
                    }
                }
            ];
            break;

        default:
            console.warn(`Unknown player interaction type: ${interactionType}`);
            return;
    }

    renderers.showModal(title, message, choices);
}

/**
 * Initiates a recruitment attempt for a new player.
 * @param {object} newPlayer - The potential new player object.
 * @param {string} playerClubId - The ID of the player's club.
 */
export function attemptRecruitment(newPlayer, playerClubId) {
    const title = `Recruiting ${newPlayer.name}`;
    let message = '';
    let choices = []; // <-- ADD THIS LINE! Declare choices here
    let successChance = 50 + (Main.gameState.playerClub.reputation - newPlayer.traits.ambition * 2);

    successChance = Math.max(10, Math.min(90, successChance));

    message = `You approach ${newPlayer.name} to offer him a place at your club. His ambition is ${newPlayer.traits.ambition}/10. Your club's reputation is ${Main.gameState.playerClub.reputation}/20.`;

    choices = [
        {
            text: 'Offer a compelling vision',
            action: () => {
                let outcomeMessage = '';
                // Higher chance with compelling vision
                if (getRandomInt(1, 100) < successChance + getRandomInt(5,15)) {
                    Main.gameState.playerClub.squad = playerData.addPlayer(newPlayer, playerClubId);
                    outcomeMessage = `${newPlayer.name} is impressed by your vision and agrees to join the club! Welcome aboard!`;
                    Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `New signing: ${newPlayer.name} joins the squad!` });
                } else {
                    outcomeMessage = `${newPlayer.name} politely declines, stating he's not convinced by the current project.`;
                }
                renderers.displayMessage('Recruitment Outcome', outcomeMessage);
                Main.updateUI();
                renderers.hideModal(); // Hide modal after action taken
            },
            isPrimary: true
        },
        {
            text: 'Emphasize local camaraderie',
            action: () => {
                let outcomeMessage = '';
                // Standard chance with camaraderie, maybe slight bonus for loyalty trait
                let actualChance = successChance;
                if (newPlayer.traits.loyalty > 15) actualChance += getRandomInt(2, 5);

                if (getRandomInt(1, 100) < actualChance) {
                    Main.gameState.playerClub.squad = playerData.addPlayer(newPlayer, playerClubId);
                    outcomeMessage = `${newPlayer.name} is swayed by the promise of local camaraderie and joins the club!`;
                    Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `New signing: ${newPlayer.name} joins the squad!` });
                } else {
                    outcomeMessage = `${newPlayer.name} thanks you but prefers to stay with his current setup.`;
                }
                renderers.displayMessage('Recruitment Outcome', outcomeMessage);
                Main.updateUI();
                renderers.hideModal(); // Hide modal after action taken
            }
        }
    ];

    renderers.showModal(title, message, choices);
}

// NOTE: This module might directly modify gameState.playerClub.squad via playerData functions.
// It relies on Main.updateUI() to reflect changes.

