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
            // Correctly set allClubsData for leagueData, including player club
            if (gameState.leagues && gameState.leagues.length > 0 && gameState.leagues[0].allClubsData) {
                 opponentData.setAllOpponentClubs(gameState.leagues[0].allClubsData); // Set ALL clubs in game world (player + opponents)
                 // Also ensure playerClub itself in gameState has the latest leagueStats if loaded from leagueData's allClubsData
                 const playerClubFromLeague = gameState.leagues[0].allClubsData.find(c => c.id === gameState.playerClub.id);
                 if (playerClubFromLeague) {
                     // Shallow copy leagueStats and finalLeaguePosition
                     gameState.playerClub.leagueStats = { ...playerClubFromLeague.leagueStats };
                     gameState.playerClub.finalLeaguePosition = playerClubFromLeague.finalLeaguePosition;
                 }
            } else {
                 opponentData.setAllOpponentClubs([]); // No opponent data if no leagues yet
            }
        }
        renderers.hideLoadingScreen(); // Hide loading screen
        updateUI(); // Render the loaded game state to the UI
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
    gameState.playerClub.squad = initialSquad; // Assign to gameState.playerClub
    playerData.setSquad(initialSquad); // Update playerData's internal state

    // 3. Generate initial league structure and opponent clubs
    const { leagues, clubs } = leagueData.generateInitialLeagues(
        gameState.playerClub.location,
        gameState.playerClub.id,
        gameState.playerClub.name
    );
    gameState.leagues = leagues;
    // Set all clubs (including player's and opponents) in opponentData for broader module access
    opponentData.setAllOpponentClubs(clubs);


    // 4. Set Initial Game State & Phase
    gameState.currentSeason = 1;
    gameState.currentWeek = 1;
    gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
    // The initial weekly tasks depend on initialized facilities and committee, which are in playerClub
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
    gameState.clubHistory = [];
    gameState.messages = [{ week: 0, text: 'Welcome to your Non-League Journey!' }];
    gameState.gamePhase = Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION;

    // Save initial game state before opponent customization
    saveGame(false); // Do not show message

    // Render opponent customization modal
    renderers.hideLoadingScreen();
    renderers.hideModal(); // Hide new game modal
    renderers.renderOpponentCustomizationModal(
        opponentData.getAllOpponentClubs(gameState.playerClub.id) // Pass only actual opponents (excluding player's club)
    );
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
        // Update opponentData module's internal state with the now-customized clubs
        opponentData.setAllOpponentClubs(currentLeague.allClubsData); // Set ALL clubs (player + opponents)
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
    saveGame(false); // Do not show message
    console.log("DEBUG: applyOpponentCustomization() finished.");
}

/**
 * Saves the current game state to Local Storage.
 * @param {boolean} showMessage - If true, displays a "Game Saved!" message. Default is true.
 */
export function saveGame(showMessage = true) {
    console.log("DEBUG: saveGame() called.");
    try {
        localStorageManager.saveGame(gameState);
        if (showMessage) {
            renderers.displayMessage('Game Saved!', 'Your progress has been secured.');
        }
        console.log("DEBUG: Game saved successfully.");
    } catch (error) {
        console.error("DEBUG: Failed to save game:", error);
        if (showMessage) {
            renderers.displayMessage('Save Failed!', 'Could not save game. Check browser storage space.');
        }
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
            if (gameState.leagues && gameState.leagues.length > 0 && gameState.leagues[0].allClubsData) {
                 opponentData.setAllOpponentClubs(gameState.leagues[0].allClubsData); // Set ALL clubs (player + opponents)
                 const playerClubFromLeague = gameState.leagues[0].allClubsData.find(c => c.id === gameState.playerClub.id);
                 if (playerClubFromLeague) {
                     gameState.playerClub.leagueStats = playerClubFromLeague.leagueStats;
                     gameState.playerClub.finalLeaguePosition = playerClubFromLeague.finalLeaguePosition;
                 }
            } else {
                 opponentData.setAllOpponentClubs([]);
            }
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
    // This check uses `availableHours` directly from gameState.
    // Ensure that if a task is "completed", its hours are deducted from `availableHours` in the UI immediately
    // or that this check accounts for `assignedHours` of tasks.
    const remainingHoursAfterAssignedTasks = Main.gameState.weeklyTasks.reduce((sum, task) => {
        return sum - (task.completed ? task.baseHours : 0);
    }, Constants.WEEKLY_BASE_HOURS);


    if (Main.gameState.availableHours > 0 && Main.gameState.availableHours > (Constants.WEEKLY_BASE_HOURS * 0.25)) { // Check if too many hours are unallocated
        renderers.showModal('Allocate More Time!', 'You still have a lot of available hours. Consider completing more tasks before advancing the week!', [{ text: 'Advance Anyway', action: () => {
            renderers.hideModal(); // Hide this modal
            // Proceed with the week advance (re-call advanceWeek logic, but carefully to avoid double-deductions)
            // A better pattern here is to pass a "force" flag, or just allow it if not critical.
            // For now, let's allow it but warn. If the player clicks "Advance Anyway", we can skip this check.
            proceedAdvanceWeekLogic();
        }},
        { text: 'Allocate More', action: () => {
            renderers.hideModal();
            // User stays on current week to allocate more
        }}
        ]);
        return; // Prevent immediate advance, wait for user choice
    }

    // If the check passes (or is skipped by a 'force' action), proceed:
    proceedAdvanceWeekLogic();
}

// Internal function to encapsulate actual week advancing logic
function proceedAdvanceWeekLogic() {
    renderers.showLoadingScreen();
    gameLoop.advanceWeek(gameState); // Pass current gameState for gameLoop to operate on
    // gameLoop.advanceWeek will call updateUI and saveGame(false) internally
    renderers.hideLoadingScreen(); // Hide loading screen AFTER gameLoop finishes
    console.log("DEBUG: proceedAdvanceWeekLogic() finished.");
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


    // Ensure we are selecting the currently active screen element
    // The active class is managed by renderers.renderGameScreen
    const activeScreenElement = document.querySelector('.game-screen.active');
    if (activeScreenElement) {
        const screenId = activeScreenElement.id;
        console.log(`DEBUG: Rendering active screen: ${screenId}`);
        switch (screenId) {
            case 'homeScreen':
                renderers.renderHomeScreen(gameState); // Now an empty function but keeps the structure
                break;
            case 'squadScreen':
                const squadData = playerData.getSquad();
                console.log("DEBUG: Squad data passed to renderer:", squadData);
                renderers.renderSquadScreen(squadData);
                break;
            case 'facilitiesScreen':
                renderers.renderFacilitiesScreen(gameState.playerClub.facilities);
                break;
            case 'financesScreen':
                console.log("DEBUG: Finance data passed to renderer:", gameState.playerClub.finances);
                renderers.renderFinancesScreen(gameState.playerClub.finances);
                break;
            case 'leagueScreen':
                const currentLeague = gameState.leagues[0];
                const allClubsInCurrentLeague = currentLeague ? currentLeague.allClubsData : [];
                console.log("DEBUG: League clubs data passed to renderer:", allClubsInCurrentLeague);
                renderers.renderLeagueScreen(
                    leagueData.getLeagueTable(currentLeague?.id, allClubsInCurrentLeague)
                );
                break;
            case 'fixturesScreen':
                console.log("DEBUG: Fixtures data passed to renderer:", leagueData.getFixtures(gameState.leagues, gameState.leagues[0]?.id));
                renderers.renderFixturesScreen(leagueData.getFixtures(gameState.leagues, gameState.leagues[0]?.id));
                break;
            case 'committeeScreen':
                const committeeData = clubData.getCommittee();
                console.log("DEBUG: Committee data passed to renderer:", committeeData);
                renderers.renderCommitteeScreen(committeeData);
                break;
            case 'historyScreen':
                console.log("DEBUG: History data passed to renderer:", gameState.clubHistory);
                renderers.renderHistoryScreen(gameState.clubHistory);
                break;
            default:
                console.warn(`DEBUG: No specific renderer case for screen: ${screenId}`);
                break;
        }
    } else {
        console.warn("DEBUG: No active screen element found to render specific data for.");
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

