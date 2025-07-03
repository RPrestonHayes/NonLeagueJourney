// js/main.js

console.log("DEBUG: main.js started execution.");

// --- Module Imports ---
// IMPORTANT: Place all imports at the very top for consistent loading
import * as localStorageManager from './utils/localStorageManager.js';
import * as dataGenerator from './utils/dataGenerator.js';
import * as renderers from './ui/renderers.js';
import * as eventHandlers from './ui/eventHandlers.js';
import * as clubData from './data/clubData.js';
import * as playerData from './data/playerData.js';
import * as opponentData from './data/opponentData.js';
import * as leagueData from './data/leagueData.js';
import * as gameLoop from './logic/gameLoop.js';
import * as Constants from './utils/constants.js';
import { getContrastingTextColor } from './utils/coloursUtils.js';
import { UK_COUNTIES_DATA } from './data/CountiesData.js'; // MOVED: Ensure this is imported early


console.log("DEBUG: All modules attempted import.");


// --- Global Game State Object ---
export let gameState = {
    playerClub: null,
    leagues: [], // Will now hold multiple league objects
    countyCup: {
        competitionId: null,
        teams: [], // All teams participating in the cup (will grow as new teams are drawn)
        fixtures: [], // Cup matches generated
        currentRound: 0, // 0 = not started, 1-8 for rounds
        playerTeamStatus: 'Not Entered', // 'Entered', 'Active', 'Eliminated', 'Winner'
        opponentToCustomize: null // Stores info for the specific cup opponent to customize
    },
    currentSeason: 1,
    currentWeek: 1,
    availableHours: 0,
    weeklyTasks: [],
    clubHistory: [],
    messages: [],
    gamePhase: Constants.GAME_PHASE.SETUP,
    playerClubCustomized: false,
    opponentClubsCustomized: false, // This flag will now just indicate initial club pool is set
    playerCountyData: null, 
    isProcessingWeek: false, // Flag to prevent re-entry into week processing
};

console.log("DEBUG: gameState object initialized.");


// --- Helper for Calendar Conversion ---
export function getCalendarWeekString(weekNum) { // Exported for renderers.js
    if (weekNum <= 0) { return "Invalid Week"; }

    let cumulativeWeeks = 0;
    for (let i = 0; i < Constants.GAME_WEEK_TO_MONTH_MAP.length; i++) {
        const monthBlock = Constants.GAME_WEEK_TO_MONTH_MAP[i];
        const monthStartWeekAbsolute = monthBlock.startWeek; // Use the absolute startWeek from constants
        const monthEndWeekAbsolute = monthBlock.startWeek + monthBlock.weeks - 1;

        if (weekNum >= monthStartWeekAbsolute && weekNum <= monthEndWeekAbsolute) {
            const weekInMonthBlock = weekNum - monthStartWeekAbsolute + 1; // Corrected calculation for week within month
            const currentMonthName = Constants.MONTH_NAMES[(Constants.SEASON_START_MONTH_INDEX + monthBlock.monthIdxOffset) % 12];
            let weekString = `${currentMonthName} (Week ${weekInMonthBlock})`;

            if (monthBlock.isPreSeason) {
                weekString += ' - Pre-Season';
            } else if (monthBlock.isSpecialMonth && currentMonthName === 'December') {
                 weekString += ' - Special Conditions (Winter)';
            }
            // IMPORTANT: Do NOT add cup announcement/match text to the main header string here.
            // This text is only for the modal dialogs.

            return weekString;
        }
    }
    
    // Handle Off-season beyond defined league weeks
    if (weekNum > Constants.TOTAL_LEAGUE_WEEKS) {
        return `Off-Season Week ${weekNum - Constants.TOTAL_LEAGUE_WEEKS}`;
    }

    return `Unknown Period Week ${weekNum}`;
}

/**
 * Applies the club's primary and secondary kit colors to CSS variables,
 * and calculates contrasting text colors for readability.
 * @param {string} primaryColor - The primary hex color (e.g., #RRGGBB).
 * @param {string} secondaryColor - The secondary hex color.
 */
export function applyThemeColors(primaryColor, secondaryColor) { // Exported for committeeLogic
    const root = document.documentElement;

    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);

    root.style.setProperty('--primary-text-on-bg', getContrastingTextColor(primaryColor));
    root.style.setProperty('--secondary-text-on-bg', getContrastingTextColor(secondaryColor));

    console.log(`DEBUG: Applied theme colors. Primary: ${primaryColor}, Secondary: ${secondaryColor}`);
}


// --- Core Game Functions ---
// Export Main's update functions for other modules to call back.
// gameLoop.js will call these when finalizing a week.
export function updateUI() { // Renamed from updateGameAndUI for clarity
    console.log("DEBUG: updateUI called.");
    if (!gameState.playerClub) {
        console.warn("DEBUG: playerClub not yet initialized, skipping some UI updates in updateUI.");
        return;
    }

    // Convert week to month/week string
    const calendarWeekString = getCalendarWeekString(gameState.currentWeek);
    renderers.updateTopBarStats(
        gameState.currentSeason,
        calendarWeekString,
        gameState.playerClub.finances.balance
    );
    renderers.updateClubNameDisplay(gameState.playerClub.name);

    renderers.updateWeeklyTasksDisplay(gameState.weeklyTasks, gameState.availableHours);

    const activeScreenElement = document.querySelector('.game-screen.active');
    if (activeScreenElement) {
        const screenId = activeScreenElement.id;
        console.log(`DEBUG: Rendering active screen from updateUI: ${screenId}`);
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
                // Find the league the player's club is currently in
                const playerCurrentLeague = gameState.leagues.find(l => l.id === gameState.playerClub.currentLeagueId);
                const allClubsInPlayerLeague = playerCurrentLeague ? playerCurrentLeague.allClubsData : [];
                renderers.renderLeagueScreen(
                    playerCurrentLeague?.name, // Pass the league name here
                    leagueData.getLeagueTable(playerCurrentLeague?.id, allClubsInPlayerLeague)
                );
                break;
            case 'fixturesScreen':
                // Combine league and cup fixtures, then sort by week
                // Get fixtures for all leagues, flatten, and combine with cup fixtures
                const allLeagueFixtures = [];
                gameState.leagues.forEach(league => {
                    allLeagueFixtures.push(...leagueData.getFixtures(gameState.leagues, league.id));
                });

                const allFixtures = [
                    ...allLeagueFixtures,
                    ...gameState.countyCup.fixtures
                ].sort((a, b) => a.week - b.week); // Sort chronologically by week

                renderers.renderFixturesScreen(allFixtures);
                break;
            case 'committeeScreen':
                renderers.renderCommitteeScreen(clubData.getCommittee());
                break;
            case 'historyScreen':
                renderers.renderHistoryScreen(gameState.clubHistory);
                break;
            case 'editScreen': // NEW: Handle edit screen rendering
                renderers.renderEditScreen(gameState);
                break;
            default:
                console.warn(`DEBUG: No specific renderer case for screen in updateUI: ${screenId}`);
                break;
        }
    } else {
        console.warn("DEBUG: No active screen element found during updateUI, rendering homeScreen.");
        renderers.renderGameScreen('homeScreen'); // Fallback to home if no active screen
    }

    if (gameState.messages.length > 0) {
        renderers.updateNewsFeed(gameState.messages[gameState.messages.length - 1].text);
    }

    // Scroll to the top of the main game content area to ensure visibility of updates
    const gameContentElement = document.getElementById('gameContent');
    if (gameContentElement) {
        gameContentElement.scrollTop = 0;
    }
    window.scrollTo(0, 0); // Also scroll the entire window to top

    console.log("DEBUG: updateUI() finished.");
}

export function saveGame(showMessage = true) { // Exported for gameLoop to call
    console.log("DEBUG: saveGame() called. showMessage:", showMessage);
    try {
        localStorageManager.saveGame(gameState);
        if (showMessage) {
            renderers.displayMessage('Game Saved!', 'Your progress has been secured.');
        }
        console.log("DEBUG: Game saved successfully.");
    }
    catch (error) {
        console.error("DEBUG: Failed to save game:", error);
        if (showMessage) {
            renderers.displayMessage('Save Failed!', 'Could not save game. Check browser storage space.');
        }
    }
}

// NEW: Internal helper function to break direct circular dependency for processRemainingWeekEvents
function _triggerProcessRemainingWeekEvents(gs, dismissalContext) {
    // This function will be called by modal actions
    // It safely calls gameLoop.processRemainingWeekEvents
    gameLoop.processRemainingWeekEvents(gs, dismissalContext, getUpdateUICallbacks()); // Pass updateUICallbacks explicitly
}

/**
 * Provides an object of functions for renderers.js to call back to Main/gameLoop.
 * This prevents circular dependencies and provides a clear API for UI interactions.
 */
export function getUpdateUICallbacks() {
    return {
        updateUI: updateUI,
        saveGame: saveGame,
        finalizeWeekProcessing: (gs, context) => gameLoop.finalizeWeekProcessing(gs, context, getUpdateUICallbacks()), // Pass uic
        processRemainingWeekEvents: _triggerProcessRemainingWeekEvents, // <--- CHANGED THIS LINE
        renderHomeScreen: () => renderers.renderGameScreen('homeScreen') // Example, if needed
    };
}


/**
 * Initializes the game when the page loads.
 * Attempts to load a saved game; otherwise, starts the new game setup process.
 */
function initGame() {
    console.log("DEBUG: initGame() called."); // Added log to confirm entry

    try { // Wrap the entire initGame logic in a try-catch
        // Set up global UI event listeners first
        console.log("DEBUG: Calling eventHandlers.initGlobalListeners()...");
        eventHandlers.initGlobalListeners();
        console.log("DEBUG: eventHandlers.initGlobalListeners() returned.");

        console.log("DEBUG: Attempting to load game...");
        renderers.showLoadingScreen();
        
        let loadedState = null;
        try {
            loadedState = localStorageManager.loadGame();
        } catch (e) {
            console.error("ERROR: Failed to load game from local storage during init:", e);
            // Do not alert here, let the flow continue to new game setup
        }

        const updateUICallbacks = getUpdateUICallbacks(); // Get callbacks here

        if (loadedState) {
            gameState = loadedState;
            // FIX: Action directly updates UI and navigates home
            renderers.showModal('Game Loaded!', 'Continue your journey to glory.', [{ text: 'Continue', action: (gs, uic, context) => { // Pass gs, uic, context
                renderers.hideModal(); // Hide modal
                renderers.renderGameScreen('homeScreen'); // Go to home screen
                uic.updateUI(); // Update UI for loaded state
            }, isPrimary: true }], gameState, updateUICallbacks, 'game_loaded'); // Pass gameState and callbacks
            if (gameState.playerClub) {
                playerData.setSquad(gameState.playerClub.squad || []);
                clubData.setCommittee(gameState.playerClub.committee || []);
                // Ensure playerCountyData is loaded if available
                if (loadedState.playerCountyData) {
                    gameState.playerCountyData = loadedState.playerCountyData;
                } else {
                    // Fallback for old saves or if not set, try to derive from playerClub.location if it's a known town
                    // Or set a default
                    console.warn("playerCountyData not found in loaded state. Attempting to derive or set default.");
                    // Ensure UK_COUNTIES_DATA is imported for this fallback
                    gameState.playerCountyData = dataGenerator.getCountyDataFromPostcode(gameState.playerClub.groundPostcode || 'LE12 7TF') || UK_COUNTIES_DATA[0];
                }

                // --- CRITICAL FIX START: Ensure allClubsInGameWorld is comprehensively populated on load ---
                let allClubsFromLoad = [];
                // Add player club first
                if (gameState.playerClub) {
                    allClubsFromLoad.push(gameState.playerClub);
                }
                // Add all clubs from all leagues
                if (gameState.leagues && gameState.leagues.length > 0) {
                    gameState.leagues.forEach(league => {
                        if (league.allClubsData) {
                            league.allClubsData.forEach(club => {
                                if (!allClubsFromLoad.some(c => c.id === club.id)) {
                                    allClubsFromLoad.push(club);
                                }
                            });
                        }
                    });
                }

                // Add any cup-specific teams from the loaded state that are not already in the league/player data
                if (gameState.countyCup && gameState.countyCup.teams) {
                    gameState.countyCup.teams.forEach(cupTeam => {
                        if (!allClubsFromLoad.some(c => c.id === cupTeam.id)) {
                            allClubsFromLoad.push(cupTeam);
                        }
                    });
                }
                
                // Set the comprehensive list of all clubs in the game world for opponentData module
                opponentData.setAllOpponentClubs(allClubsFromLoad);

                // Now, safely update playerClub's league stats from the comprehensive list
                const playerClubFromAllClubs = allClubsFromLoad.find(c => c.id === gameState.playerClub.id);
                if (playerClubFromAllClubs) {
                    gameState.playerClub.leagueStats = { ...playerClubFromAllClubs.leagueStats };
                    gameState.playerClub.finalLeaguePosition = playerClubFromAllClubs.finalLeaguePosition;
                    gameState.playerClub.currentLeagueId = playerClubFromAllClubs.currentLeagueId; // Ensure currentLeagueId is loaded
                }
                // --- CRITICAL FIX END ---

                applyThemeColors(gameState.playerClub.kitColors.primary, gameState.playerClub.kitColors.secondary);
            }

            renderers.hideLoadingScreen();
        } else {
            console.log("DEBUG: No save game found. Rendering new game modal.");
            renderers.hideLoadingScreen();
            renderers.renderNewGameModal();
            // FIX: Action directly updates UI and navigates home (or stays on modal)
            renderers.showModal('Welcome, Chairman!', 'Please set up your club and begin your Non-League Journey.', [{ text: 'Continue', action: (gs, uic, context) => { // Pass gs, uic, context
                renderers.hideModal(); // Hide this modal
                // No screen change here, newGameModal is already displayed
            }, isPrimary: true }], gameState, updateUICallbacks, 'welcome_new_game'); // Pass gameState and callbacks
            gameState.gamePhase = Constants.GAME_PHASE.SETUP;
            applyThemeColors(Constants.KIT_COLORS[0], Constants.KIT_COLORS[1]);
        }
        console.log("DEBUG: initGame() finished.");
    } catch (error) {
        console.error("CRITICAL ERROR: initGame() failed:", error);
        // Display a fallback message if initGame completely fails
        renderers.showModal('Game Initialization Error', 'An unexpected error occurred during game setup. Please refresh the page. Check console for details.', [{ text: 'OK', action: () => {} }]);
    }
}

/**
 * Starts a brand new game, resetting all game state and populating initial data.
 * This is called from eventHandlers.js after the player provides initial club details.
 * @param {object} playerClubDetails - Object containing hometown, groundPostcode, countyData, clubName, nickname, primaryColor, secondaryColor.
 */
export function startNewGame(playerClubDetails) {
    console.log("DEBUG: startNewGame() called with details:", playerClubDetails);

    renderers.showLoadingScreen();
    const updateUICallbacks = getUpdateUICallbacks(); // Get callbacks here

    // Store the determined county data in gameState
    gameState.playerCountyData = playerClubDetails.countyData;
    // Fallback if no county data was found (e.g., invalid postcode)
    if (!gameState.playerCountyData) {
        console.warn("No county data found for provided postcode. Falling back to default Leicestershire data for opponent generation.");
        // Use a default county data if none found
        gameState.playerCountyData = dataGenerator.getCountyDataFromPostcode('LE12 7TF') || UK_COUNTIES_DATA[0]; 
    }


    // 1. Initialize Player's Club (template for the full pool)
    const playerClubTemplate = {
        id: dataGenerator.generateUniqueId('PC'), // Generate ID here
        hometown: playerClubDetails.hometown,
        groundPostcode: playerClubDetails.groundPostcode,
        county: gameState.playerCountyData.county,
        clubName: playerClubDetails.clubName,
        nickname: playerClubDetails.nickname,
        primaryColor: playerClubDetails.primaryColor,
        secondaryColor: playerClubDetails.secondaryColor
    };

    // 2. Generate the entire regional club pool (60 clubs, including player's)
    const allRegionalClubs = dataGenerator.generateRegionalClubPool(gameState.playerCountyData, playerClubTemplate);

    // Find the player's actual club object from the generated pool (it now has overallTeamQuality, initialSeedQuality etc.)
    gameState.playerClub = allRegionalClubs.find(club => club.id === playerClubTemplate.id);
    // Initialize facilities, committee, and squad for the player's club
    gameState.playerClub.facilities = clubData.createInitialFacilities(); // New function in clubData
    gameState.playerClub.committee = clubData.createInitialCommittee(); // New function in clubData
    const initialSquad = playerData.initializePlayerSquad(gameState.playerClub.id);
    gameState.playerClub.squad = initialSquad;
    playerData.setSquad(initialSquad); // Set internal squad for playerData module
    gameState.playerClub.finances = { balance: Constants.DEFAULT_STARTING_BALANCE, transactions: [] }; // Initial finances
    gameState.playerClub.reputation = 10;
    gameState.playerClub.fanbase = 0;
    gameState.playerClub.customizationHistory = { nameChanges: 0, colorChanges: 0 };
    gameState.playerClub.leagueStats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 };
    gameState.playerClub.finalLeaguePosition = null;

    applyThemeColors(playerClubDetails.primaryColor, playerClubDetails.secondaryColor);

    // 3. Generate tiered league structure and distribute clubs
    const { leagues, clubs: updatedAllRegionalClubs } = leagueData.generateInitialLeagues(
        gameState.playerCountyData,
        allRegionalClubs // Pass the entire generated pool
    );
    gameState.leagues = leagues;
    // Update opponentData's internal list with the clubs that now have league assignments
    opponentData.setAllOpponentClubs(updatedAllRegionalClubs);

    // Update playerClub in gameState with its assigned league ID
    const playerClubInLeagues = updatedAllRegionalClubs.find(c => c.id === gameState.playerClub.id);
    if (playerClubInLeagues) {
        gameState.playerClub.currentLeagueId = playerClubInLeagues.currentLeagueId;
        gameState.playerClub.potentialLeagueLevel = playerClubInLeagues.potentialLeagueLevel;
    }


    // 4. Initialize county cup for the first season
    gameState.countyCup.competitionId = dataGenerator.generateUniqueId('CUP');
    // Start with all regional clubs in the cup pool
    gameState.countyCup.teams = [...updatedAllRegionalClubs];
    gameState.countyCup.fixtures = [];
    gameState.countyCup.currentRound = 0;
    gameState.countyCup.playerTeamStatus = 'Active';
    gameState.countyCup.opponentToCustomize = null;

    gameState.currentSeason = 1;
    gameState.currentWeek = 1;
    gameState.availableHours = Constants.WEEKLY_BASE_HOURS;
    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);
    gameState.clubHistory = [];
    gameState.messages = [{ week: 0, text: 'Welcome to your Non-League Journey!' }];
    gameState.gamePhase = Constants.GAME_PHASE.PRE_SEASON_PLANNING; // Directly to pre-season

    // Save initial game state
    saveGame(false);

    renderers.hideLoadingScreen();
    renderers.hideModal(); // Hide new game modal
    // No opponent customization modal for league rivals now.
    
    // Show a welcoming modal and transition to home screen
    renderers.showModal('Your Journey Begins!', `Welcome to Season ${gameState.currentSeason}! Your club, ${gameState.playerClub.name}, is ready to start in the ${gameState.leagues.find(l => l.id === gameState.playerClub.currentLeagueId)?.name || 'local league'}.`, [{ text: 'Continue', action: (gs, uic, context) => {
        renderers.hideModal();
        renderers.renderGameScreen('homeScreen');
        uic.updateUI();
    }, isPrimary: true }], gameState, updateUICallbacks, 'new_game_start_welcome');
    console.log("DEBUG: startNewGame() finished.");
}


/**
 * Applies customization changes to opponent clubs and transitions to pre-season.
 * This is called from eventHandlers.js after the player provides initial club details.
 * @param {Array<object>} customizedOpponents - Array of objects with id, name, nickname, kitColors for customized opponents.
 */
export function applyOpponentCustomization(customizedOpponents) {
    console.log("DEBUG: applyOpponentCustomization() called with:", customizedOpponents);

    renderers.showLoadingScreen();
    const updateUICallbacks = getUpdateUICallbacks(); // Get callbacks here

    // Update the allClubsInGameWorld with customized opponent details
    const allClubs = opponentData.getAllOpponentClubs(null); // Get the mutable array
    customizedOpponents.forEach(custom => {
        const clubToUpdate = allClubs.find(c => c.id === custom.id);
        if (clubToUpdate) {
            Object.assign(clubToUpdate, {
                name: custom.name,
                nickname: custom.nickname,
                kitColors: custom.kitColors
            });
        }
    });
    opponentData.setAllOpponentClubs(allClubs); // Re-set the updated array

    // Also update the specific league and cup data if these clubs are in them
    gameState.leagues.forEach(league => {
        league.allClubsData.forEach(club => {
            const custom = customizedOpponents.find(c => c.id === club.id);
            if (custom) Object.assign(club, { name: custom.name, nickname: custom.nickname, kitColors: custom.kitColors });
        });
    });
    gameState.countyCup.teams.forEach(cupTeam => {
        const custom = customizedOpponents.find(c => c.id === cupTeam.id);
        if (custom) Object.assign(cupTeam, { name: custom.name, nickname: custom.nickname, kitColors: custom.kitColors });
    });


    // This flag is now less about "customized" and more about "initial setup complete"
    gameState.opponentClubsCustomized = true;
    // The game phase should already be PRE_SEASON_PLANNING or WEEKLY_PLANNING if this is a cup customization

    gameState.weeklyTasks = dataGenerator.generateWeeklyTasks(gameState.playerClub.facilities, gameState.playerClub.committee);

    renderers.hideLoadingScreen();
    renderers.hideOpponentCustomizationModal();
    // The next modal in the chain (from gameLoop.js handleCountyCupAnnouncement) will handle the final message and week advance.
    // So, this function doesn't need to show a modal or change phase directly anymore.
    // The modal that called this (from handleCountyCupAnnouncement) will have its callback fired.
    console.log("DEBUG: applyOpponentCustomization() finished. Control will return to the calling modal's action.");
}

/**
 * Loads the game state from Local Storage.
 * This function should ideally be called once during initGame.
 */
export function loadGame() {
    console.log("DEBUG: Attempting to load game...");
    renderers.showLoadingScreen();
    const loadedState = localStorageManager.loadGame();
    const updateUICallbacks = getUpdateUICallbacks(); // Get callbacks here

    if (loadedState) {
        gameState = loadedState;
        // FIX: Action directly updates UI and navigates home
        renderers.showModal('Game Loaded!', 'Continue your journey to glory.', [{ text: 'Continue', action: (gs, uic, context) => { // Pass gs, uic, context
            renderers.hideModal();
            renderers.renderGameScreen('homeScreen'); // Go to home screen
            uic.updateUI(); // Update UI for loaded state
        }, isPrimary: true }], gameState, updateUICallbacks, 'game_loaded_confirm');
        console.log("DEBUG: Game loaded successfully:", gameState);

        if (gameState.playerClub) {
            playerData.setSquad(gameState.playerClub.squad || []);
            clubData.setCommittee(gameState.playerClub.committee || []);
            // Ensure playerCountyData is loaded if available
            if (loadedState.playerCountyData) {
                gameState.playerCountyData = loadedState.playerCountyData;
            } else {
                // Fallback for old saves or if not set, try to derive from playerClub.location if it's a known town
                // Or set a default
                console.warn("playerCountyData not found in loaded state. Attempting to derive or set default.");
                gameState.playerCountyData = dataGenerator.getCountyDataFromPostcode(gameState.playerClub.groundPostcode || 'LE12 7TF') || UK_COUNTIES_DATA[0];
            }

            // --- CRITICAL FIX START: Ensure allClubsInGameWorld is comprehensively populated on load ---
            let allClubsFromLoad = [];
            // Add player club first
            if (gameState.playerClub) {
                allClubsFromLoad.push(gameState.playerClub);
            }
            // Add all clubs from all leagues
            if (gameState.leagues && gameState.leagues.length > 0) {
                gameState.leagues.forEach(league => {
                    if (league.allClubsData) {
                        league.allClubsData.forEach(club => {
                            if (!allClubsFromLoad.some(c => c.id === club.id)) {
                                allClubsFromLoad.push(club);
                            }
                        });
                    }
                });
            }

            // Add any cup-specific teams from the loaded state that are not already in the league/player data
            if (gameState.countyCup && gameState.countyCup.teams) {
                gameState.countyCup.teams.forEach(cupTeam => {
                    if (!allClubsFromLoad.some(c => c.id === cupTeam.id)) {
                        allClubsFromLoad.push(cupTeam);
                    }
                });
            }
            
            // Set the comprehensive list of all clubs in the game world for opponentData module
            opponentData.setAllOpponentClubs(allClubsFromLoad);

            // Now, safely update playerClub's league stats from the comprehensive list
            const playerClubFromAllClubs = allClubsFromLoad.find(c => c.id === gameState.playerClub.id);
            if (playerClubFromAllClubs) {
                gameState.playerClub.leagueStats = { ...playerClubFromAllClubs.leagueStats };
                gameState.playerClub.finalLeaguePosition = playerClubFromAllClubs.finalLeaguePosition;
                gameState.playerClub.currentLeagueId = playerClubFromAllClubs.currentLeagueId; // Ensure currentLeagueId is loaded
            }
            // --- CRITICAL FIX END ---

            applyThemeColors(gameState.playerClub.kitColors.primary, gameState.playerClub.kitColors.secondary);
        }

        renderers.hideLoadingScreen();
    } else {
        console.log("DEBUG: No save game found. Rendering new game modal.");
        renderers.hideLoadingScreen();
        renderers.renderNewGameModal();
        // FIX: Action directly updates UI and navigates home (or stays on modal)
        renderers.showModal('Welcome, Chairman!', 'Please set up your club and begin your Non-League Journey.', [{ text: 'Continue', action: (gs, uic, context) => { // Pass gs, uic, context
                renderers.hideModal(); // Hide this modal
                // No screen change here, newGameModal is already displayed
            }, isPrimary: true }], gameState, updateUICallbacks, 'welcome_new_game'); // Pass gameState and callbacks
        gameState.gamePhase = Constants.GAME_PHASE.SETUP;
        applyThemeColors(Constants.KIT_COLORS[0], Constants.KIT_COLORS[1]);
    }
    console.log("DEBUG: initGame() finished.");
}

/**
 * Resets the game to its initial state, effectively starting over.
 * Prompts user for confirmation.
 */
export function newGameConfirm() {
    console.log("DEBUG: newGameConfirm() called.");
    const updateUICallbacks = getUpdateUICallbacks(); // Get callbacks here

    renderers.showModal(
        'Start New Game?',
        'Are you sure you want to start a new game? All unsaved progress will be lost.',
        [
            { text: 'Yes, Start New', action: (gs, uic, context) => { // Pass gs, uic, context
                localStorageManager.clearSave();
                renderers.hideModal();
                gameState = {
                    playerClub: null, leagues: [], currentSeason: 1, currentWeek: 1,
                    availableHours: 0, weeklyTasks: [], clubHistory: [], messages: [],
                    gamePhase: Constants.GAME_PHASE.SETUP, playerClubCustomized: false, opponentClubsCustomized: false,
                    playerCountyData: null, // Reset county data
                    countyCup: { // Reset county cup state
                        competitionId: null,
                        teams: [],
                        fixtures: [],
                        currentRound: 0,
                        playerTeamStatus: 'Not Entered',
                        opponentToCustomize: null
                    },
                    isProcessingWeek: false, // Reset flag on new game
                };
                renderers.renderNewGameModal();
                applyThemeColors(Constants.KIT_COLORS[0], Constants.KIT_COLORS[1]);
            }, isPrimary: true },
            { text: 'No, Cancel', action: (gs, uic, context) => { // Pass gs, uic, context
                renderers.hideModal();
                uic.updateUI(); // Update UI if cancelled to refresh current screen
            }}
        ],
        gameState, updateUICallbacks, 'new_game_confirm' // Pass gameState and callbacks
    );
}

/**
 * Advances the game by one week. This is the core of the game loop.
 * It now triggers the start of the week's event chain.
 */
export function advanceWeek() {
    console.log("DEBUG: advanceWeek() called.");
    // NEW: Prevent re-entry if already processing
    if (gameState.isProcessingWeek) {
        console.warn("DEBUG: Already processing week. Ignoring duplicate advanceWeek call.");
        return;
    }

    const currentAvailableHours = gameState.availableHours;
    const baseWeeklyHours = Constants.WEEKLY_BASE_HOURS;
    const allocatedHours = baseWeeklyHours - currentAvailableHours;
    const updateUICallbacks = getUpdateUICallbacks(); // Get callbacks here


    const minimumAllocatedPercentage = 0.75;
    if (allocatedHours < baseWeeklyHours * minimumAllocatedPercentage && currentAvailableHours > 0) {
        // Fix: Explicit actions for showModal, including week advancement logic
        renderers.showModal('Allocate More Time!', 'You still have a lot of available hours. Consider completing more tasks before advancing the week!', [{ text: 'Advance Anyway', action: (gs, uic, context) => { // Pass gs, uic, context
            renderers.hideModal(); // Hide this modal
            gameLoop.advanceWeek(gs, 0, uic); // Pass uic
        }, isPrimary: true },
        { text: 'Allocate More', action: (gs, uic, context) => { // Pass gs, uic, context
            renderers.hideModal(); // Hide modal, stay on current week
            uic.updateUI(); // Update UI to refresh current screen
        }}
        ], gameState, updateUICallbacks, 'allocate_more_time'); // Pass gameState and callbacks
        return; // Stop execution, await user choice
    }

    gameLoop.advanceWeek(gameState, 0, updateUICallbacks); // If check passes or skipped, proceed to week logic, pass uic
}

initGame()