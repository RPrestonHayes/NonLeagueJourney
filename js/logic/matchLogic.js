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
import * as Main from '../main.js'; // Keep Main import for Main.gameState access
import * as dataGenerator from '../utils/dataGenerator.js';
import * as gameLoop from './gameLoop.js'; // Import gameLoop module
import * as leagueData from '../data/leagueData.js';


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

/**
 * Simulates a single match between two clubs.
 * This is a core simulation function used for both player and AI matches.
 * @param {string} homeClubId - ID of the home club.
 * @param {string} awayClubId - ID of the away club.
 * @param {object} playerClub - The player's club object (needed for its squad and reputation).
 * @param {Array<object>} allOpponentClubs - All opponent club structural data.
 * @param {Array<object>} playerSquad - The player's current squad.
 * @returns {object} An object containing match results and report.
 */
export function simulateMatch(homeClubId, awayClubId, playerClub, allOpponentClubs, playerSquad) { // EXPORTED
    let homeClubDetails, awayClubDetails;
    let homeSquadForMatch, awaySquadForMatch;

    // Determine club details and generate seasonal squads if AI
    if (homeClubId === playerClub.id) {
        homeClubDetails = playerClub;
        homeSquadForMatch = playerSquad;
    } else {
        homeClubDetails = allOpponentClubs.find(c => c.id === homeClubId);
        homeSquadForMatch = opponentData.generateSeasonalOpponentPlayers(homeClubId, homeClubDetails.overallTeamQuality);
    }

    if (awayClubId === playerClub.id) {
        awayClubDetails = playerClub;
        awaySquadForMatch = playerSquad;
    } else {
        awayClubDetails = allOpponentClubs.find(c => c.id === awayClubId);
        awaySquadForMatch = opponentData.generateSeasonalOpponentPlayers(awayClubId, awayClubDetails.overallTeamQuality);
    }

    // Calculate team ratings, applying morale bonus for player's team
    let homeAttack, homeDefense, awayAttack, awayDefense;

    if (homeClubId === playerClub.id) {
        const playerTeamMoraleAvg = playerSquad.reduce((sum, p) => sum + p.status.morale, 0) / playerSquad.length;
        homeAttack = calculateTeamAttackingRatingFromSquad(homeSquadForMatch) + (playerTeamMoraleAvg - 50) / 20;
        homeDefense = calculateTeamDefensiveRatingFromSquad(homeSquadForMatch) + (playerTeamMoraleAvg - 50) / 20;
    } else {
        homeAttack = homeClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2);
        homeDefense = homeClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2);
    }

    if (awayClubId === playerClub.id) {
        const playerTeamMoraleAvg = playerSquad.reduce((sum, p) => sum + p.status.morale, 0) / playerSquad.length;
        awayAttack = calculateTeamAttackingRatingFromSquad(awaySquadForMatch) + (playerTeamMoraleAvg - 50) / 20;
        awayDefense = calculateTeamDefensiveRatingFromSquad(awaySquadForMatch) + (playerTeamMoraleAvg - 50) / 20;
    } else {
        awayAttack = awayClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2);
        awayDefense = awayClubDetails.overallTeamQuality + dataGenerator.getRandomInt(-2, 2);
    }

    const homeAdvantageFactor = (homeClubId === playerClub.id && playerClub.facilities[Constants.FACILITIES.PITCH].isUsable) ? 1 : 0; // Only player gets home advantage if pitch is usable
    const randomMatchVariance = dataGenerator.getRandomInt(-1, 1);

    // Initial score calculation based on attack vs defense
    let homeScoreBase = Math.max(0, homeAttack - awayDefense + homeAdvantageFactor + randomMatchVariance);
    let awayScoreBase = Math.max(0, awayAttack - homeDefense - homeAdvantageFactor + randomMatchVariance);

    // Introduce some randomness and cap scores
    const finalHomeScore = Math.max(0, Math.min(Math.round(homeScoreBase + dataGenerator.getRandomInt(-1, 2)), 5));
    const finalAwayScore = Math.max(0, Math.min(Math.round(awayScoreBase + dataGenerator.getRandomInt(-1, 2)), 5));

    let reportMessage = `Match simulated: ${homeClubDetails.name} ${finalHomeScore} - ${finalAwayScore} ${awayClubDetails.name}.`;

    return {
        homeScore: finalHomeScore, awayScore: finalAwayScore, homeTeamId: homeClubId, awayTeamId: awayClubId,
        homeTeamName: homeClubDetails.name, awayTeamName: awayClubDetails.name, report: reportMessage
    };
}


// --- Match Day State Management ---
let currentMatchState = null; // Stores data for the match currently being simulated

/**
 * Displays a pre-match briefing modal with match details, conditions, and referee info.
 * This starts the multi-stage match simulation.
 * @param {object} gameState - The current game state.
 * @param {object} playerMatch - The match object involving the player's team.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 */
export function preMatchBriefing(gameState, playerMatch, updateUICallbacks) {
    console.log("DEBUG: preMatchBriefing called. updateUICallbacks:", updateUICallbacks); // Debug log
    const isHomeMatch = playerMatch.homeTeamId === gameState.playerClub.id;
    // Ensure opponentClub is found from the comprehensive allClubsInGameWorld
    const opponentClub = opponentData.getOpponentClub(isHomeMatch ? playerMatch.awayTeamId : playerMatch.homeTeamId);
    
    // Safety check: If opponentClub is still undefined, there's a data inconsistency.
    // This should ideally not happen with the main.js load fix.
    if (!opponentClub) {
        console.error("ERROR: Opponent club not found for pre-match briefing. Match ID:", playerMatch.id, "Opponent ID:", isHomeMatch ? playerMatch.awayTeamId : playerMatch.homeTeamId);
        renderers.showModal('Match Error', 'Could not find opponent details for this match. Skipping match.', [{ text: 'Continue', action: (gs, uic, context) => {
            renderers.hideModal();
            // This will attempt to process the rest of the week's events, including AI matches.
            gameLoop.processAIMatchesAndFinalizeWeek(gs, playerMatch.id, uic); // Pass playerMatch.id, uic
        }}], gameState, updateUICallbacks, 'opponent_not_found_pre_match');
        return;
    }


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
        allOpponentClubs: opponentData.getAllOpponentClubs(null), // Pass all clubs, not just opponents, for simulation to find them
        playerSquad: playerData.getSquad(),
        isHomeMatch: isHomeMatch,
        opponentClub: opponentClub,
        matchId: playerMatch.id,
        // Pass the actual league ID from playerMatch, not just leagues[0].id
        leagueId: playerMatch.competition === Constants.COMPETITION_TYPE.LEAGUE ? gameState.playerClub.currentLeagueId : null, 
        competitionType: playerMatch.competition, // Store competition type
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
        [{ text: 'Kick Off!', action: (gs, uic, context) => simulateFirstHalf(currentMatchState, gs, uic, context), isPrimary: true }], // Chain to first half, pass all args
        gameState, // Pass gameState
        updateUICallbacks, // Pass callbacks
        'pre_match_briefing' // Context
    );
    // Use gameState.currentWeek for message consistency
    gameState.messages.push({ week: gameState.currentWeek, text: `Pre-match briefing for ${playerMatch.homeTeamName} vs ${playerMatch.awayTeamName}.` });
}

/**
 * Simulates the first half of the match and displays its outcome.
 * @param {object} matchState - The current match state object.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @param {string} dismissalContext - Context for modal dismissal.
 */
function simulateFirstHalf(matchState, gameState, updateUICallbacks, dismissalContext) {
    console.log("DEBUG: Simulating First Half...");
    const { homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad, isHomeMatch, opponentClub } = matchState;

    // Determine club details for display in half-time message
    const homeClubDetails = (homeTeamId === playerClub.id) ? playerClub : opponentClub;
    const awayClubDetails = (awayTeamId === playerClub.id) ? playerClub : opponentClub;

    // Use the simulateMatch function for the first half
    const halfResult = simulateMatch(homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad);
    
    matchState.firstHalfHomeScore = halfResult.homeScore;
    matchState.firstHalfAwayScore = halfResult.awayScore;

    // Update player appearances for the half played
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

    renderers.showModal('Half-Time!', halfTimeMessage, [{ text: 'Go to Half-Time', action: (gs, uic, context) => halfTimeOptions(matchState, gs, uic, context), isPrimary: true }], gameState, updateUICallbacks, dismissalContext);
}

/**
 * Presents half-time options to the player.
 * @param {object} matchState - The current match state object.
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @param {string} dismissalContext - Context for modal dismissal.
 */
function halfTimeOptions(matchState, gameState, updateUICallbacks, dismissalContext) {
    console.log("DEBUG: Half-time options presented.");
    const facilities = gameState.playerClub.facilities; // Use provided gameState
    const choices = [];

    // All actions now explicitly trigger renderers.hideModal()
    choices.push({ text: 'Talk to Players in Changing Room', action: (gs, uic, context) => { renderers.hideModal(); halfTimeAction(matchState, 'talk_players', gs, uic, context); }, isPrimary: true });

    if (facilities[Constants.FACILITIES.CLUBHOUSE] && facilities[Constants.FACILITIES.CLUBHOUSE].level > 0) {
        choices.push({ text: 'Head to the Committee Room', action: (gs, uic, context) => { renderers.hideModal(); halfTimeAction(matchState, 'committee_room', gs, uic, context); } });
        choices.push({ text: 'Grab a drink at the Bar', action: (gs, uic, context) => { renderers.hideModal(); halfTimeAction(matchState, 'bar', gs, uic, context); } });
    } else if (facilities[Constants.FACILITIES.SNACKBAR] && facilities[Constants.FACILITIES.SNACKBAR].level > 0) {
        choices.push({ text: 'Grab a Cuppa at the Tea Hut', action: (gs, uic, context) => { renderers.hideModal(); halfTimeAction(matchState, 'bar', gs, uic, context); } });
    }

    choices.push({ text: 'Wait in the Stands', action: (gs, uic, context) => { renderers.hideModal(); halfTimeAction(matchState, 'stands', gs, uic, context); } });
    choices.push({ text: 'Talk to the Referee', action: (gs, uic, context) => { renderers.hideModal(); halfTimeAction(matchState, 'referee', gs, uic, context); } });
    choices.push({ text: 'Mingle with Fans', action: (gs, uic, context) => { renderers.hideModal(); halfTimeAction(matchState, 'fans', gs, uic, context); } });

    renderers.showModal('Half-Time: Your Decision', 'What do you want to do during the break?', choices, gameState, updateUICallbacks, dismissalContext);
}

/**
 * Processes the player's chosen half-time action.
 * @param {object} matchState - The current match state object.
 * @param {string} actionType - The type of action chosen (e.g., 'talk_players', 'bar').
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @param {string} dismissalContext - Context for modal dismissal.
 */
function halfTimeAction(matchState, actionType, gameState, updateUICallbacks, dismissalContext) {
    let outcomeMessage = '';
    let moraleChange = 0;
    let financeChange = 0;
    let committeeRelChange = 0; // Not directly used yet, but kept for future
    let teamPerformanceBonus = 0; // Temporary boost for 2nd half

    const teamMoraleAvg = gameState.playerClub.squad.reduce((sum, p) => sum + p.status.morale, 0) / gameState.playerClub.squad.length;

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
            gameState.playerClub.squad.forEach(player => playerData.updatePlayerMorale(player.id, moraleChange));
            break;
        case 'committee_room':
            const chairman = gameState.playerClub.committee.find(c => c.role === Constants.COMMITTEE_ROLES.CHAIR);
            if (chairman) {
                committeeRelChange = dataGenerator.getRandomInt(2, 5);
                outcomeMessage = "You discussed club matters with the committee. Relationships strengthened slightly.";
                // chairman.personality.loyaltyToYou += committeeRelChange; // Need to implement update committee member function
            } else {
                outcomeMessage = "You spent time in the empty committee room. Nothing notable happened.";
            }
            break;
        case 'bar':
            financeChange = clubData.calculateMatchDayRevenue(gameState.playerClub.facilities, gameState.playerClub.fanbase) * 0.2; // Small extra revenue
            outcomeMessage = "You enjoyed a quick drink, and saw some extra income from happy fans.";
            gameState.playerClub.finances = clubData.addTransaction(gameState.playerClub.finances, financeChange, Constants.TRANSACTION_TYPE.MATCH_DAY_IN, 'Half-Time Bar Revenue');
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

    renderers.showModal('Half-Time Action Outcome', outcomeMessage, [{ text: 'Begin Second Half', action: (gs, uic, context) => simulateSecondHalf(matchState, teamPerformanceBonus, gs, uic, context), isPrimary: true }], gameState, updateUICallbacks, dismissalContext);
}

/**
 * Simulates the second half of the match and displays the full match report.
 * @param {object} matchState - The current match state object.
 * @param {number} performanceBonus - A bonus to apply to team performance in the second half (from half-time action).
 * @param {object} gameState - The current mutable gameState object.
 * @param {object} updateUICallbacks - Callbacks from Main module.
 * @param {string} dismissalContext - Context for modal dismissal.
 */
function simulateSecondHalf(matchState, performanceBonus = 0, gameState, updateUICallbacks, dismissalContext) {
    console.log("DEBUG: Simulating Second Half...");
    console.log("DEBUG: simulateSecondHalf - updateUICallbacks:", updateUICallbacks); // Add debug log here
    const { homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad, matchId, leagueId, competitionType } = matchState;

    // Determine club details for display in match report
    const homeClubDetails = (homeTeamId === playerClub.id) ? playerClub : allOpponentClubs.find(c => c.id === homeTeamId);
    const awayClubDetails = (awayTeamId === playerClub.id) ? playerClub : allOpponentClubs.find(c => c.id === awayTeamId);

    // Use the simulateMatch function for the second half
    const halfResult = simulateMatch(homeTeamId, awayTeamId, playerClub, allOpponentClubs, playerSquad);

    matchState.secondHalfHomeScore = halfResult.homeScore;
    matchState.secondHalfAwayScore = halfResult.awayScore;

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
            // Use gameState.currentWeek for message consistency
            gameState.messages.push({ week: gameState.currentWeek, text: `${player.name} picked up a minor knock in the match!` });
        }
    });

    if (playerGoalScorers.length > 0) reportMessage += `\nYour scorers: ${playerGoalScorers.join(', ')}.`;
    if (playerAssistProviders.length > 0) reportMessage += ` Assists: ${playerAssistProviders.join(', ')}.`;
    if (playerYellowCards.length > 0 || playerRedCards.length > 0) reportMessage += `\nCards: Yellows: ${playerYellowCards.join(', ') || 'None'}, Reds: ${playerRedCards.join(', ') || 'None'}.`;

    // --- Update gameState based on competition type ---
    if (competitionType === Constants.COMPETITION_TYPE.LEAGUE) {
        // FIX: Use matchState.leagueId to find the correct league
        const playerCurrentLeague = Main.gameState.leagues.find(l => l.id === matchState.leagueId);
        if (playerCurrentLeague) {
            Main.gameState.leagues = leagueData.updateLeagueTable(
                Main.gameState.leagues,
                playerCurrentLeague.id, // Use the found league's ID
                homeTeamId,
                awayTeamId,
                finalHomeScore,
                finalAwayScore
            );
            Main.gameState.leagues = leagueData.updateMatchResult(
                Main.gameState.leagues,
                playerCurrentLeague.id, // Use the found league's ID
                matchId,
                `${finalHomeScore}-${finalAwayScore}`
            );
        } else {
            console.error(`ERROR: Player's league (ID: ${matchState.leagueId}) not found for league table update after match.`);
        }
    } else if (competitionType === Constants.COMPETITION_TYPE.COUNTY_CUP) {
        // Update cup fixture result
        const cupFixtureBlockIndex = Main.gameState.countyCup.fixtures.findIndex(fb => fb.week === Main.gameState.currentWeek);
        if (cupFixtureBlockIndex !== -1) {
            const matchIndex = Main.gameState.countyCup.fixtures[cupFixtureBlockIndex].matches.findIndex(m => m.id === matchId);
            if (matchIndex !== -1) {
                Main.gameState.countyCup.fixtures[cupFixtureBlockIndex].matches[matchIndex].result = `${finalHomeScore}-${finalAwayScore}`;
                Main.gameState.countyCup.fixtures[cupFixtureBlockIndex].matches[matchIndex].played = true;
            }
        }

        // Determine winner/loser for cup progression
        const playerTeamId = Main.gameState.playerClub.id;
        let playerWonCupMatch = false;
        if (finalHomeScore === finalAwayScore) { // Draw in cup means player loses
            playerWonCupMatch = false;
            reportMessage += `\nIt's a draw! You are eliminated on penalties/replay.`;
        } else if (homeTeamId === playerTeamId) {
             playerWonCupMatch = finalHomeScore > finalAwayScore;
        } else if (awayTeamId === playerTeamId) {
             playerWonCupMatch = finalAwayScore > finalHomeScore;
        }


        if (playerWonCupMatch) {
            Main.gameState.countyCup.playerTeamStatus = 'Active'; // Still in cup
            Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `You won your County Cup match!` });
        } else {
            Main.gameState.countyCup.playerTeamStatus = 'Eliminated'; // Knocked out
            Main.gameState.messages.push({ week: Main.gameState.currentWeek, text: `You lost your County Cup match and are eliminated!` });
        }

        // --- FIX: Update status for ALL teams in the countyCup.teams list based on match outcome ---
        Main.gameState.countyCup.teams = Main.gameState.countyCup.teams.map(team => {
            if (team.id === homeTeamId) { // Check home team
                return { ...team, inCup: (finalHomeScore > finalAwayScore), eliminatedFromCup: (finalHomeScore <= finalAwayScore) };
            }
            if (team.id === awayTeamId) { // Check away team
                return { ...team, inCup: (finalAwayScore > finalHomeScore), eliminatedFromCup: (finalAwayScore <= finalHomeScore) };
            }
            return team;
        });
        // --- END FIX ---
    }
    // --- END CRUCIAL ADDITION ---


    renderers.showModal(
        `Full-Time Result: ${homeClubDetails.name} ${finalHomeScore} - ${finalAwayScore} ${awayClubDetails.name}`,
        reportMessage,
        [{ text: 'Continue', action: (gs, uic, context) => {
            renderers.hideModal();
            // After match report, process AI matches for this week, then finalize the week.
            // Call processAIMatchesAndFinalizeWeek without currentWeekBlock, it will now fetch its own
            gameLoop.processAIMatchesAndFinalizeWeek(gs, matchId, uic); // Pass playerMatchId, uic
        }, isPrimary: true }],
        gameState,
        updateUICallbacks, // Pass updateUICallbacks here
        dismissalContext
    );

    return {
        homeScore: finalHomeScore, awayScore: finalAwayScore, homeTeamId: homeTeamId, awayTeamId: awayClubDetails.id,
        homeTeamName: homeClubDetails.name, awayTeamName: awayClubDetails.name, report: reportMessage
    };
}