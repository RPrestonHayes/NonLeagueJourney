// js/logic/committeeLogic.js

/**
 * Manages committee meetings, proposals, and member persuasion.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js';
import { getRandomInt } from '../utils/dataGenerator.js';

/**
 * Starts a committee meeting, presenting available proposals.
 * @param {object} gameState - The current mutable gameState object.
 */
export function startCommitteeMeeting(gameState) {
    let title = 'Committee Meeting';
    let message = 'It\'s time for the monthly committee meeting. What do you want to discuss?';

    const proposals = generateAvailableProposals(gameState);

    const affordableProposals = proposals.filter(p => p.cost <= clubData.getFinances().balance);

    if (affordableProposals.length === 0) {
        message += "\n\nCurrently, there are no affordable proposals to discuss. Focus on fundraising!";
        renderers.showModal(title, message, [{ text: 'End Meeting', action: renderers.hideModal }]);
        return;
    }

    const choices = affordableProposals.map(proposal => ({
        text: `${proposal.name} (Cost: £${proposal.cost.toFixed(2)})`,
        action: () => presentProposal(gameState, proposal), // presentProposal calls showModal
        isPrimary: proposal.isPrimary
    }));

    renderers.showModal(title, message, choices);
}

/**
 * Generates a list of potential proposals for the committee meeting.
 * @param {object} gameState - The current game state.
 * @returns {Array<object>} An array of proposal objects.
 */
function generateAvailableProposals(gameState) {
    const proposals = [];
    const club = gameState.playerClub;
    const currentFinances = clubData.getFinances();

    for (const key in Constants.FACILITIES) {
        const facility = club.facilities[key];
        if (facility && facility.level > 0 && facility.level < (Constants.FACILITY_GRADES.length - 1)) {
            const upgradeCost = facility.currentUpgradeCost;
            proposals.push({
                id: `upgrade_${key}`,
                name: `Upgrade ${facility.name} to Level ${facility.level + 1} (Grade ${Constants.FACILITY_GRADES[facility.level + 1]})`,
                type: 'facility_upgrade',
                facilityKey: key,
                cost: upgradeCost,
                description: `Improve the ${facility.name} to a better standard. Current: Grade ${facility.grade}, Cond: ${facility.condition}%.`,
                difficulty: facility.level * 2 + 5
            });
        }
        else if (facility && facility.level === 0) {
             const buildCost = facility.currentUpgradeCost;
             proposals.push({
                id: `build_${key}`,
                name: `Build ${facility.name} (Level 1, Grade ${Constants.FACILITY_GRADES[1]})`,
                type: 'facility_upgrade',
                facilityKey: key,
                cost: buildCost,
                description: `Construct a new ${facility.name} from scratch.`,
                difficulty: 5,
                isPrimary: true
            });
        }
    }

    proposals.push({
        id: 'major_fundraiser',
        name: 'Organize a Major Fundraising Gala',
        type: 'fundraising',
        cost: 0,
        description: 'Plan a large event to significantly boost club funds.',
        difficulty: 10,
        isPrimary: (currentFinances.balance < 100)
    });

    if (gameState.playerClubCustomized && gameState.currentSeason > 1 && club.customizationHistory.nameChanges === 0) {
        proposals.push({
            id: 'change_club_name',
            name: 'Propose Club Name Change',
            type: 'club_identity',
            cost: 50,
            description: 'Change the club\'s official name. Requires careful handling.',
            difficulty: 15,
            isPrimary: true
        });
    }
    if (gameState.playerClubCustomized && gameState.currentSeason > 1 && club.customizationHistory.colorChanges === 0) {
        proposals.push({
            id: 'change_kit_colors',
            name: 'Propose Kit Color Change',
            type: 'club_identity',
            cost: 30,
            description: 'Update the club\'s primary and secondary kit colors.',
            difficulty: 12,
            isPrimary: true
        });
    }

    return proposals;
}

/**
 * Presents a specific proposal to the committee for a vote.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} proposal - The proposal being voted on.
 */
function presentProposal(gameState, proposal) {
    let message = `You are proposing: "${proposal.name}" (${proposal.description}).\n\n`;
    message += `Cost: £${proposal.cost.toFixed(2)}. This proposal has a base difficulty of ${proposal.difficulty}.`;

    const choices = [
        {
            text: 'Argue for it passionately',
            action: () => voteOnProposal(gameState, proposal, 'passion'),
            isPrimary: true
        },
        {
            text: 'Highlight financial benefits',
            action: () => voteOnProposal(gameState, proposal, 'finance')
        },
        {
            text: 'Emphasize community impact',
            action: () => voteOnProposal(gameState, proposal, 'community')
        }
    ];

    renderers.showModal(`Propose: ${proposal.name}`, message, choices);
}

/**
 * Processes the committee vote on a proposal.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} proposal - The proposal being voted on.
 * @param {string} playerArgumentStyle - How the player argued (e.g., 'passion', 'finance').
 */
function voteOnProposal(gameState, proposal, playerArgumentStyle) {
    renderers.hideModal(); // Hide the first modal (proposal choices) immediately

    let votesFor = 0;
    let totalVotes = 0;
    const committee = gameState.playerClub.committee;

    let playerInfluence = getRandomInt(5, 15);
    if (Main.gameState.playerClub.reputation > 15) playerInfluence += 5;
    if (playerArgumentStyle === 'passion') playerInfluence += getRandomInt(0, 5);

    if (playerInfluence >= proposal.difficulty / 2) {
        votesFor++;
    }
    totalVotes++;

    committee.forEach(member => {
        let memberApproval = getRandomInt(1, 10);
        memberApproval += (member.personality.loyaltyToYou / 2);
        memberApproval -= (member.skills.resistanceToChange / 2);

        if (playerArgumentStyle === 'finance' && member.skills.financialAcumen > 10) { memberApproval += 3; }
        if (playerArgumentStyle === 'community' && member.skills.communityRelations > 10) { memberApproval += 3; }

        memberApproval -= (proposal.difficulty / 2);

        if (memberApproval >= 5) {
            votesFor++;
        }
        totalVotes++;
    });

    const approvalPercentage = (votesFor / totalVotes) * 100;
    let outcomeMessage = '';
    let outcomeTitle = 'Committee Decision';

    if (approvalPercentage >= 60) {
        outcomeMessage = `Proposal "${proposal.name}" PASSED! ${votesFor} out of ${totalVotes} voted 'Yes'.`;
        applyProposalEffect(gameState, proposal); // Apply effect only if passed
        outcomeTitle = 'Proposal Passed!';
    } else {
        outcomeMessage = `Proposal "${proposal.name}" FAILED. Only ${votesFor} out of ${totalVotes} voted 'Yes'.`;
        gameState.messages.push({ week: Main.gameState.currentWeek, text: `Committee voted down: ${proposal.name}.` });
        outcomeTitle = 'Proposal Failed!';
    }

    renderers.showModal(outcomeTitle, outcomeMessage, [{ text: 'Continue', action: renderers.hideModal }]);
    Main.updateUI();
}

/**
 * Applies the effects of a passed committee proposal to the game state.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} proposal - The proposal object.
 */
function applyProposalEffect(gameState, proposal) {
    gameState.playerClub.finances = clubData.addTransaction(
        gameState.playerClub.finances,
        -proposal.cost,
        Constants.TRANSACTION_TYPE.FAC_UPGRADE_EXP,
        `Committee Approved: ${proposal.name}`
    );

    switch (proposal.type) {
        case 'facility_upgrade':
            gameState.playerClub.facilities = clubData.upgradeFacility(
                gameState.playerClub.facilities,
                proposal.facilityKey
            );
            gameState.messages.push({ week: Main.gameState.currentWeek, text: `${proposal.name} approved! Work will begin on ${gameState.playerClub.facilities[proposal.facilityKey].name}.` });
            renderers.updateNewsFeed(`Committee approves ${proposal.name}!`);
            break;
        case 'fundraising':
            gameState.messages.push({ week: Main.gameState.currentWeek, text: `${proposal.name} approved! Planning is underway.` });
            renderers.updateNewsFeed(`Major fundraiser approved!`);
            break;
        case 'club_identity':
            if (proposal.id === 'change_club_name') {
                renderers.showModal(
                    'Change Club Name',
                    `Enter the new club name and nickname:
                     <div class="form-group"><label for="newClubNameInput">New Name:</label><input type="text" id="newClubNameInput" value="${gameState.playerClub.name}"></div>
                     <div class="form-group"><label for="newClubNicknameInput">New Nickname:</label><input type="text" id="newClubNicknameInput" value="${gameState.playerClub.nickname}"></div>`,
                    [
                        { text: 'Confirm', action: () => {
                            const newNameInput = document.getElementById('newClubNameInput');
                            const newNicknameInput = document.getElementById('newClubNicknameInput');
                            if (newNameInput && newNicknameInput && newNameInput.value.trim() && newNicknameInput.value.trim()) {
                                gameState.playerClub = clubData.updateClubIdentity(gameState.playerClub, newNameInput.value.trim(), newNicknameInput.value.trim());
                                gameState.messages.push({ week: Main.gameState.currentWeek, text: `Club name changed to ${newNameInput.value}.` });
                                renderers.showModal('Club Identity Updated', `Your club is now known as ${newNameInput.value} (${newNicknameInput.value}).`, [{ text: 'OK', action: renderers.hideModal }]);
                                Main.updateUI();
                            } else {
                                renderers.showModal('Input Error', 'Please enter both new name and nickname.', [{ text: 'OK', action: renderers.hideModal }]);
                            }
                        }, isPrimary: true}
                    ]
                );
            } else if (proposal.id === 'change_kit_colors') {
                 renderers.showModal(
                    'Change Kit Colors',
                    `Choose new primary and secondary kit colors:
                     <div class="form-group"><label for="newPrimaryColorInput">Primary Color:</label><input type="color" id="newPrimaryColorInput" value="${gameState.playerClub.kitColors.primary}"></div>
                     <div class="form-group"><label for="newSecondaryColorInput">Secondary Color:</label><input type="color" id="newSecondaryColorInput" value="${gameState.playerClub.kitColors.secondary}"></div>`,
                    [
                        { text: 'Confirm', action: () => {
                            const newPrimaryInput = document.getElementById('newPrimaryColorInput');
                            const newSecondaryInput = document.getElementById('newSecondaryColorInput');
                            if (newPrimaryInput && newSecondaryInput && newPrimaryInput.value && newSecondaryInput.value && newPrimaryInput.value !== newSecondaryInput.value) {
                                gameState.playerClub = clubData.updateClubKitColors(gameState.playerClub, newPrimaryInput.value, newSecondaryInput.value);
                                gameState.messages.push({ week: Main.gameState.currentWeek, text: `Club kit colors updated.` });
                                renderers.showModal('Kit Colors Updated', `Your club kit has been updated.`, [{ text: 'OK', action: renderers.hideModal }]);
                                Main.applyThemeColors(newPrimaryInput.value, newSecondaryInput.value);
                                Main.updateUI();
                            } else {
                                renderers.showModal('Input Error', 'Please choose two different colors.', [{ text: 'OK', action: renderers.hideModal }]);
                            }
                        }, isPrimary: true}
                    ]
                );
            }
            break;
    }
}

