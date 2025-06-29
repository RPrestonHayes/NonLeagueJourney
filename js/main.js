// js/main.js

console.log("DEBUG: main.js started execution.");

// --- Module Imports ---
console.log("DEBUG: Attempting to import localStorageManager...");
import * as localStorageManager from './utils/localStorageManager.js';
console.log("DEBUG: localStorageManager imported successfully.");

console.log("DEBUG: Attempting to import dataGenerator...");
import * as dataGenerator from './utils/dataGenerator.js';
console.log("DEBUG: dataGenerator imported successfully.");

console.log("DEBUG: Attempting to import renderers...");
import * as renderers from './ui/renderers.js';
console.log("DEBUG: renderers imported successfully.");

console.log("DEBUG: Attempting to import eventHandlers...");
import * as eventHandlers from './ui/eventHandlers.js';
console.log("DEBUG: eventHandlers imported successfully.");

console.log("DEBUG: Attempting to import clubData...");
import * as clubData from './data/clubData.js';
console.log("DEBUG: clubData imported successfully.");

console.log("DEBUG: Attempting to import playerData...");
import * as playerData from './data/playerData.js';
console.log("DEBUG: playerData imported successfully.");

console.log("DEBUG: Attempting to import opponentData...");
import * as opponentData from './data/opponentData.js';
console.log("DEBUG: opponentData imported successfully.");

console.log("DEBUG: Attempting to import leagueData...");
import * as leagueData from './data/leagueData.js';
console.log("DEBUG: leagueData imported successfully.");

console.log("DEBUG: Attempting to import gameLoop...");
import * as gameLoop from './logic/gameLoop.js';
console.log("DEBUG: gameLoop imported successfully.");

console.log("DEBUG: Attempting to import Constants...");
import * as Constants from './utils/constants.js';
console.log("DEBUG: Constants imported successfully.");


// --- Global Game State Object ---
export let gameState = {
    playerClub: null,           // Object for the player's club
    leagues: [],                // Array of league objects, including opponent clubs (structural data)
    currentSeason: 1,           // Current season number
    currentWeek: 1,             // Current week within the season
    availableHours: 0,          // Hours player has for tasks this week
    weeklyTasks: [],            // Tasks available for the player to assign hours to
    clubHistory: [],            // Array of past season summaries for player's club
    messages: [],               // Game messages/news feed (chronological log)
    gamePhase: Constants.GAME_PHASE.SETUP, // Current phase: SETUP, WEEKLY_PLANNING, MATCH_DAY, END_OF_SEASON
    playerClubCustomized: false, // Player has completed initial club setup
    opponentClubsCustomized: false, // Opponent clubs in league have been customized
};

console.log("DEBUG: gameState object initialized.");


// --- Core Game Functions ---

/**
 * Initializes the game when the page loads.
 * Attempts to load a saved game; otherwise, starts the new game setup process.
 */
function initGame() {
    console.log("DEBUG: initGame() called.");

    // Set up global UI event listeners first
    console.log("DEBUG: Calling eventHandlers.initGlobalListeners()...");
    eventHandlers.initGlobalListeners();
    console.log("DEBUG: eventHandlers.initGlobalListeners() returned.");

    console.log("DEBUG: Attempting to load game...");
    renderers.showLoadingScreen(); // Show loading screen while trying to load
    const loadedState = localStorageManager.loadGame();
    if (loadedState) {
        console.log("DEBUG: Game loaded from localStorage.");
        gameState = loadedState;
        renderers.displayMessage('DEBUG: Game Loaded!', 'From local storage.');
        // Re-initialize module states from loaded gameState
        if (gameState.playerClub) {
            playerData.setSquad(gameState.playerClub.squad || []);
            clubData.setCommittee(gameState.playerClub.committee || []);
            opponentData.setAllOpponentClubs(gameState.leagues[0]?.allClubsData.filter(c => c.id !== gameState.playerClub.id) || []);
        }
        updateUI();
        renderers.hideLoadingScreen(); // Hide loading screen
        renderers.renderGameScreen('homeScreen'); // Always go to home after load
    } else {
        console.log("DEBUG: No save game found. Rendering new game modal.");
        renderers.hideLoadingScreen(); // Hide loading screen
        renderers.renderNewGameModal(); // Show the new game setup modal
        renderers.displayMessage('DEBUG: Welcome!', 'Please set up a new game.');
        gameState.gamePhase = Constants.GAME_PHASE.SETUP;
    }
    console.log("DEBUG: initGame() finished.");
}

/**
 * Starts a brand new game, resetting all game state and populating initial data.
 * This is called from eventHandlers.js after the player provides initial club details.
 * @param {object} playerClubDetails - Object containing hometown, clubName, nickname, primaryColor, secondaryColor.
 */
export function startNewGame(playerClubDetails) {
    console.log("DEBUG: startNewGame() called with details:", playerClubDetails);

    renderers.showLoadingScreen(); // Show loading screen during game creation

    // 1. Initialize Player's Club
    gameState.playerClub = clubData.createPlayerClub(playerClubDetails);
    gameState.playerClubCustomized = true;

    // 2. Initialize Player Squad and attach to playerClub
    const initialSquad = playerData.initializePlayerSquad(gameState.playerClub.id);
    gameState.playerClub.squad = initialSquad; // Assign to gameState
    playerData.setSquad(initialSquad); // Ensure playerData's internal state is also updated

    // 3. Generate initial league structure and opponent clubs
    const { leagues, clubs } = leagueData.generateInitialLeagues(
        gameState.playerClub.location,
        gameState.playerClub.id,
        gameState.playerClub.name
    );
    gameState.leagues = leagues;
    opponentData.setAllOpponentClubs(clubs.filter(c => c.id !== gameState.playerClub.id));

    // 4. Set Initial Game State & Phase
    gameState.currentSeason = 1;
    gameState.currentWeek = 1;
    gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
    gameState.clubHistory = [];
    gameState.messages = [{ week: 0, text: 'Welcome to your Non-League Journey!' }];
    gameState.gamePhase = Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION;

    // Save initial game state before opponent customization
    saveGame();

    // Render opponent customization modal
    renderers.hideLoadingScreen();
    renderers.hideModal(); // Hide new game modal
    renderers.renderOpponentCustomizationModal(opponentData.getAllOpponentClubs());
    renderers.displayMessage('Your club is born!', 'Now, customize your league rivals before the season kicks off.');
    console.log("DEBUG: startNewGame() finished.");
}


/**
 * Applies customization changes to opponent clubs and transitions to pre-season.
 * This is called from eventHandlers.js after the player customizes opponents.
 * @param {Array<object>} customizedOpponents - Array of objects with id, name, nickname, kitColors for customized opponents.
 */
export function applyOpponentCustomization(customizedOpponents) {
    console.log("DEBUG: applyOpponentCustomization() called with:", customizedOpponents);

    renderers.showLoadingScreen(); // Show loading screen during processing

    // Update the league's allClubsData with customized opponent details
    const currentLeague = gameState.leagues[0]; // Assuming one league for now
    if (currentLeague && currentLeague.allClubsData) {
        currentLeague.allClubsData.forEach(club => {
            const custom = customizedOpponents.find(c => c.id === club.id);
            if (custom) {
                // Update the club object in allClubsData directly
                Object.assign(club, {
                    name: custom.name,
                    nickname: custom.nickname,
                    kitColors: custom.kitColors
                });
            }
        });
        // Also update the opponentData module's internal state
        // Filter out playerClub from allClubsData before setting opponents
        opponentData.setAllOpponentClubs(currentLeague.allClubsData.filter(c => c.id !== gameState.playerClub.id));
    }

    gameState.opponentClubsCustomized = true; // Mark opponent customization as complete
    gameState.gamePhase = Constants.GAME_PHASE.PRE_SEASON_PLANNING; // Transition to pre-season

    // Re-generate weekly tasks to reflect any potential changes based on game phase
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);

    renderers.hideLoadingScreen();
    renderers.hideOpponentCustomizationModal();
    renderers.displayMessage('Rivals Customized!', 'Your league opponents are now set for the journey ahead. Welcome to pre-season!');
    renderers.renderGameScreen('homeScreen'); // Go to home screen
    updateUI(); // Update UI with new club names
    saveGame(); // Save after customization
    console.log("DEBUG: applyOpponentCustomization() finished.");
}

/**
 * Saves the current game state to Local Storage.
 */
export function saveGame() {
    console.log("DEBUG: saveGame() called.");
    try {
        localStorageManager.saveGame(gameState);
        renderers.displayMessage('Game Saved!', 'Your progress has been secured.');
        console.log("DEBUG: Game saved successfully.");
    } catch (error) {
        console.error("DEBUG: Failed to save game:", error);
        renderers.displayMessage('Save Failed!', 'Could not save game. Check browser storage space.');
    }
}

/**
 * Loads the game state from Local Storage.
 * This function should ideally be called once during initGame.
 */
export function loadGame() {
    console.log("DEBUG: Attempting to load game...");
    renderers.showLoadingScreen();
    const loadedState = localStorageManager.loadGame();
    if (loadedState) {
        gameState = loadedState;
        renderers.displayMessage('Game Loaded!', 'Continue your journey to glory.');
        console.log("DEBUG: Game loaded successfully:", gameState);

        // Re-initialize internal data module states from loaded gameState
        if (gameState.playerClub) {
            playerData.setSquad(gameState.playerClub.squad || []);
            clubData.setCommittee(gameState.playerClub.committee || []);
            opponentData.setAllOpponentClubs(gameState.leagues[0]?.allClubsData.filter(c => c.id !== gameState.playerClub.id) || []);
        }

        updateUI();
        renderers.hideLoadingScreen();
        renderers.renderGameScreen('homeScreen');
    } else {
        renderers.displayMessage('No Save Found!', 'Starting a new game instead.');
        console.log("DEBUG: No game save found to load.");
        gameState = {
            playerClub: null, leagues: [], currentSeason: 1, currentWeek: 1,
            availableHours: 0, weeklyTasks: [], clubHistory: [], messages: [],
            gamePhase: Constants.GAME_PHASE.SETUP, playerClubCustomized: false, opponentClubsCustomized: false,
        };
        renderers.hideLoadingScreen();
        renderers.renderNewGameModal();
    }
}

/**
 * Resets the game to its initial state, effectively starting over.
 * Prompts user for confirmation.
 */
export function newGameConfirm() {
    console.log("DEBUG: newGameConfirm() called.");
    renderers.showModal(
        'Start New Game?',
        'Are you sure you want to start a new game? All unsaved progress will be lost.',
        [
            { text: 'Yes, Start New', action: () => {
                localStorageManager.clearSave();
                renderers.hideModal();
                gameState = {
                    playerClub: null, leagues: [], currentSeason: 1, currentWeek: 1,
                    availableHours: 0, weeklyTasks: [], clubHistory: [], messages: [],
                    gamePhase: Constants.GAME_PHASE.SETUP, playerClubCustomized: false, opponentClubsCustomized: false,
                };
                renderers.renderNewGameModal();
            }, isPrimary: true },
            { text: 'No, Cancel', action: () => {
                renderers.hideModal();
            }}
        ]
    );
}

/**
 * Advances the game by one week. This is the core of the game loop.
 * Delegates to the gameLoop module.
 */
export function advanceWeek() {
    console.log("DEBUG: advanceWeek() called.");
    if (gameState.availableHours < Constants.WEEKLY_BASE_HOURS * 0.25) {
        renderers.showModal('Allocate More Time!', 'You need to allocate more of your available hours before advancing the week. Try completing more tasks!');
        return;
    }
    renderers.showLoadingScreen();
    gameLoop.advanceWeek(gameState); // Pass current gameState for gameLoop to operate on
    updateUI(); // Redundant update if gameLoop also updates, but safe for now
    saveGame();
    renderers.hideLoadingScreen();
    console.log("DEBUG: advanceWeek() finished.");
}

/**
 * Updates all relevant UI elements based on the current gameState.
 * This function will be called frequently after state changes.
 */
export function updateUI() {
    console.log("DEBUG: updateUI() called. Current State:", gameState.currentSeason, gameState.currentWeek, gameState.gamePhase);
    if (!gameState.playerClub) {
        console.warn("DEBUG: playerClub not yet initialized in gameState, skipping some UI updates.");
        return;
    }

    renderers.updateTopBarStats(
        gameState.currentSeason,
        gameState.currentWeek,
        gameState.playerClub.finances.balance
    );
    renderers.updateClubNameDisplay(gameState.playerClub.name);

    renderers.updateWeeklyTasksDisplay(gameState.weeklyTasks, gameState.availableHours);


    const activeScreenElement = document.querySelector('.game-screen.active');
    if (activeScreenElement) {
        const screenId = activeScreenElement.id;
        switch (screenId) {
            case 'homeScreen':
                renderers.renderHomeScreen(gameState);
                break;
            case 'squadScreen':
                renderers.renderSquadScreen(playerData.getSquad());
                break;
            case 'facilitiesScreen':
                renderers.renderFacilitiesScreen(gameState.playerClub.facilities);
                break;
            case 'financesScreen':
                renderers.renderFinancesScreen(gameState.playerClub.finances);
                break;
            case 'leagueScreen':
                // Pass the correct league ID and the full list of clubs (player + opponents)
                const currentLeague = gameState.leagues[0];
                const allClubsForLeagueTable = currentLeague ? [gameState.playerClub, ...opponentData.getAllOpponentClubs()] : [];
                renderers.renderLeagueScreen(
                    leagueData.getLeagueTable(currentLeague?.id, allClubsForLeagueTable)
                );
                break;
            case 'fixturesScreen':
                renderers.renderFixturesScreen(leagueData.getFixtures(gameState.leagues, gameState.leagues[0]?.id));
                break;
            case 'committeeScreen':
                renderers.renderCommitteeScreen(gameState.playerClub.committee);
                break;
            case 'historyScreen':
                renderers.renderHistoryScreen(gameState.clubHistory);
                break;
        }
    }

    if (gameState.messages.length > 0) {
        renderers.updateNewsFeed(gameState.messages[gameState.messages.length - 1].text);
    }
    console.log("DEBUG: updateUI() finished.");
}


// --- Event Listener for Page Load ---
console.log("DEBUG: Adding DOMContentLoaded listener.");
document.addEventListener('DOMContentLoaded', initGame);
console.log("DEBUG: main.js finished loading.");

