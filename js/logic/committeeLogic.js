// js/logic/committeeLogic.js

/**
 * Manages committee meetings, proposals, and member persuasion.
 */

import * as Constants from '../utils/constants.js';
import * as clubData from '../data/clubData.js';
import * as renderers from '../ui/renderers.js';
// Import Main to update game state and trigger UI updates
import * * as Main from '../main.js';

// --- Helper Functions ---
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Starts a committee meeting, presenting available proposals.
 * @param {object} gameState - The current mutable gameState object.
 */
export function startCommitteeMeeting(gameState) {
  let title = 'Committee Meeting';
  let message = 'It\'s time for the monthly committee meeting. What do you want to discuss?';
  
  // Generate dynamic proposals based on game state (simplified for now)
  const proposals = generateAvailableProposals(gameState);
  
  // Filter out proposals that can't be afforded
  const affordableProposals = proposals.filter(p => p.cost <= gameState.playerClub.finances.balance);
  
  if (affordableProposals.length === 0) {
    message += "\n\nCurrently, there are no affordable proposals to discuss. Focus on fundraising!";
    renderers.showModal(title, message, [{ text: 'End Meeting', action: renderers.hideModal }]);
    return;
  }
  
  const choices = affordableProposals.map(proposal => ({
    text: `${proposal.name} (Cost: £${proposal.cost.toFixed(2)})`,
    action: () => presentProposal(gameState, proposal),
    isPrimary: proposal.isPrimary // Example: Highlight important proposals
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
  
  // --- Facility Upgrade Proposals ---
  for (const key in Constants.FACILITIES) {
    const facility = club.facilities[key];
    // Only propose if facility exists (level > 0) or is at base level 0 and can be built
    if (facility && facility.level < 4) { // Max level 4 for these
      const upgradeCost = facility.currentUpgradeCost; // Cost to go to next level
      
      proposals.push({
        id: `upgrade_${key}`,
        name: `Upgrade ${facility.name} to Level ${facility.level + 1}`,
        type: 'facility_upgrade',
        facilityKey: key,
        cost: upgradeCost,
        description: `Improve the ${facility.name} to a better standard.`,
        difficulty: facility.level * 2 + 5 // Higher level, harder to approve
      });
    }
  }
  
  // --- Financial Proposals ---
  proposals.push({
    id: 'major_fundraiser',
    name: 'Organize a Major Fundraising Gala',
    type: 'fundraising',
    cost: 0, // No direct cost to propose, but setup costs later
    description: 'Plan a large event to significantly boost club funds.',
    difficulty: 10,
    isPrimary: true
  });
  
  // --- Club Identity Change Proposals (if applicable) ---
  // Example: Only allow if customization has been done, and not in the first season
  if (gameState.playerClubCustomized && gameState.currentSeason > 1 && club.customizationHistory.nameChanges < 1) {
    proposals.push({
      id: 'change_club_name',
      name: 'Propose Club Name Change',
      type: 'club_identity',
      cost: 50, // Cost for paperwork etc.
      description: 'Change the club\'s official name. Requires careful handling.',
      difficulty: 15,
      isPrimary: true
    });
  }
  if (gameState.playerClubCustomized && gameState.currentSeason > 1 && club.customizationHistory.colorChanges < 1) {
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
  
  
  // Add more proposal types as game expands (e.g., hiring paid staff, new youth team)
  
  return proposals;
}

/**
 * Presents a specific proposal to the committee for a vote.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} proposal - The proposal object to vote on.
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
  }];
  
  renderers.showModal(`Propose: ${proposal.name}`, message, choices);
}

/**
 * Processes the committee vote on a proposal.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} proposal - The proposal being voted on.
 * @param {string} playerArgumentStyle - How the player argued (e.g., 'passion', 'finance').
 */
function voteOnProposal(gameState, proposal, playerArgumentStyle) {
  let approvalScore = 0;
  let votesFor = 0;
  let totalVotes = 0;
  const committee = gameState.playerClub.committee;
  
  // Player's influence
  let playerInfluence = getRandomInt(5, 15); // Base player influence
  if (Main.gameState.playerClub.reputation > 15) playerInfluence += 5; // Good reputation helps
  if (playerArgumentStyle === 'passion') playerInfluence += getRandomInt(0, 5); // Passionate argument might sway
  
  approvalScore += playerInfluence; // Player's direct contribution
  
  committee.forEach(member => {
    let memberApproval = getRandomInt(1, 10); // Base random approval
    memberApproval += (member.personality.loyaltyToYou / 2); // More loyalty, more likely to approve
    memberApproval -= (member.skills.resistanceToChange / 2); // Higher resistance, less likely
    
    // Argument style can influence specific members
    if (playerArgumentStyle === 'finance' && member.skills.financialAcumen > 10) {
      memberApproval += 3;
    }
    if (playerArgumentStyle === 'community' && member.skills.communityRelations > 10) {
      memberApproval += 3;
    }
    
    // Difficulty of proposal
    memberApproval -= (proposal.difficulty / 2);
    
    if (memberApproval >= 5) { // Threshold for a 'yes' vote
      votesFor++;
    }
    totalVotes++;
  });
  
  const approvalPercentage = (votesFor / totalVotes) * 100;
  let outcomeMessage = '';
  
  if (approvalPercentage >= 60) { // 60% approval needed
    outcomeMessage = `Proposal "${proposal.name}" PASSED! ${votesFor} out of ${totalVotes} voted 'Yes'.`;
    applyProposalEffect(gameState, proposal);
  } else {
    outcomeMessage = `Proposal "${proposal.name}" FAILED. Only ${votesFor} out of ${totalVotes} voted 'Yes'.`;
    gameState.messages.push({ week: Main.gameState.currentWeek, text: `Committee voted down: ${proposal.name}.` });
  }
  
  renderers.displayMessage('Committee Decision', outcomeMessage);
  Main.updateUI(); // Update UI after committee decision
  renderers.hideModal(); // Hide the modal after displaying outcome
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
    Constants.TRANSACTION_TYPE.OTHER_EXP, // Or specific cost type
    `Committee Approved: ${proposal.name}`
  );
  
  switch (proposal.type) {
    case 'facility_upgrade':
      gameState.playerClub.facilities = clubData.upgradeFacility(
        gameState.playerClub.facilities,
        proposal.facilityKey
      );
      gameState.messages.push({ week: Main.gameState.currentWeek, text: `${proposal.name} approved! Building work starts.` });
      renderers.updateNewsFeed(`Committee approves ${proposal.name}!`);
      break;
    case 'fundraising':
      // This proposal would typically set up a future event/task
      gameState.messages.push({ week: Main.gameState.currentWeek, text: `${proposal.name} approved! Planning is underway.` });
      renderers.updateNewsFeed(`Major fundraiser approved!`);
      break;
    case 'club_identity':
      // For identity changes, trigger a modal for new input
      if (proposal.id === 'change_club_name') {
        renderers.showModal(
          'Change Club Name',
          'Enter the new club name and nickname:',
          [
          {
            text: 'Confirm',
            action: () => {
              const newName = document.getElementById('newClubNameInput').value;
              const newNickname = document.getElementById('newClubNicknameInput').value;
              if (newName && newNickname) {
                gameState.playerClub = clubData.updateClubIdentity(gameState.playerClub, newName, newNickname);
                gameState.messages.push({ week: Main.gameState.currentWeek, text: `Club name changed to ${newName}.` });
                renderers.displayMessage('Club Identity Updated', `Your club is now known as ${newName} (${newNickname}).`);
                renderers.hideModal(); // Hide second modal
                Main.updateUI();
              } else {
                renderers.displayMessage('Input Error', 'Please enter both new name and nickname.');
              }
            }
          }]
          // Add input fields to the modal dynamically in renderers.js's showModal if needed
        );
      } else if (proposal.id === 'change_kit_colors') {
        renderers.showModal(
          'Change Kit Colors',
          'Choose new primary and secondary kit colors:',
          [
          {
            text: 'Confirm',
            action: () => {
              const newPrimary = document.getElementById('newPrimaryColorInput').value;
              const newSecondary = document.getElementById('newSecondaryColorInput').value;
              if (newPrimary && newSecondary && newPrimary !== newSecondary) {
                gameState.playerClub = clubData.updateClubKitColors(gameState.playerClub, newPrimary, newSecondary);
                gameState.messages.push({ week: Main.gameState.currentWeek, text: `Club kit colors updated.` });
                renderers.displayMessage('Kit Colors Updated', `Your club kit has been updated.`);
                renderers.hideModal();
                Main.updateUI();
              } else {
                renderers.displayMessage('Input Error', 'Please choose two different colors.');
              }
            }
          }]
        );
      }
      break;
  }
  // Update game state to reflect changes (Main.updateUI() called after modal closes)
}