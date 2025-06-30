// js/logic/playerInteractionLogic.js

/**
 * Manages player-specific interactions, such as conversations, morale adjustments,
 * and recruitment dialogues.
 */

import * as Constants from '../utils/constants.js';
import * as playerData from '../data/playerData.js';
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js';
import { getRandomInt, getRandomElement, getRandomName } from '../utils/dataGenerator.js';


/**
 * Initiates a conversation with a specific player.
 * Presents dialogue choices and applies effects based on player's response.
 * @param {object} player - The player object to interact with.
 * @param {string} interactionType - The type of interaction (e.g., 'motivate', 'ask_commitment', 'address_form').
 */
export function startPlayerConversation(player, interactionType) {
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
                    action: () => {
                        renderers.hideModal(); // Hide choice modal
                        let moraleChange = getRandomInt(3, 8);
                        let feedback = '';
                        if (player.status.morale < 50) {
                            moraleChange = getRandomInt(8, 15);
                            feedback = `Your passionate words re-energize ${player.name}. His morale is greatly improved!`;
                        } else if (player.status.morale < 75) {
                            feedback = `${player.name} appreciates the support. His morale is slightly boosted.`;
                        } else {
                             feedback = `${player.name} is already highly motivated. He acknowledges your support.`;
                             moraleChange = getRandomInt(0, 1);
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.showModal('Morale Boost Outcome', `${feedback} New morale: ${player.status.morale}%.`, [{ text: 'Continue', action: renderers.hideModal }]); // Outcome modal
                        Main.updateUI();
                    },
                    isPrimary: true
                },
                {
                    text: 'Remind him of team goals',
                    action: () => {
                        renderers.hideModal(); // Hide choice modal
                        let moraleChange = getRandomInt(1, 5);
                        let feedback = '';
                        if (player.traits.ambition > 7) {
                            moraleChange += getRandomInt(2, 5);
                            feedback = `${player.name} is fired up by the team's ambition. His morale improved!`;
                        } else {
                            feedback = `${player.name} nods. His morale is slightly improved.`;
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.showModal('Morale Boost Outcome', `${feedback} New morale: ${player.status.morale}%.`, [{ text: 'Continue', action: renderers.hideModal }]);
                        Main.updateUI();
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
                        renderers.hideModal(); // Hide choice modal
                        let moraleChange = 0;
                        let feedback = '';
                        if (player.traits.commitmentLevel === 'Low') {
                            feedback = `${player.name} looks a bit sheepish, but promises to try harder. Commitment unchanged for now.`;
                        } else if (player.traits.commitmentLevel === 'Medium') {
                            feedback = `${player.name} confirms he's still invested in the project. Commitment slightly reinforced.`;
                            moraleChange = 3;
                        } else {
                            feedback = `${player.name} reaffirms his dedication. Commitment already high.`;
                            moraleChange = 1;
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.showModal('Commitment Check Outcome', feedback, [{ text: 'Continue', action: renderers.hideModal }]);
                        Main.updateUI();
                    },
                    isPrimary: true
                },
                {
                    text: 'Offer to help with issues (if any)',
                    action: () => {
                        renderers.hideModal(); // Hide choice modal
                        let feedback = `${player.name} appreciates the offer, but says he's fine. Morale slightly up.`;
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, 2);
                        renderers.showModal('Player Support Outcome', feedback, [{ text: 'Continue', action: renderers.hideModal }]);
                        Main.updateUI();
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
                        renderers.hideModal(); // Hide choice modal
                        let moraleChange = -getRandomInt(5, 10);
                        let feedback = '';
                        if (player.traits.temperament < 5) {
                            moraleChange = -getRandomInt(10, 15);
                            feedback = `${player.name} seems agitated and morale drops significantly after your direct words.`;
                        } else {
                            feedback = `${player.name} seems to take it on board. Morale slightly drops, but might improve performance.`;
                        }
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.showModal('Performance Review Outcome', `${feedback} New morale: ${player.status.morale}%.`, [{ text: 'Continue', action: renderers.hideModal }]);
                        Main.updateUI();
                    },
                    isPrimary: true
                },
                {
                    text: 'Offer support, identify solutions',
                    action: () => {
                        renderers.hideModal(); // Hide choice modal
                        let moraleChange = getRandomInt(1, 5);
                        let feedback = `${player.name} responds positively to your supportive approach. Morale slightly up.`;
                        Main.gameState.playerClub.squad = playerData.updatePlayerMorale(player.id, moraleChange);
                        renderers.showModal('Performance Review Outcome', `${feedback} New morale: ${player.status.morale}%.`, [{ text: 'Continue', action: renderers.hideModal }]);
                        Main.updateUI();
                    }
                }
            ];
            break;

        default:
            console.warn(`Unknown player interaction type: ${interactionType}`);
            renderers.showModal('Interaction Error', `An unknown interaction type occurred with ${player.name}.`, [{ text: 'Continue', action: renderers.hideModal }]);
            break;
    }

    renderers.showModal(title, message, choices);
}

/**
 * Initiates a recruitment attempt for a new player.
 * @param {object} newPlayer - The potential new player object.
 * @param {string} playerClubId - The ID of the player's club.
 */
export function attemptRecruitment(newPlayer, playerClubId) {
    console.log(`DEBUG: playerInteractionLogic.attemptRecruitment called for ${newPlayer.name}`);
    const title = `Recruiting ${newPlayer.name}`;
    let message = '';
    let choices = [];
    let successChance = 50 + (Main.gameState.playerClub.reputation - newPlayer.traits.ambition * 2);

    successChance = Math.max(10, Math.min(90, successChance));

    message = `You approach ${newPlayer.name} to offer him a place at your club. His ambition is ${newPlayer.traits.ambition}/10. Your club's reputation is ${Main.gameState.playerClub.reputation}/20.`;

    choices = [
        {
            text: 'Offer a compelling vision',
            action: () => {
                renderers.hideModal(); // Hide choice modal
                let outcomeMessage = '';
                if (getRandomInt(1, 100) < successChance + getRandomInt(5,15)) {
                    Main.gameState.playerClub.squad = playerData.addPlayer(newPlayer, playerClubId);
                    outcomeMessage = `SUCCESS! ${newPlayer.name} is impressed by your vision and agrees to join the club! Welcome aboard!`;
                    Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `New signing: ${newPlayer.name} joins the squad!` });
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: renderers.hideModal }]);
                } else {
                    outcomeMessage = `FAILED. ${newPlayer.name} politely declines, stating he's not convinced by the current project.`;
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: renderers.hideModal }]);
                }
                Main.updateUI();
            },
            isPrimary: true
        },
        {
            text: 'Emphasize local camaraderie',
            action: () => {
                renderers.hideModal(); // Hide choice modal
                let outcomeMessage = '';
                let actualChance = successChance;
                if (newPlayer.traits.loyalty > 15) actualChance += getRandomInt(2, 5);

                if (getRandomInt(1, 100) < actualChance) {
                    Main.gameState.playerClub.squad = playerData.addPlayer(newPlayer, playerClubId);
                    outcomeMessage = `SUCCESS! ${newPlayer.name} is swayed by the promise of local camaraderie and joins the club!`;
                    Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `New signing: ${newPlayer.name} joins the squad!` });
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: renderers.hideModal }]);
                } else {
                    outcomeMessage = `FAILED. ${newPlayer.name} thanks you but prefers to stay with his current setup.`;
                    renderers.showModal('Recruitment Outcome', outcomeMessage, [{ text: 'Continue', action: renderers.hideModal }]);
                }
                Main.updateUI();
            }
        }
    ];

    renderers.showModal(title, message, choices);
}

