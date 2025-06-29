// js/logic/matchLogic.js

/**
 * Handles the simulation of a single football match between two teams.
 * Calculates scores, player impacts, and returns a detailed match report.
 */

import * as Constants from '../utils/constants.js';
import * as playerData from '../data/playerData.js'; // To update player stats directly
import * as clubData from '../data/clubData.js'; // To get capacities/facilities
import * as opponentData from '../data/opponentData.js'; // To get opponent club details

// --- Helper Functions ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Calculates a team's overall attacking strength based on its players.
 * @param {Array<object>} squad - Array of player objects.
 * @returns {number} Calculated attacking rating.
 */
function calculateTeamAttackingRating(squad) {
    let totalAttackRating = 0;
    let playersCount = 0;
    squad.forEach(player => {
        // Focus on offensive positions and their key attributes
        if (player.preferredPosition === Constants.PLAYER_POSITIONS.ST ||
            player.preferredPosition === Constants.PLAYER_POSITIONS.CF ||
            player.preferredPosition === Constants.PLAYER_POSITIONS.LW ||
            player.preferredPosition === Constants.PLAYER_POSITIONS.RW ||
            player.preferredPosition === Constants.PLAYER_POSITIONS.CAM) {
            totalAttackRating += (player.attributes.SHO * 2 + player.attributes.DRI + player.attributes.OTB) / 4;
            playersCount++;
        } else if (player.preferredPosition === Constants.PLAYER_POSITIONS.CM ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.LM ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.RM) {
            totalAttackRating += (player.attributes.PAS * 2 + player.attributes.DEC) / 3;
            playersCount++;
        }
    });
    return playersCount > 0 ? Math.round(totalAttackRating / playersCount) : 0;
}

/**
 * Calculates a team's overall defensive strength based on its players.
 * @param {Array<object>} squad - Array of player objects.
 * @returns {number} Calculated defensive rating.
 */
function calculateTeamDefensiveRating(squad) {
    let totalDefenseRating = 0;
    let playersCount = 0;
    let hasGoalkeeper = false;
    squad.forEach(player => {
        if (player.preferredPosition === Constants.PLAYER_POSITIONS.GK) {
            totalDefenseRating += player.attributes.GK * 3; // GK attribute is very important for defense
            playersCount += 3; // Weigh GK higher
            hasGoalkeeper = true;
        } else if (player.preferredPosition === Constants.PLAYER_POSITIONS.CB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.LB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.RB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.LWB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.RWB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.CDM) {
            totalDefenseRating += (player.attributes.TKL * 2 + player.attributes.POS + player.attributes.STR) / 4;
            playersCount++;
        }
    });
    // Ensure a base defensive rating even if no defenders, or if GK is missing for some reason
    if (!hasGoalkeeper) totalDefenseRating += 5; // Penalty for no GK or poor GK
    return playersCount > 0 ? Math.round(totalDefenseRating / playersCount) : 0;
}

/**
 * Simulates a single football match and determines the outcome.
 * Updates player stats (appearances, goals, cards) and returns a match report.
 * @param {string} homeTeamId - ID of the home team.
 * @param {string} awayTeamId - ID of the away team.
 * @param {object} playerClub - The full playerClub object from gameState.
 * @param {Array<object>} allOpponentClubs - All persistent opponent club data.
 * @param {Array<object>} playerSquad - The player's current squad (from playerData.getSquad()).
 * @returns {object} A match report object with scores, winners, and key events.
 */
export function simulateMatch(homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad) {
    console.log(`Simulating match: ${homeTeamId} vs ${awayTeamId}`);

    let homeClub, awayClub;
    let homeSquad, awaySquad;
    let isPlayerHome = false;
    let isPlayerAway = false;

    // Determine which team is the player's club and retrieve their squad
    if (homeTeamId === playerClub.id) {
        homeClub = playerClub;
        homeSquad = playerSquad; // Use the actual player's squad
        isPlayerHome = true;
    } else {
        homeClub = opponentData.getOpponentClub(homeTeamId);
        // For opponent, generate a temporary squad for this match simulation
        homeSquad = opponentData.generateSeasonalOpponentPlayers(homeTeamId, homeClub.overallTeamQuality);
    }

    if (awayTeamId === playerClub.id) {
        awayClub = playerClub;
        awaySquad = playerSquad; // Use the actual player's squad
        isPlayerAway = true;
    } else {
        awayClub = opponentData.getOpponentClub(awayTeamId);
        // For opponent, generate a temporary squad for this match simulation
        awaySquad = opponentData.generateSeasonalOpponentPlayers(awayTeamId, awayClub.overallTeamQuality);
    }

    if (!homeClub || !awayClub) {
        console.error("One or both clubs not found for match simulation.");
        return { homeScore: 0, awayScore: 0, winnerId: null, report: "Match cancelled due to missing teams." };
    }

    // --- Calculate Team Strengths ---
    // Player's tactical choices (if implemented) could modify these base ratings
    const homeAttack = calculateTeamAttackingRating(homeSquad);
    const homeDefense = calculateTeamDefensiveRating(homeSquad);
    const awayAttack = calculateTeamAttackingRating(awaySquad);
    const awayDefense = calculateTeamDefensiveRating(awaySquad);

    // Factors affecting match outcome (simplified)
    const homeAdvantage = getRandomInt(1, 3); // Home advantage factor
    const weatherImpact = getRandomInt(-1, 1); // Random weather impact
    const pitchImpact = (playerClub.id === homeTeamId && playerClub.facilities[Constants.FACILITIES.PITCH].level < 3) ? getRandomInt(-2, 0) : 0; // Poor pitch impacts home team

    // --- Determine Goals ---
    // Basic goal calculation: Attack vs Opponent's Defense + randomness
    let homeScore = Math.max(0, getRandomInt(0, 3) + Math.round((homeAttack - awayDefense + homeAdvantage + weatherImpact + pitchImpact) / 5) + getRandomInt(-1,1));
    let awayScore = Math.max(0, getRandomInt(0, 3) + Math.round((awayAttack - homeDefense - homeAdvantage + weatherImpact) / 5) + getRandomInt(-1,1));

    // Ensure scores are reasonable (e.g., prevent extremely high scores in grassroots)
    homeScore = Math.min(homeScore, getRandomInt(3, 6));
    awayScore = Math.min(awayScore, getRandomInt(3, 6));

    // --- Update Player Stats & Morale ---
    // This is where player appearances, goals, assists, etc., are updated.
    // For now, simplify goals and appearances based on score.

    // Update appearances for all players in both squads
    homeSquad.forEach(player => {
        playerData.updatePlayerStats(player.id, { appearances: 1 });
    });
    awaySquad.forEach(player => {
        playerData.updatePlayerStats(player.id, { appearances: 1 });
    });

    // Award goals randomly to players in attacking positions for the scoring team
    let homeGoalScorers = [];
    for (let i = 0; i < homeScore; i++) {
        const scorer = getRandomElement(homeSquad.filter(p => p.preferredPosition === Constants.PLAYER_POSITIONS.ST || p.preferredPosition === Constants.PLAYER_POSITIONS.CF || p.preferredPosition === Constants.PLAYER_POSITIONS.CAM));
        if (scorer) {
            playerData.updatePlayerStats(scorer.id, { goals: 1 });
            homeGoalScorers.push(scorer.name);
        }
    }
    let awayGoalScorers = [];
    for (let i = 0; i < awayScore; i++) {
        const scorer = getRandomElement(awaySquad.filter(p => p.preferredPosition === Constants.PLAYER_POSITIONS.ST || p.preferredPosition === Constants.PLAYER_POSITIONS.CF || p.preferredPosition === Constants.PLAYER_POSITIONS.CAM));
        if (scorer) {
            playerData.updatePlayerStats(scorer.id, { goals: 1 });
            awayGoalScorers.push(scorer.name);
        }
    }

    // Update player morale based on result
    let playerMoraleChange = 0;
    if (homeScore > awayScore && isPlayerHome || awayScore > homeScore && isPlayerAway) {
        playerMoraleChange = getRandomInt(5, 10); // Win
    } else if (homeScore === awayScore) {
        playerMoraleChange = getRandomInt(0, 3); // Draw
    } else {
        playerMoraleChange = getRandomInt(-5, -10); // Loss
    }
    playerSquad.forEach(player => {
        playerData.updatePlayerMorale(player.id, playerMoraleChange);
        // Small chance of injury after match
        if (getRandomInt(1, 100) < 5) { // 5% chance
            player.status.injuryStatus = "Minor Knock";
            player.status.injuryReturnDate = "Next Week"; // Simplified
            console.log(`${player.name} picked up a minor knock!`);
            // This would trigger a specific event/modal later
        }
    });

    // --- Generate Match Report ---
    let reportMessage = `A hard-fought match at ${isPlayerHome ? homeClub.name : awayClub.name}'s ground.`;
    if (homeScore > awayScore) {
        reportMessage += `${homeClub.name} secured the victory.`;
    } else if (homeScore < awayScore) {
        reportMessage += `${awayClub.name} claimed the win.`;
    } else {
        reportMessage += `The teams couldn't be separated, a draw!`;
    }

    if (homeGoalScorers.length > 0 || awayGoalScorers.length > 0) {
        reportMessage += `\nGoals for ${homeClub.name}: ${homeGoalScorers.join(', ') || 'None'}.`;
        reportMessage += `\nGoals for ${awayClub.name}: ${awayGoalScorers.join(', ') || 'None'}.`;
    }

    reportMessage += `\nFinal Score: ${homeClub.name} ${homeScore} - ${awayScore} ${awayClub.name}.`;

    return {
        homeScore: homeScore,
        awayScore: awayScore,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        homeTeamName: homeClub.name,
        awayTeamName: awayClub.name,
        report: reportMessage,
        // Potentially add more details like man of the match, cards, etc.
    };
}

