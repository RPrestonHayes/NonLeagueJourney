// js/logic/matchLogic.js

/**
 * Handles the simulation of a single football match between two teams.
 * Calculates scores, player impacts, and returns a detailed match report.
 */

import * as Constants from '../utils/constants.js';
import * as playerData from '../data/playerData.js'; // To update player stats directly
import * as clubData from '../data/clubData.js'; // To get capacities/facilities
import * as opponentData from '../data/opponentData.js'; // To get opponent club details
import { getRandomInt, getRandomElement } from '../utils/dataGenerator.js'; // Ensure these are imported


// --- Helper Functions (moved to be accessible) ---

/**
 * Calculates a team's overall attacking strength based on its players.
 * @param {Array<object>} squad - Array of player objects.
 * @returns {number} Calculated attacking rating (0-20 scale).
 */
function calculateTeamAttackingRatingFromSquad(squad) {
    if (!squad || squad.length === 0) return 1; // Minimum rating for empty squad
    let totalAttackRating = 0;
    let playersCount = 0;
    squad.forEach(player => {
        // Only consider outfield players for attacking rating
        if (player.preferredPosition !== Constants.PLAYER_POSITIONS.GK) {
            let playerAttackValue = 0;
            switch (player.preferredPosition) {
                case Constants.PLAYER_POSITIONS.ST:
                case Constants.PLAYER_POSITIONS.CF:
                case Constants.PLAYER_POSITIONS.LW:
                case Constants.PLAYER_POSITIONS.RW:
                    playerAttackValue = (player.attributes.SHO * 2 + player.attributes.DRI + player.attributes.OTB) / 4;
                    break;
                case Constants.PLAYER_POSITIONS.CAM:
                    playerAttackValue = (player.attributes.PAS * 2 + player.attributes.SHO + player.attributes.DRI) / 4;
                    break;
                case Constants.PLAYER_POSITIONS.CM:
                case Constants.PLAYER_POSITIONS.LM:
                case Constants.PLAYER_POSITIONS.RM:
                    playerAttackValue = (player.attributes.PAS + player.attributes.DRI + player.attributes.SHO * 0.5) / 2.5; // Midfield contribution
                    break;
                default: // Defensive players add minimal attack
                    playerAttackValue = (player.attributes.PAS * 0.5 + player.attributes.DRI * 0.5) / 1;
                    break;
            }
            totalAttackRating += playerAttackValue;
            playersCount++;
        }
    });
    return playersCount > 0 ? Math.round(totalAttackRating / playersCount) : 1; // Return at least 1
}

/**
 * Calculates a team's overall defensive strength based on its players.
 * @param {Array<object>} squad - Array of player objects.
 * @returns {number} Calculated defensive rating (0-20 scale).
 */
function calculateTeamDefensiveRatingFromSquad(squad) {
    if (!squad || squad.length === 0) return 1;
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
        } else { // Midfielders and attackers contribute a little to defense
            totalDefenseRating += (player.attributes.TKL * 0.5 + player.attributes.WRK * 0.5) / 1;
            playersCount++;
        }
    });
    if (!hasGoalkeeper && playersCount > 0) totalDefenseRating = Math.max(1, totalDefenseRating * 0.5); // Penalty for no GK
    return playersCount > 0 ? Math.round(totalDefenseRating / playersCount) : 1; // Return at least 1
}


/**
 * Simulates a single football match and determines the outcome.
 * Updates player stats (appearances, goals, cards) and returns a detailed match report.
 * @param {string} homeTeamId - ID of the home team.
 * @param {string} awayTeamId - ID of the away team.
 * @param {object} playerClub - The full playerClub object from gameState.
 * @param {Array<object>} allOpponentClubs - All opponent structural data.
 * @param {Array<object>} playerSquad - The player's current squad (from playerData.getSquad()).
 * @returns {object} A match report object with scores, winners, and key events.
 */
export function simulateMatch(homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad) {
    console.log(`DEBUG: Simulating match: ${homeTeamId} vs ${awayTeamId}`);

    let homeClubDetails, awayClubDetails;
    let homeSquadForMatch, awaySquadForMatch; // Squads used *just* for this match simulation
    let isPlayerHome = false;
    let isPlayerAway = false;

    // Determine clubs and retrieve/generate their squads
    if (homeTeamId === playerClub.id) {
        homeClubDetails = playerClub;
        homeSquadForMatch = playerSquad; // Use the actual player's live squad
        isPlayerHome = true;
    } else {
        homeClubDetails = allOpponentClubs.find(c => c.id === homeTeamId); // Get full opponent data
        homeSquadForMatch = opponentData.generateSeasonalOpponentPlayers(homeTeamId, homeClubDetails.overallTeamQuality);
    }

    if (awayTeamId === playerClub.id) {
        awayClubDetails = playerClub;
        awaySquadForMatch = playerSquad; // Use the actual player's live squad
        isPlayerAway = true;
    } else {
        awayClubDetails = allOpponentClubs.find(c => c.id === awayTeamId); // Get full opponent data
        awaySquadForMatch = opponentData.generateSeasonalOpponentPlayers(awayTeamId, awayClubDetails.overallTeamQuality);
    }

    if (!homeClubDetails || !awayClubDetails) {
        console.error("DEBUG: One or both clubs not found for match simulation.");
        return { homeScore: 0, awayScore: 0, winnerId: null, report: "Match cancelled due to missing teams." };
    }

    // --- Calculate Team Strengths ---
    let homeAttack, homeDefense, awayAttack, awayDefense;

    // Player Team Strength: Calculated from their actual squad
    if (isPlayerHome) {
        homeAttack = calculateTeamAttackingRatingFromSquad(homeSquadForMatch);
        homeDefense = calculateTeamDefensiveRatingFromSquad(homeSquadForMatch);
        // Apply player tactics/morale effects here later
        // console.log(`DEBUG: Player HOME strength - Attack: ${homeAttack}, Defense: ${homeDefense}`);
    } else {
        // Opponent Team Strength: Based on their overallTeamQuality
        homeAttack = homeClubDetails.overallTeamQuality + getRandomInt(-2, 2); // Add some randomness
        homeDefense = homeClubDetails.overallTeamQuality + getRandomInt(-2, 2);
        // console.log(`DEBUG: Opponent HOME strength - Attack: ${homeAttack}, Defense: ${homeDefense}`);
    }

    if (isPlayerAway) {
        awayAttack = calculateTeamAttackingRatingFromSquad(awaySquadForMatch);
        awayDefense = calculateTeamDefensiveRatingFromSquad(awaySquadForMatch);
        // Apply player tactics/morale effects here later
        // console.log(`DEBUG: Player AWAY strength - Attack: ${awayAttack}, Defense: ${awayDefense}`);
    } else {
        // Opponent Team Strength: Based on their overallTeamQuality
        awayAttack = awayClubDetails.overallTeamQuality + getRandomInt(-2, 2);
        awayDefense = awayClubDetails.overallTeamQuality + getRandomInt(-2, 2);
        // console.log(`DEBUG: Opponent AWAY strength - Attack: ${awayAttack}, Defense: ${awayDefense}`);
    }

    // --- Factors affecting match outcome ---
    const homeAdvantageFactor = 2; // Home team gets a slight boost
    const playerMoraleBonus = (isPlayerHome || isPlayerAway) ? Math.round((playerClub.squad.reduce((sum, p) => sum + p.status.morale, 0) / playerClub.squad.length - 50) / 10) : 0; // Bonus if player team morale is high (e.g., +1 for every 10 morale above 50)

    // Simplified environmental factors (could be more complex with weather, pitch condition)
    const randomMatchVariance = getRandomInt(-3, 3); // General "rub of the green"

    // --- Determine Goals ---
    // Goal calculation is relative: (Our Attack + Our Advantage) vs (Their Defense)
    let homeScoreBase = Math.max(0, homeAttack - awayDefense + homeAdvantageFactor + (isPlayerHome ? playerMoraleBonus : 0) + randomMatchVariance);
    let awayScoreBase = Math.max(0, awayAttack - homeDefense - (isPlayerAway ? 0 : homeAdvantageFactor) + (isPlayerAway ? playerMoraleBonus : 0) + randomMatchVariance);

    // Convert base scores to realistic goal numbers (e.g., a base of 5 might mean 1 goal)
    // This is a rough conversion, adjust multipliers for more/less goals
    let homeScore = Math.floor(homeScoreBase / 3) + getRandomInt(0, 2); // Base goals + small random
    let awayScore = Math.floor(awayScoreBase / 3) + getRandomInt(0, 2);

    // Prevent negative scores, cap at a reasonable maximum for non-league
    homeScore = Math.max(0, Math.min(homeScore, 6)); // Max 6 goals for a non-league side
    awayScore = Math.max(0, Math.min(awayScore, 6));

    // Ensure there's a winner sometimes if scores are too low
    if (homeScore === awayScore && getRandomInt(1, 100) < 50) { // 50% chance to break a draw if low scoring
        if (homeScore <= 1) { // Only for very low scoring draws
            if (getRandomInt(0, 1) === 0) homeScore++; else awayScore++;
        }
    }


    // --- Update Player Stats & Morale (for player's squad only) ---
    // Player appearances are already updated in gameLoop.js before calling simulateMatch
    // Update goals/assists/cards for the player's team only

    const playerGoalScorers = [];
    const playerAssistProviders = [];
    const playerYellowCards = [];
    const playerRedCards = [];

    // Assign goals if player team scored
    const playerTeamScore = isPlayerHome ? homeScore : awayScore;
    const playerTeamSquad = playerSquad; // This is the actual player's squad

    for (let i = 0; i < playerTeamScore; i++) {
        const potentialScorers = playerTeamSquad.filter(p => p.preferredPosition !== Constants.PLAYER_POSITIONS.GK && p.status.injuryStatus === 'Fit' && !p.status.suspended);
        if (potentialScorers.length > 0) {
            const scorer = getRandomElement(potentialScorers);
            playerData.updatePlayerStats(scorer.id, { goals: 1 });
            playerGoalScorers.push(scorer.name);

            // Small chance for an assist
            if (getRandomInt(1, 100) < 60) { // 60% chance for an assist
                const potentialAssisters = potentialScorers.filter(p => p.id !== scorer.id);
                if (potentialAssisters.length > 0) {
                    const assister = getRandomElement(potentialAssisters);
                    playerData.updatePlayerStats(assister.id, { assists: 1 });
                    playerAssistProviders.push(assister.name);
                }
            }
        }
    }

    // Random cards for player team
    // Max 1 yellow per match, small chance of red
    const numYellows = getRandomInt(0, 2); // 0 to 2 yellows per match
    for (let i = 0; i < numYellows; i++) {
        const potentialCarded = getRandomElement(playerTeamSquad.filter(p => p.status.injuryStatus === 'Fit' && !p.status.suspended));
        if (potentialCarded) {
            playerData.updatePlayerStats(potentialCarded.id, { yellowCards: 1 });
            playerYellowCards.push(potentialCarded.name);
        }
    }
    if (getRandomInt(1, 100) < 5) { // 5% chance of a red card
        const potentialRed = getRandomElement(playerTeamSquad.filter(p => p.status.injuryStatus === 'Fit' && !p.status.suspended && !playerYellowCards.includes(p.name)));
        if (potentialRed) {
            playerData.updatePlayerStats(potentialRed.id, { redCards: 1 });
            playerRedCards.push(potentialRed.name);
            // Apply suspension immediately
            playerData.updatePlayerStats(potentialRed.id, {
                status: {
                    ...potentialRed.status,
                    suspended: true,
                    suspensionGames: 1 // Simplified: 1 game suspension for red
                }
            });
        }
    }

    // Player Morale based on result
    let playerMoraleChange = 0;
    const playerWon = (isPlayerHome && homeScore > awayScore) || (isPlayerAway && awayScore > homeScore);
    const playerDrew = homeScore === awayScore;

    if (playerWon) {
        playerMoraleChange = getRandomInt(5, 10);
    } else if (playerDrew) {
        playerMoraleChange = getRandomInt(0, 3);
    } else { // Player lost
        playerMoraleChange = getRandomInt(-5, -10);
    }
    playerSquad.forEach(player => {
        playerData.updatePlayerMorale(player.id, playerMoraleChange);
    });

    // Random injury chance for player team
    playerSquad.forEach(player => {
        if (player.status.injuryStatus === 'Fit' && !player.status.suspended && getRandomInt(1, 100) < 5) {
            playerData.updatePlayerStats(player.id, {
                status: {
                    ...player.status,
                    injuryStatus: "Minor Knock",
                    injuryReturnDate: "Next Week" // Simplified: recovers next week
                }
            });
            player.status.injuryStatus = "Minor Knock"; // Update locally for report
            console.log(`DEBUG: ${player.name} picked up a minor knock!`);
        }
    });


    // --- Generate Match Report ---
    let reportMessage = `A hard-fought match at ${homeClubDetails.name}'s ground.`;
    if (homeScore > awayScore) { reportMessage += ` ${homeClubDetails.name} secured the victory.`; }
    else if (homeScore < awayScore) { reportMessage += ` ${awayClubDetails.name} claimed the win.`; }
    else { reportMessage += ` The teams couldn't be separated, a draw!`; }

    if (playerGoalScorers.length > 0 || playerAssistProviders.length > 0) {
        reportMessage += `\nYour scorers: ${playerGoalScorers.join(', ') || 'None'}.`;
        reportMessage += ` Assists: ${playerAssistProviders.join(', ') || 'None'}.`;
    }
    if (playerYellowCards.length > 0 || playerRedCards.length > 0) {
        reportMessage += `\nCards: Yellows: ${playerYellowCards.join(', ') || 'None'}, Reds: ${playerRedCards.join(', ') || 'None'}.`;
    }

    reportMessage += `\n\nFinal Score: ${homeClubDetails.name} ${homeScore} - ${awayScore} ${awayClubDetails.name}.`;

    return {
        homeScore: homeScore,
        awayScore: awayScore,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        homeTeamName: homeClubDetails.name,
        awayTeamName: awayClubDetails.name,
        report: reportMessage,
        // Add specific player impacts for player's team here if needed in report
    };
}

