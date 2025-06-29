// js/main.js

// --- Module Imports ---
// Import utility for managing Local Storage saves
import * as localStorageManager from './utils/localStorageManager.js';
// Import utility for generating initial game data (used indirectly via data modules now)
// import * as dataGenerator from './utils/dataGenerator.js'; // No direct use in main.js
// Import UI rendering functions
import * as renderers from './ui/renderers.js';
// Import UI event handling functions
import * as eventHandlers from './ui/eventHandlers.js';
// Import club data management
import * as clubData from './data/clubData.js';
// Import player data management
import * as playerData from './data/playerData.js';
// Import opponent data management
import * as opponentData from './data/opponentData.js';
// Import league data management
import * as leagueData from './data/leagueData.js';
// Import game loop logic (will be implemented next)
import * as gameLoop from './logic/gameLoop.js';
// Import constants for various game values (e.g., player positions, event types)
import * as Constants from './utils/constants.js';


// --- Global Game State Object ---
// This object will hold all the dynamic data for the current game session.
// It will be serialized and saved to Local Storage.
export let gameState = {
    playerClub: null,           // Object for the player's club
    leagues: [],                // Array of league objects, including opponent clubs (structural data)
    currentSeason: 1,           // Current season number
    currentWeek: 1,             // Current week within the season
    availableHours: 0,          // Hours player has for tasks this week
    weeklyTasks: [],            // Tasks available for the player to assign hours to
    // matchSchedule is now part of the league object
    clubHistory: [],            // Array of past season summaries for player's club
    messages: [],               // Game messages/news feed (chronological log)
    gamePhase: Constants.GAME_PHASE.SETUP, // Current phase: SETUP, WEEKLY_PLANNING, MATCH_DAY, END_OF_SEASON
    // Flags for one-time customizations
    playerClubCustomized: false, // Player has completed initial club setup
    opponentClubsCustomized: false, // Opponent clubs in league have been customized
};

// --- Core Game Functions ---

/**
 * Initializes the game when the page loads.
 * Attempts to load a saved game; otherwise, starts the new game setup process.
 */
function initGame() {
    console.log("Initializing game...");

    // Set up global UI event listeners first, so UI is interactive from start
    eventHandlers.initGlobalListeners();

    // Try to load a saved game
    const loadedState = localStorageManager.loadGame();
    if (loadedState) {
        // If a save exists, restore the gameState
        gameState = loadedState;
        console.log("Game loaded successfully!", gameState);
        renderers.displayMessage('Game Loaded!', 'Continue your journey to glory.');

        // Re-initialize internal data module states from loaded gameState
        playerData.setSquad(gameState.playerClub.squad);
        clubData.setCommittee(gameState.playerClub.committee);
        // Opponent structural data is within gameState.leagues[0].allClubsData
        // (Assuming single league for now, will expand later for multiple leagues)
        opponentData.setAllOpponentClubs(gameState.leagues[0]?.allClubsData.filter(c => c.id !== gameState.playerClub.id) || []);


        updateUI(); // Render the loaded game state to the UI

        // Determine which screen to show after load
        if (gameState.gamePhase === Constants.GAME_PHASE.SETUP && !gameState.playerClubCustomized) {
            renderers.renderGameScreen('newGameModal');
        } else if (gameState.gamePhase === Constants.GAME_PHASE.SETUP && !gameState.opponentClubsCustomized) {
            renderers.renderOpponentCustomizationModal(opponentData.getAllOpponentClubs());
        } else {
            renderers.renderGameScreen('homeScreen'); // Default to home screen
        }

    } else {
        // If no save, start the new game process
        console.log("No save game found. Starting new game setup.");
        renderers.renderNewGameModal(); // Show the new game setup modal
        renderers.displayMessage('Welcome, Gaffer!', 'Time to create your club and start your Non-League Journey.');
        // Set initial game phase
        gameState.gamePhase = Constants.GAME_PHASE.SETUP;
    }
}

/**
 * Starts a brand new game, resetting all game state and populating initial data.
 * This is called from eventHandlers.js after the player provides initial club details.
 * @param {object} playerClubDetails - Object containing hometown, clubName, nickname, primaryColor, secondaryColor.
 */
export function startNewGame(playerClubDetails) {
    console.log("Starting new game with details:", playerClubDetails);

    // 1. Initialize Player's Club
    gameState.playerClub = clubData.createPlayerClub(playerClubDetails);
    gameState.playerClubCustomized = true; // Mark player club setup as complete

    // 2. Initialize Player Squad and attach to playerClub
    gameState.playerClub.squad = playerData.initializePlayerSquad(gameState.playerClub.id);
    playerData.setSquad(gameState.playerClub.squad); // Update playerData's internal state

    // 3. Generate initial league structure and opponent clubs
    const { leagues, clubs } = leagueData.generateInitialLeagues(
        gameState.playerClub.location,
        gameState.playerClub.id,
        gameState.playerClub.name
    );
    gameState.leagues = leagues; // Contains league metadata and all clubs in 'allClubsData' property
    opponentData.setAllOpponentClubs(clubs.filter(c => c.id !== gameState.playerClub.id)); // Set opponents in their module

    // 4. Set Initial Game State & Phase
    gameState.currentSeason = 1;
    gameState.currentWeek = 1;
    gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
    gameState.clubHistory = []; // Ensure empty for new game
    gameState.messages = [{ week: 0, text: 'Welcome to your Non-League Journey!' }];
    gameState.gamePhase = Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION; // Transition to opponent customization phase

    // Save initial game state before opponent customization
    saveGame();

    // Render opponent customization modal
    renderers.hideModal(); // Hide new game modal
    renderers.renderOpponentCustomizationModal(opponentData.getAllOpponentClubs());
    renderers.displayMessage('Your club is born!', 'Now, customize your league rivals before the season kicks off.');
}

/**
 * Applies customization changes to opponent clubs and transitions to pre-season.
 * This is called from eventHandlers.js after the player customizes opponents.
 * @param {Array<object>} customizedOpponents - Array of objects with id, name, nickname, kitColors for customized opponents.
 */
export function applyOpponentCustomization(customizedOpponents) {
    console.log("Applying opponent customization:", customizedOpponents);

    // Update the league's allClubsData with customized opponent details
    const currentLeague = gameState.leagues[0]; // Assuming one league for now
    if (currentLeague && currentLeague.allClubsData) {
        currentLeague.allClubsData.forEach(club => {
            const custom = customizedOpponents.find(c => c.id === club.id);
            if (custom) {
                club.name = custom.name;
                club.nickname = custom.nickname;
                club.kitColors = custom.kitColors;
            }
        });
        // Also update the opponentData module's internal state
        opponentData.setAllOpponentClubs(currentLeague.allClubsData.filter(c => c.id !== gameState.playerClub.id));
    }

    gameState.opponentClubsCustomized = true; // Mark opponent customization as complete
    gameState.gamePhase = Constants.GAME_PHASE.PRE_SEASON_PLANNING; // Transition to pre-season

    // Re-generate weekly tasks to reflect any potential changes based on game phase
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);

    renderers.hideOpponentCustomizationModal();
    renderers.displayMessage('Rivals Customized!', 'Your league opponents are now set for the journey ahead. Welcome to pre-season!');
    renderers.renderGameScreen('homeScreen'); // Go to home screen
    updateUI(); // Update UI with new club names and current game phase
    saveGame(); // Save after customization
}

/**
 * Saves the current game state to Local Storage.
 */
export function saveGame() {
    console.log("Saving game...");
    try {
        localStorageManager.saveGame(gameState);
        renderers.displayMessage('Game Saved!', 'Your progress has been secured.');
        console.log("Game saved successfully.");
    } catch (error) {
        console.error("Failed to save game:", error);
        renderers.displayMessage('Save Failed!', 'Could not save game. Check browser storage space.');
    }
}

/**
 * Loads the game state from Local Storage.
 * This function should ideally be called once during initGame.
 */
export function loadGame() {
    console.log("Attempting to load game...");
    const loadedState = localStorageManager.loadGame();
    if (loadedState) {
        gameState = loadedState;
        renderers.displayMessage('Game Loaded!', 'Continue your journey to glory.');
        console.log("Game loaded successfully:", gameState);

        // Re-initialize internal data module states from loaded gameState
        playerData.setSquad(gameState.playerClub.squad);
        clubData.setCommittee(gameState.playerClub.committee);
        // Assuming one league for simplicity now, update opponent data
        opponentData.setAllOpponentClubs(gameState.leagues[0]?.allClubsData.filter(c => c.id !== gameState.playerClub.id) || []);

        updateUI(); // After loading, update the UI to reflect the loaded state
        renderers.renderGameScreen('homeScreen'); // Go to home screen after loading
    } else {
        renderers.displayMessage('No Save Found!', 'Starting a new game instead.');
        console.log("No game save found to load.");
        // Clear any half-baked state if a load failed
        gameState = {
            playerClub: null, leagues: [], currentSeason: 1, currentWeek: 1,
            availableHours: 0, weeklyTasks: [], clubHistory: [], messages: [],
            gamePhase: Constants.GAME_PHASE.SETUP, playerClubCustomized: false, opponentClubsCustomized: false,
        };
        renderers.renderNewGameModal(); // Go to new game setup
    }
}

/**
 * Resets the game to its initial state, effectively starting over.
 * Prompts user for confirmation.
 */
export function newGameConfirm() {
    // Implement a confirmation dialog using the generic game modal
    renderers.showModal(
        'Start New Game?',
        'Are you sure you want to start a new game? All unsaved progress will be lost.',
        [
            { text: 'Yes, Start New', action: () => {
                localStorageManager.clearSave(); // Clear existing save
                renderers.hideModal(); // Hide confirmation modal
                // Reset gameState to initial blank state immediately
                gameState = {
                    playerClub: null, leagues: [], currentSeason: 1, currentWeek: 1,
                    availableHours: 0, weeklyTasks: [], clubHistory: [], messages: [],
                    gamePhase: Constants.GAME_PHASE.SETUP, playerClubCustomized: false, opponentClubsCustomized: false,
                };
                renderers.renderNewGameModal(); // Show new game setup modal
                // Other initial setup will happen when startNewGame is called after modal input
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
    console.log("Advancing week...");
    // Check if player has allocated all hours (or enough for critical tasks)
    if (gameState.availableHours < Constants.WEEKLY_BASE_HOURS * 0.25) { // Example: must use at least 75% of hours
        // You can make this stricter (must use all, or only for critical tasks)
        renderers.showModal('Allocate More Time!', 'You need to allocate more of your available hours before advancing the week. Try completing more tasks!');
        return;
    }
    // Call the gameLoop module's advanceWeek function
    gameLoop.advanceWeek(gameState); // Pass current gameState for gameLoop to operate on
    updateUI(); // Update UI after week advance
    saveGame(); // Automatically save after each week
}

/**
 * Updates all relevant UI elements based on the current gameState.
 * This function will be called frequently after state changes.
 */
export function updateUI() {
    // Basic safety check for playerClub to avoid errors before it's initialized
    if (!gameState.playerClub) {
        console.warn("playerClub not yet initialized in gameState, skipping some UI updates.");
        return;
    }

    // Render core game stats (always visible)
    renderers.updateTopBarStats(
        gameState.currentSeason,
        gameState.currentWeek,
        gameState.playerClub.finances.balance
    );
    renderers.updateClubNameDisplay(gameState.playerClub.name);

    // Update the weekly tasks list on home screen (always relevant)
    renderers.updateWeeklyTasksDisplay(gameState.weeklyTasks, gameState.availableHours);


    // Determine which main content screen is currently active and render its data
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
                // Assuming one league for now, pass all clubs for sorting
                renderers.renderLeagueScreen(
                    leagueData.getLeagueTable(gameState.leagues[0].id, [gameState.playerClub, ...opponentData.getAllOpponentClubs()])
                );
                break;
            case 'fixturesScreen':
                 // Assuming one league, get its fixtures
                renderers.renderFixturesScreen(leagueData.getFixtures(gameState.leagues, gameState.leagues[0].id));
                break;
            case 'committeeScreen':
                renderers.renderCommitteeScreen(gameState.playerClub.committee);
                break;
            case 'historyScreen':
                renderers.renderHistoryScreen(gameState.clubHistory);
                break;
            // No default for other screens (modals) as they are handled explicitly
        }
    }

    // Always update messages/news
    if (gameState.messages.length > 0) {
        renderers.updateNewsFeed(gameState.messages[gameState.messages.length - 1].text);
    }
}


// --- Event Listener for Page Load ---
// This ensures the game initializes only after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initGame);


