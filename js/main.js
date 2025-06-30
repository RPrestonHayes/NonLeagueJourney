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

import { getContrastingTextColor } from './utils/coloursUtils.js';


// --- Global Game State Object ---
export let gameState = {
    playerClub: null,
    leagues: [],
    currentSeason: 1,
    currentWeek: 1,
    availableHours: 0,
    weeklyTasks: [],
    clubHistory: [],
    messages: [],
    gamePhase: Constants.GAME_PHASE.SETUP,
    playerClubCustomized: false,
    opponentClubsCustomized: false,
};

console.log("DEBUG: gameState object initialized.");


// --- Helper for Calendar Conversion ---
function getCalendarWeekString(weekNum) {
    if (weekNum <= 0) { return "Invalid Week"; }
    if (weekNum <= Constants.PRE_SEASON_WEEKS) {
        return `${Constants.MONTH_NAMES[Constants.SEASON_START_MONTH_INDEX]} Week ${weekNum} (Pre-Season)`;
    }
    const weekInRegularSeasonBlock = weekNum - Constants.PRE_SEASON_WEEKS;
    let cumulativeWeeksInMap = 0;
    for (let i = 0; i < Constants.GAME_WEEK_TO_MONTH_MAP.length; i++) {
        const monthBlock = Constants.GAME_WEEK_TO_MONTH_MAP[i];
        const weeksInThisMonthBlock = monthBlock.weeks;
        if (weekInRegularSeasonBlock > cumulativeWeeksInMap && weekInRegularSeasonBlock <= cumulativeWeeksInMap + weeksInThisMonthBlock) {
            const monthIndex = (Constants.SEASON_START_MONTH_INDEX + monthBlock.monthIdxOffset) % 12;
            const weekInMonth = weekInRegularSeasonBlock - cumulativeWeeksInMap;
            return `${Constants.MONTH_NAMES[monthIndex]} Week ${weekInMonth}`;
        }
        cumulativeWeeksInMap += weeksInThisMonthBlock;
    }
    if (weekNum > Constants.TOTAL_LEAGUE_WEEKS) {
        const offSeasonStartWeek = Constants.TOTAL_LEAGUE_WEEKS + 1;
        const offSeasonWeekNum = weekNum - offSeasonStartWeek + 1;
        if (offSeasonWeekNum <= 4) { return `${Constants.MONTH_NAMES[(Constants.SEASON_START_MONTH_INDEX + 10) % 12]} Week ${offSeasonWeekNum} (Off-Season)`; }
        else if (offSeasonWeekNum <= 8) { return `${Constants.MONTH_NAMES[(Constants.SEASON_START_MONTH_INDEX + 11) % 12]} Week ${offSeasonWeekNum - 4} (Off-Season)`; }
        else { return `Off-Season Week ${offSeasonWeekNum}`; }
    }
    return `Unknown Period Week ${weekNum}`;
}

/**
 * Applies the club's primary and secondary kit colors to CSS variables,
 * and calculates contrasting text colors for readability.
 * @param {string} primaryColor - The primary hex color (e.g., #RRGGBB).
 * @param {string} secondaryColor - The secondary hex color.
 */
function applyThemeColors(primaryColor, secondaryColor) {
    const root = document.documentElement;

    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);

    root.style.setProperty('--primary-text-on-bg', getContrastingTextColor(primaryColor));
    root.style.setProperty('--secondary-text-on-bg', getContrastingTextColor(secondaryColor));

    console.log(`DEBUG: Applied theme colors. Primary: ${primaryColor}, Secondary: ${secondaryColor}`);
}


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
    renderers.showLoadingScreen();
    const loadedState = localStorageManager.loadGame();
    if (loadedState) {
        console.log("DEBUG: Game loaded from localStorage.");
        gameState = loadedState;
        // Fix: Action directly updates UI and navigates home
        renderers.showModal('Game Loaded!', 'Continue your journey to glory.', [{ text: 'Continue', action: () => {
            renderers.hideModal();
            renderers.renderGameScreen('homeScreen'); // Go to home screen
            Main.updateUI(); // Update UI for loaded state
        }, isPrimary: true }]);
        if (gameState.playerClub) {
            playerData.setSquad(gameState.playerClub.squad || []);
            clubData.setCommittee(gameState.playerClub.committee || []);
            if (gameState.leagues && gameState.leagues.length > 0 && gameState.leagues[0].allClubsData) {
                 opponentData.setAllOpponentClubs(gameState.leagues[0].allClubsData);
                 const playerClubFromLeague = gameState.leagues[0].allClubsData.find(c => c.id === gameState.playerClub.id);
                 if (playerClubFromLeague) {
                     gameState.playerClub.leagueStats = { ...playerClubFromLeague.leagueStats };
                     gameState.playerClub.finalLeaguePosition = playerClubFromLeague.finalLeaguePosition;
                 }
            } else {
                 opponentData.setAllOpponentClubs([]);
            }
            applyThemeColors(gameState.playerClub.kitColors.primary, gameState.playerClub.kitColors.secondary);
        }
        renderers.hideLoadingScreen();
    } else {
        console.log("DEBUG: No save game found. Rendering new game modal.");
        renderers.hideLoadingScreen();
        renderers.renderNewGameModal();
        // Fix: Action directly updates UI and navigates home (or stays on modal)
        renderers.showModal('Welcome, Chairman!', 'Please set up your club and begin your Non-League Journey.', [{ text: 'Continue', action: () => {
            renderers.hideModal();
            // After welcome, stay on newGameModal for input, no screen change needed here
        }, isPrimary: true }]);
        gameState.gamePhase = Constants.GAME_PHASE.SETUP;
        applyThemeColors(Constants.KIT_COLORS[0], Constants.KIT_COLORS[1]);
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

    renderers.showLoadingScreen();

    // 1. Initialize Player's Club
    gameState.playerClub = clubData.createPlayerClub(playerClubDetails);
    gameState.playerClubCustomized = true;

    applyThemeColors(playerClubDetails.primaryColor, playerClubDetails.secondaryColor);

    // 2. Initialize Player Squad and attach to playerClub
    const initialSquad = playerData.initializePlayerSquad(gameState.playerClub.id);
    gameState.playerClub.squad = initialSquad;
    playerData.setSquad(initialSquad);

    // 3. Generate initial league structure and opponent clubs
    const { leagues, clubs } = leagueData.generateInitialLeagues(
        gameState.playerClub.location,
        gameState.playerClub.id,
        gameState.playerClub.name
    );
    gameState.leagues = leagues;
    opponentData.setAllOpponentClubs(clubs);


    // 4. Set Initial Game State & Phase
    gameState.currentSeason = 1;
    gameState.currentWeek = 1;
    gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
    gameState.clubHistory = [];
    gameState.messages = [{ week: 0, text: 'Welcome to your Non-League Journey!' }];
    gameState.gamePhase = Constants.GAME_PHASE.OPPONENT_CUSTOMIZATION;

    // Save initial game state before opponent customization
    saveGame(false);

    // Render opponent customization modal
    renderers.hideLoadingScreen();
    renderers.hideModal(); // Hide new game modal
    renderers.renderOpponentCustomizationModal(
        opponentData.getAllOpponentClubs(gameState.playerClub.id)
    );
    // Fix: Explicit action for showModal
    renderers.showModal('Your club is born!', 'Now, customize your league rivals before the season kicks off.', [{ text: 'Continue', action: () => {
        renderers.hideModal(); // Hide this modal
        renderers.renderGameScreen('homeScreen'); // Go to home screen
        Main.updateUI(); // Update UI for the home screen
    }, isPrimary: true }]);
    console.log("DEBUG: startNewGame() finished.");
}


/**
 * Applies customization changes to opponent clubs and transitions to pre-season.
 * This is called from eventHandlers.js after the player customizes opponents.
 * @param {Array<object>} customizedOpponents - Array of objects with id, name, nickname, kitColors for customized opponents.
 */
export function applyOpponentCustomization(customizedOpponents) {
    console.log("DEBUG: applyOpponentCustomization() called with:", customizedOpponents);

    renderers.showLoadingScreen();

    // Update the league's allClubsData with customized opponent details
    const currentLeague = gameState.leagues[0];
    if (currentLeague && currentLeague.allClubsData) {
        currentLeague.allClubsData.forEach(club => {
            const custom = customizedOpponents.find(c => c.id === club.id);
            if (custom) {
                Object.assign(club, {
                    name: custom.name,
                    nickname: custom.nickname,
                    kitColors: custom.kitColors
                });
            }
        });
        opponentData.setAllOpponentClubs(currentLeague.allClubsData);
    }

    gameState.opponentClubsCustomized = true;
    gameState.gamePhase = Constants.GAME_PHASE.PRE_SEASON_PLANNING;

    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);

    renderers.hideLoadingScreen();
    renderers.hideOpponentCustomizationModal();
    // Fix: Explicit action for showModal
    renderers.showModal('Rivals Customized!', 'Your league opponents are now set for the journey ahead. Welcome to pre-season!', [{ text: 'Continue', action: () => {
        renderers.hideModal();
        renderers.renderGameScreen('homeScreen'); // Go to home screen
        Main.updateUI(); // Update UI for the home screen
    }, isPrimary: true }]);
    saveGame(false);
    console.log("DEBUG: applyOpponentCustomization() finished.");
}

/**
 * Saves the current game state to Local Storage.
 * @param {boolean} showMessage - If true, displays a "Game Saved!" message. Default is true.
 */
export function saveGame(showMessage = true) {
    console.log("DEBUG: saveGame() called. showMessage:", showMessage);
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
        // Fix: Explicit action for showModal
        renderers.showModal('Game Loaded!', 'Continue your journey to glory.', [{ text: 'Continue', action: () => {
            renderers.hideModal();
            renderers.renderGameScreen('homeScreen'); // Go to home screen
            Main.updateUI(); // Update UI for loaded state
        }, isPrimary: true }]);
        console.log("DEBUG: Game loaded successfully:", gameState);

        if (gameState.playerClub) {
            playerData.setSquad(gameState.playerClub.squad || []);
            clubData.setCommittee(gameState.playerClub.committee || []);
            if (gameState.leagues && gameState.leagues.length > 0 && gameState.leagues[0].allClubsData) {
                 opponentData.setAllOpponentClubs(gameState.leagues[0].allClubsData);
                 const playerClubFromLeague = gameState.leagues[0].allClubsData.find(c => c.id === gameState.playerClub.id);
                 if (playerClubFromLeague) {
                     gameState.playerClub.leagueStats = { ...playerClubFromLeague.leagueStats };
                     gameState.playerClub.finalLeaguePosition = playerClubFromLeague.finalLeaguePosition;
                 }
            } else {
                 opponentData.setAllOpponentClubs([]);
            }
            applyThemeColors(gameState.playerClub.kitColors.primary, gameState.playerClub.kitColors.secondary);
        }

        renderers.hideLoadingScreen();
    } else {
        // Fix: Explicit action for showModal
        renderers.showModal('No Save Found!', 'Starting a new game instead.', [{ text: 'Continue', action: () => {
            renderers.hideModal();
            renderers.renderNewGameModal(); // Go to new game setup
            Main.updateUI(); // Update UI for the new game modal
        }, isPrimary: true }]);
        console.log("DEBUG: No game save found to load.");
        gameState = {
            playerClub: null, leagues: [], currentSeason: 1, currentWeek: 1,
            availableHours: 0, weeklyTasks: [], clubHistory: [], messages: [],
            gamePhase: Constants.GAME_PHASE.SETUP, playerClubCustomized: false, opponentClubsCustomized: false,
        };
        renderers.hideLoadingScreen();
    }
    console.log("DEBUG: initGame() finished.");
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
                applyThemeColors(Constants.KIT_COLORS[0], Constants.KIT_COLORS[1]);
            }, isPrimary: true },
            { text: 'No, Cancel', action: () => {
                renderers.hideModal();
                Main.updateUI(); // Update UI if cancelled to refresh current screen
            }}
        ]
    );
}

/**
 * Advances the game by one week. This is the core of the game loop.
 * It now triggers the start of the week's event chain.
 */
export function advanceWeek() {
    console.log("DEBUG: advanceWeek() called.");
    const currentAvailableHours = gameState.availableHours;
    const baseWeeklyHours = Constants.WEEKLY_BASE_HOURS;
    const allocatedHours = baseWeeklyHours - currentAvailableHours;

    const minimumAllocatedPercentage = 0.75;
    if (allocatedHours < baseWeeklyHours * minimumAllocatedPercentage && currentAvailableHours > 0) {
        // Fix: Explicit actions for showModal, including week advancement logic
        renderers.showModal('Allocate More Time!', 'You still have a lot of available hours. Consider completing more tasks before advancing the week!', [{ text: 'Advance Anyway', action: () => {
            renderers.hideModal(); // Hide this modal
            gameLoop.advanceWeek(Main.gameState); // Call gameLoop directly
        }, isPrimary: true },
        { text: 'Allocate More', action: () => {
            renderers.hideModal(); // Hide modal, stay on current week
            Main.updateUI(); // Update UI to refresh current screen
        }}
        ]);
        return; // Stop execution, await user choice
    }

    gameLoop.advanceWeek(Main.gameState); // If check passes or skipped, proceed to week logic


    // updateUI() will be called by gameLoop.finalizeWeekProcessing
    // saveGame(false) will be called by gameLoop.finalizeWeekProcessing
    // renderers.renderGameScreen('homeScreen') will be called by gameLoop.finalizeWeekProcessing
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

    // Convert week to month/week string
    const calendarWeekString = getCalendarWeekString(gameState.currentWeek);
    renderers.updateTopBarStats(
        gameState.currentSeason,
        calendarWeekString, // Pass the formatted string
        gameState.playerClub.finances.balance
    );
    renderers.updateClubNameDisplay(gameState.playerClub.name);

    renderers.updateWeeklyTasksDisplay(gameState.weeklyTasks, gameState.availableHours);


    const activeScreenElement = document.querySelector('.game-screen.active');
    if (activeScreenElement) {
        const screenId = activeScreenElement.id;
        console.log(`DEBUG: Rendering active screen: ${screenId}`);
        switch (screenId) {
            case 'homeScreen':
                renderers.renderHomeScreen(gameState);
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
