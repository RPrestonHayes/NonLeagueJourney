// js/logic/matchLogic.js

/**
 * Handles the simulation of a single football match between two teams.
 * Calculates scores, player impacts, and returns a detailed match report.
 */

import * as Constants from '../utils/constants.js';
import * as playerData from '../data/playerData.js';
import * as clubData from '../data/clubData.js';
import * as opponentData from '../data/opponentData.js';
import * as renderers from '../ui/renderers.js';
import * as Main from '../main.js';
import * as dataGenerator from '../utils/dataGenerator.js';
// NEW: Import gameLoop directly for chaining
import * as gameLoop from './gameLoop.js';


// --- Helper Functions ---
/**
 * Calculates a team's overall attacking strength based on its players.
 * @param {Array<object>} squad - Array of player objects.
 * @returns {number} Calculated attacking rating (0-20 scale).
 */
function calculateTeamAttackingRatingFromSquad(squad) {
    if (!squad || squad.length === 0) return 1;
    let totalAttackRating = 0;
    let playersCount = 0;
    squad.forEach(player => {
        if (player.preferredPosition !== Constants.PLAYER_POSITIONS.GK) {
            let playerAttackValue = 0;
            switch (player.preferredPosition) {
                case Constants.PLAYER_POSITIONS.ST: case Constants.PLAYER_POSITIONS.CF: case Constants.PLAYER_POSITIONS.LW: case Constants.PLAYER_POSITIONS.RW:
                    playerAttackValue = (player.attributes.SHO * 2 + player.attributes.DRI + player.attributes.OTB) / 4; break;
                case Constants.PLAYER_POSITIONS.CAM:
                    playerAttackValue = (player.attributes.PAS * 2 + player.attributes.SHO + player.attributes.DRI) / 4; break;
                case Constants.PLAYER_POSITIONS.CM: case Constants.PLAYER_POSITIONS.LM: case Constants.PLAYER_POSITIONS.RM:
                    playerAttackValue = (player.attributes.PAS + player.attributes.DRI + player.attributes.SHO * 0.5) / 2.5; break;
                default:
                    playerAttackValue = (player.attributes.PAS * 0.5 + player.attributes.DRI * 0.5) / 1; break;
            }
            totalAttackRating += playerAttackValue;
            playersCount++;
        }
    });
    return playersCount > 0 ? Math.round(totalAttackRating / playersCount) : 1;
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
            totalDefenseRating += player.attributes.GK * 3;
            playersCount += 3;
            hasGoalkeeper = true;
        } else if (player.preferredPosition === Constants.PLAYER_POSITIONS.CB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.LB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.RB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.LWB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.RWB ||
                   player.preferredPosition === Constants.PLAYER_POSITIONS.CDM) {
            totalDefenseRating += (player.attributes.TKL * 2 + player.attributes.POS + player.attributes.STR) / 4;
            playersCount++;
        } else {
            totalDefenseRating += (player.attributes.TKL * 0.5 + player.attributes.WRK * 0.5) / 1;
            playersCount++;
        }
    });
    if (!hasGoalkeeper && playersCount > 0) totalDefenseRating = Math.max(1, totalDefenseRating * 0.5);
    return playersCount > 0 ? Math.round(totalDefenseRating / playersCount) : 1;
}

// --- Match Day State Management ---
let currentMatchState = null; // Stores data for the match currently being simulated

/**
 * Displays a pre-match briefing modal with match details, conditions, and referee info.
 * This starts the multi-stage match simulation.
 * @param {object} gameState - The current game state.
 * @param {object} playerMatch - The match object involving the player's team.
 */
export function preMatchBriefing(gameState, playerMatch) {
    const isHomeMatch = playerMatch.homeTeamId === gameState.playerClub.id;
    const opponentClub = isHomeMatch ? opponentData.getOpponentClub(playerMatch.awayTeamId) : opponentData.getOpponentClub(playerMatch.homeTeamId);
    
    const weatherConditions = dataGenerator.getRandomElement(['Sunny', 'Cloudy', 'Light Rain', 'Heavy Rain', 'Overcast']);
    const pitchConditionString = clubData.getFacilityStatusByLevel(Constants.FACILITIES.PITCH, gameState.playerClub.facilities[Constants.FACILITIES.PITCH].level);
    const refereeName = `${dataGenerator.getRandomName('first')} ${dataGenerator.getRandomName('last')}`;
    const refereeTemperament = dataGenerator.getRandomElement(['Strict', 'Lenient', 'Fair']);

    let briefingMessage = `You're preparing for your match against **${opponentClub.name} (${opponentClub.nickname})**.
    This match is ${isHomeMatch ? 'at home' : 'away'}.
    
    **Conditions:**
    - Weather: ${weatherConditions}
    - Pitch: ${pitchConditionString} (Condition: ${gameState.playerClub.facilities[Constants.FACILITIES.PITCH].condition}%)
    
    **Referee:** ${refereeName} (Temperament: ${refereeTemperament})
    
    Good luck, Chairman!`;

    // Store match state for later halves
    currentMatchState = {
        homeTeamId: playerMatch.homeTeamId,
        awayTeamId: playerMatch.awayTeamId,
        playerClub: gameState.playerClub,
        allOpponentClubs: opponentData.getAllOpponentClubs(gameState.playerClub.id), // Pass only opponents
        playerSquad: playerData.getSquad(),
        isHomeMatch: isHomeMatch,
        opponentClub: opponentClub,
        matchId: playerMatch.id,
        leagueId: gameState.leagues[0].id, // Assuming one league
        // Scores will be determined in halves
        firstHalfHomeScore: 0,
        firstHalfAwayScore: 0,
        secondHalfHomeScore: 0,
        secondHalfAwayScore: 0,
        report: [] // Accumulate report messages
    };


    renderers.showModal(
        `Match Day Briefing: ${playerMatch.homeTeamName} vs ${playerMatch.awayTeamName}`,
        briefingMessage,
        [{ text: 'Kick Off!', action: () => simulateFirstHalf(currentMatchState), isPrimary: true }] // Chain to first half
    );
    Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `Pre-match briefing for ${playerMatch.homeTeamName} vs ${playerMatch.awayTeamName}.` });
}

/**
 * Simulates the first half of the match and displays its outcome.
 * @param {object} matchState - The current match state object.
 */
function simulateFirstHalf(matchState) {
    console.log("DEBUG: Simulating First Half...");
    const { homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad, isHomeMatch, opponentClub } = matchState;

    let homeClubDetails, awayClubDetails;
    let homeSquadForMatch, awaySquadForMatch;

    if (homeTeamId === playerClub.id) { homeClubDetails = playerClub; homeSquadForMatch = playerSquad; }
    else { homeClubDetails = allOpponentClubs.find(c => c.id === homeTeamId); homeSquadForMatch = opponentData.generateSeasonalOpponentPlayers(homeTeamId, homeClubDetails.overallTeamQuality); }

    if (awayTeamId === playerClub.id) { awayClubDetails = playerClub; awaySquadForMatch = playerSquad; }
    else { awayClubDetails = allOpponentClubs.find(c => c.id === awayTeamId); awaySquadForMatch = opponentData.generateSeasonalOpponentPlayers(awayTeamId, awayClubDetails.overallTeamQuality); }

    let homeAttack, homeDefense, awayAttack, awayDefense;
    if (homeTeamId === playerClub.id) { homeAttack = calculateTeamAttackingRatingFromSquad(homeSquadForMatch) + (playerSquad.reduce((sum, p) => sum + p.status.morale, 0) / playerSquad.length - 50) / 20; homeDefense = calculateTeamDefensiveRatingFromSquad(homeSquadForMatch) + (playerSquad.reduce((sum, p) => sum + p.status.morale, 0) / playerSquad.length - 50) / 20; } // Morale bonus directly here
    else { homeAttack = homeClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); homeDefense = homeClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); }
    if (awayTeamId === playerClub.id) { awayAttack = calculateTeamAttackingRatingFromSquad(awaySquadForMatch) + (playerSquad.reduce((sum, p) => sum + p.status.morale, 0) / playerSquad.length - 50) / 20; awayDefense = calculateTeamDefensiveRatingFromSquad(awaySquadForMatch) + (playerSquad.reduce((sum, p) => sum + p.status.morale, 0) / playerSquad.length - 50) / 20; } // Morale bonus
    else { awayAttack = awayClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); awayDefense = awayClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); }

    const homeAdvantageFactor = 1;
    const randomMatchVariance = dataGenerator.getRandomInt(-1, 1);

    let homeScoreBase = Math.max(0, homeAttack - awayDefense + homeAdvantageFactor + randomMatchVariance);
    let awayScoreBase = Math.max(0, awayAttack - homeDefense - homeAdvantageFactor + randomMatchVariance);

    matchState.firstHalfHomeScore = Math.floor(homeScoreBase / 2) + dataGenerator.getRandomInt(0, 1);
    matchState.firstHalfAwayScore = Math.floor(awayScoreBase / 2) + dataGenerator.getRandomInt(0, 1);

    matchState.firstHalfHomeScore = Math.max(0, Math.min(matchState.firstHalfHomeScore, 3));
    matchState.firstHalfAwayScore = Math.max(0, Math.min(matchState.firstHalfAwayScore, 3));

    playerSquad.forEach(player => { playerData.updatePlayerStats(player.id, { appearances: 0.5 }); });

    let halfTimeMessage = `The whistle blows for half-time!
    Current Score: ${homeClubDetails.name} ${matchState.firstHalfHomeScore} - ${matchState.firstHalfAwayScore} ${awayClubDetails.name}.`;
    
    if (matchState.firstHalfHomeScore > matchState.firstHalfAwayScore && homeTeamId === playerClub.id ||
        matchState.firstHalfAwayScore > matchState.firstHalfHomeScore && awayTeamId === playerClub.id) {
        halfTimeMessage += ` You're currently winning!`;
    } else if (matchState.firstHalfHomeScore === matchState.firstHalfAwayScore) {
        halfTimeMessage += ` It's a tight contest so far.`;
    } else {
        halfTimeMessage += ` You're currently losing. A big second half is needed!`;
    }

    renderers.showModal('Half-Time!', halfTimeMessage, [{ text: 'Go to Half-Time', action: () => halfTimeOptions(matchState), isPrimary: true }]);
}

/**
 * Presents half-time options to the player.
 * @param {object} matchState - The current match state object.
 */
function halfTimeOptions(matchState) {
    console.log("DEBUG: Half-time options presented.");
    const facilities = Main.gameState.playerClub.facilities;
    const choices = [];

    // All actions now explicitly trigger renderers.hideModal()
    choices.push({ text: 'Talk to Players in Changing Room', action: () => { renderers.hideModal(); halfTimeAction(matchState, 'talk_players'); }, isPrimary: true });

    if (facilities[Constants.FACILITIES.CLUBHOUSE] && facilities[Constants.FACILITIES.CLUBHOUSE].level > 0) {
        choices.push({ text: 'Head to the Committee Room', action: () => { renderers.hideModal(); halfTimeAction(matchState, 'committee_room'); } });
        choices.push({ text: 'Grab a drink at the Bar', action: () => { renderers.hideModal(); halfTimeAction(matchState, 'bar'); } });
    } else if (facilities[Constants.FACILITIES.SNACKBAR] && facilities[Constants.FACILITIES.SNACKBAR].level > 0) {
        choices.push({ text: 'Grab a Cuppa at the Tea Hut', action: () => { renderers.hideModal(); halfTimeAction(matchState, 'bar'); } });
    }

    choices.push({ text: 'Wait in the Stands', action: () => { renderers.hideModal(); halfTimeAction(matchState, 'stands'); } });
    choices.push({ text: 'Talk to the Referee', action: () => { renderers.hideModal(); halfTimeAction(matchState, 'referee'); } });
    choices.push({ text: 'Mingle with Fans', action: () => { renderers.hideModal(); halfTimeAction(matchState, 'fans'); } });

    renderers.showModal('Half-Time: Your Decision', 'What do you want to do during the break?', choices);
}

/**
 * Processes the player's chosen half-time action.
 * @param {object} matchState - The current match state object.
 * @param {string} actionType - The type of action chosen (e.g., 'talk_players', 'bar').
 */
function halfTimeAction(matchState, actionType) {
    let outcomeMessage = '';
    let moraleChange = 0;
    let financeChange = 0;
    let committeeRelChange = 0;
    let teamPerformanceBonus = 0; // Temporary boost for 2nd half

    const teamMoraleAvg = Main.gameState.playerClub.squad.reduce((sum, p) => sum + p.status.morale, 0) / Main.gameState.playerClub.squad.length;

    switch (actionType) {
        case 'talk_players':
            if (teamMoraleAvg < 70) {
                moraleChange = dataGenerator.getRandomInt(5, 10);
                outcomeMessage = "You gave a rousing team talk! The players look re-energized for the second half.";
                teamPerformanceBonus = 2; // Boost performance
            } else {
                moraleChange = dataGenerator.getRandomInt(1, 3);
                outcomeMessage = "The players are already motivated. You reinforced their confidence.";
            }
            Main.gameState.playerClub.squad.forEach(player => playerData.updatePlayerMorale(player.id, moraleChange));
            break;
        case 'committee_room':
            const chairman = Main.gameState.playerClub.committee.find(c => c.role === Constants.COMMITTEE_ROLES.CHAIR);
            if (chairman) {
                committeeRelChange = dataGenerator.getRandomInt(2, 5);
                outcomeMessage = "You discussed club matters with the committee. Relationships strengthened slightly.";
                // chairman.personality.loyaltyToYou += committeeRelChange; // Need to implement update committee member function
            } else {
                outcomeMessage = "You spent time in the empty committee room. Nothing notable happened.";
            }
            break;
        case 'bar':
            financeChange = clubData.calculateMatchDayRevenue(Main.gameState.playerClub.facilities, Main.gameState.playerClub.fanbase) * 0.2; // Small extra revenue
            outcomeMessage = "You enjoyed a quick drink, and saw some extra income from happy fans.";
            Main.gameState.playerClub.finances = clubData.addTransaction(Main.gameState.playerClub.finances, financeChange, Constants.TRANSACTION_TYPE.MATCH_DAY_IN, 'Half-Time Bar Revenue');
            break;
        case 'stands':
            outcomeMessage = "You observed the game from the stands. Got a better view, perhaps a fresh perspective.";
            break;
        case 'referee':
            let refOutcome = dataGenerator.getRandomElement(['positive', 'negative', 'neutral']);
            if (refOutcome === 'positive') {
                outcomeMessage = "You had a cordial chat with the referee. He seems to appreciate your understanding.";
                teamPerformanceBonus = 1;
            } else if (refOutcome === 'negative') {
                outcomeMessage = "The referee seemed annoyed by your approach. Best to leave him alone.";
                teamPerformanceBonus = -1;
            } else {
                outcomeMessage = "You exchanged pleasantries with the referee. Nothing noteworthy.";
            }
            break;
        case 'fans':
            moraleChange = dataGenerator.getRandomInt(3, 7);
            outcomeMessage = "You mingled with the fans, boosting their spirits and getting their feedback. They appreciate your presence!";
            break;
    }

    renderers.showModal('Half-Time Action Outcome', outcomeMessage, [{ text: 'Begin Second Half', action: () => simulateSecondHalf(matchState, teamPerformanceBonus), isPrimary: true }]);
}

/**
 * Simulates the second half of the match and displays the full match report.
 * @param {object} matchState - The current match state object.
 * @param {number} performanceBonus - A bonus to apply to team performance in the second half (from half-time action).
 */
function simulateSecondHalf(matchState, performanceBonus = 0) {
    console.log("DEBUG: Simulating Second Half...");
    const { homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad } = matchState;

    let homeClubDetails, awayClubDetails;
    let homeSquadForMatch, awaySquadForMatch;

    if (homeTeamId === playerClub.id) { homeClubDetails = playerClub; homeSquadForMatch = playerSquad; }
    else { homeClubDetails = allOpponentClubs.find(c => c.id === homeTeamId); homeSquadForMatch = opponentData.generateSeasonalOpponentPlayers(homeTeamId, homeClubDetails.overallTeamQuality); }

    if (awayTeamId === playerClub.id) { awayClubDetails = playerClub; awaySquadForMatch = playerSquad; }
    else { awayClubDetails = allOpponentClubs.find(c => c.id === awayTeamId); awaySquadForMatch = opponentData.generateSeasonalOpponentPlayers(awayTeamId, awayClubDetails.overallTeamQuality); }

    let homeAttack, homeDefense, awayAttack, awayDefense;
    if (homeTeamId === playerClub.id) { homeAttack = calculateTeamAttackingRatingFromSquad(homeSquadForMatch) + performanceBonus; homeDefense = calculateTeamDefensiveRatingFromSquad(homeSquadForMatch) + performanceBonus; }
    else { homeAttack = homeClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); homeDefense = homeClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); }
    if (awayTeamId === playerClub.id) { awayAttack = calculateTeamAttackingRatingFromSquad(awaySquadForMatch) + performanceBonus; awayDefense = calculateTeamDefensiveRatingFromSquad(awaySquadForMatch) + performanceBonus; }
    else { awayAttack = awayClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); awayDefense = awayClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2); }

    const homeAdvantageFactor = 1;
    const randomMatchVariance = dataGenerator.getRandomInt(-1, 1);

    let homeScoreSecondHalfBase = Math.max(0, homeAttack - awayDefense + homeAdvantageFactor + randomMatchVariance);
    let awayScoreSecondHalfBase = Math.max(0, awayAttack - homeDefense - homeAdvantageFactor + randomMatchVariance);

    matchState.secondHalfHomeScore = Math.floor(homeScoreSecondHalfBase / 2) + dataGenerator.getRandomInt(0, 1);
    matchState.secondHalfAwayScore = Math.floor(awayScoreSecondHalfBase / 2) + dataGenerator.getRandomInt(0, 1);

    matchState.secondHalfHomeScore = Math.max(0, Math.min(matchState.secondHalfHomeScore, 3));
    matchState.secondHalfAwayScore = Math.max(0, Math.min(matchState.secondHalfAwayScore, 3));

    playerSquad.forEach(player => { playerData.updatePlayerStats(player.id, { appearances: 0.5 }); });

    const finalHomeScore = matchState.firstHalfHomeScore + matchState.secondHalfHomeScore;
    const finalAwayScore = matchState.firstHalfAwayScore + matchState.secondHalfAwayScore;

    let reportMessage = `**First Half:** ${homeClubDetails.name} ${matchState.firstHalfHomeScore} - ${matchState.firstHalfAwayScore} ${awayClubDetails.name}\n`;
    reportMessage += `**Second Half:** ${homeClubDetails.name} ${matchState.secondHalfHomeScore} - ${matchState.secondHalfAwayScore} ${awayClubDetails.name}\n\n`;
    reportMessage += `**Final Score:** ${homeClubDetails.name} ${finalHomeScore} - ${finalAwayScore} ${awayClubDetails.name}.`;
    
    if (finalHomeScore > finalAwayScore) { reportMessage += `\n${homeClubDetails.name} secured the victory!`; }
    else if (finalHomeScore < finalAwayScore) { reportMessage += `\n${awayClubDetails.name} claimed the win!`; }
    else { reportMessage += `\nIt's a draw!`; }

    let playerMoraleChange = 0;
    const playerWon = (homeTeamId === playerClub.id && finalHomeScore > finalAwayScore) || (awayTeamId === playerClub.id && finalAwayScore > finalHomeScore);
    const playerDrew = finalHomeScore === finalAwayScore;

    if (playerWon) { playerMoraleChange = dataGenerator.getRandomInt(5, 10); }
    else if (playerDrew) { playerMoraleChange = dataGenerator.getRandomInt(0, 3); }
    else { playerMoraleChange = dataGenerator.getRandomInt(-5, -10); }
    playerSquad.forEach(player => { playerData.updatePlayerMorale(player.id, playerMoraleChange); });

    const playerGoalScorers = [];
    const playerAssistProviders = [];
    const playerYellowCards = [];
    const playerRedCards = [];

    const playerTeamScore = (homeTeamId === playerClub.id) ? finalHomeScore : finalAwayScore;
    for (let i = 0; i < playerTeamScore; i++) {
        const scorer = dataGenerator.getRandomElement(playerSquad.filter(p => p.preferredPosition !== Constants.PLAYER_POSITIONS.GK && p.status.injuryStatus === 'Fit' && !p.status.suspended));
        if (scorer) {
            playerData.updatePlayerStats(scorer.id, { goals: 1 });
            playerGoalScorers.push(scorer.name);
            if (dataGenerator.getRandomInt(1, 100) < 60) {
                const assister = dataGenerator.getRandomElement(playerSquad.filter(p => p.id !== scorer.id));
                if (assister) { playerData.updatePlayerStats(assister.id, { assists: 1 }); playerAssistProviders.push(assister.name); }
            }
        }
    }

    const numYellows = dataGenerator.getRandomInt(0, 2);
    for (let i = 0; i < numYellows; i++) {
        const cardedPlayer = dataGenerator.getRandomElement(playerSquad.filter(p => p.status.injuryStatus === 'Fit' && !p.status.suspended));
        if (cardedPlayer) { playerData.updatePlayerStats(cardedPlayer.id, { yellowCards: 1 }); playerYellowCards.push(cardedPlayer.name); }
    }
    if (dataGenerator.getRandomInt(1, 100) < 5) {
        const redCardedPlayer = dataGenerator.getRandomElement(playerSquad.filter(p => p.status.injuryStatus === 'Fit' && !p.status.suspended && !playerYellowCards.some(name => name === p.name)));
        if (redCardedPlayer) {
            playerData.updatePlayerStats(redCardedPlayer.id, { redCards: 1 });
            playerRedCards.push(redCardedPlayer.name);
            playerData.updatePlayerStats(redCardedPlayer.id, { status: { ...redCardedPlayer.status, suspended: true, suspensionGames: 1 } });
        }
    }

    playerSquad.forEach(player => {
        if (player.status.injuryStatus === 'Fit' && !player.status.suspended && dataGenerator.getRandomInt(1, 100) < 5) {
            playerData.updatePlayerStats(player.id, { status: { ...player.status, injuryStatus: "Minor Knock", injuryReturnDate: "Next Week" } });
            player.status.injuryStatus = "Minor Knock";
            Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `${player.name} picked up a minor knock in the match!` });
        }
    });

    if (playerGoalScorers.length > 0) reportMessage += `\nYour scorers: ${playerGoalScorers.join(', ')}.`;
    if (playerAssistProviders.length > 0) reportMessage += ` Assists: ${playerAssistProviders.join(', ')}.`;
    if (playerYellowCards.length > 0 || playerRedCards.length > 0) reportMessage += `\nCards: Yellows: ${playerYellowCards.join(', ') || 'None'}, Reds: ${playerRedCards.join(', ') || 'None'}.`;

    renderers.showModal(
        `Full-Time Result: ${homeClubDetails.name} ${finalHomeScore} - ${finalAwayScore} ${awayClubDetails.name}`,
        reportMessage,
        [{ text: 'Continue', action: () => {
            renderers.hideModal();
            // Match is over. Now process AI matches for this week and then finalize the week.
            gameLoop.processAIMatchesAndFinalizeWeek(Main.gameState, Main.gameState.leagues[0].currentSeasonFixtures.find(wb => wb.week === (Main.gameState.currentWeek - Constants.PRE_SEASON_WEEKS)), matchState.matchId);
        }, isPrimary: true }]
    );

    return {
        homeScore: finalHomeScore, awayScore: finalAwayScore, homeTeamId: homeTeamId, awayTeamId: awayTeamId,
        homeTeamName: homeClubDetails.name, awayTeamName: awayClubDetails.name, report: reportMessage
    };
}

