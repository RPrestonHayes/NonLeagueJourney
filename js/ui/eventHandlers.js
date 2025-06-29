// js/ui/eventHandlers.js

/**
 * Handles all user interface events and dispatches them to relevant game logic.
 */

// --- Module Imports ---
// Import main game functions and gameState
import * as Main from '../main.js';
// Import rendering functions to interact with UI
import * as renderers from './renderers.js';

// --- Cached DOM Elements ---
const navButtons = document.querySelectorAll('.nav-btn');
const advanceWeekBtn = document.getElementById('advanceWeekBtn');
const saveGameBtn = document.getElementById('saveGameBtn');
const loadGameBtn = document.getElementById('loadGameBtn');
const newGameBtn = document.getElementById('newGameBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// New Game Modal elements
const newGameModal = document.getElementById('newGameModal');
const hometownInput = document.getElementById('hometownInput');
const clubNameInput = document.getElementById('clubNameInput');
const clubNicknameInput = document.getElementById('clubNicknameInput');
const primaryColorInput = document.getElementById('primaryColorInput');
const secondaryColorInput = document.getElementById('secondaryColorInput');
const createGameBtn = document.getElementById('createGameBtn');

// Opponent Customization Modal elements
const opponentCustomizationModal = document.getElementById('opponentCustomizationModal');
const opponentListCustomization = document.getElementById('opponentListCustomization');
const saveOpponentCustomizationBtn = document.getElementById('saveOpponentCustomizationBtn');

// Weekly Tasks
const weeklyTasksList = document.getElementById('weeklyTasksList');


// --- Initialization Function ---
/**
 * Initializes all global and modal-specific event listeners.
 * This should be called once when the game loads (from main.js).
 */
export function initGlobalListeners() {
    console.log("Initializing global event listeners...");

    // --- Navigation Buttons ---
    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const screenId = event.target.dataset.screen + 'Screen'; // Append 'Screen' to match div IDs
            renderers.renderGameScreen(screenId);
            Main.updateUI(); // Ensure UI updates for the new screen
        });
    });

    // --- Core Game Buttons ---
    if (advanceWeekBtn) {
        advanceWeekBtn.addEventListener('click', Main.advanceWeek);
    }
    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', Main.saveGame);
    }
    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', Main.loadGame);
    }
    if (newGameBtn) {
        newGameBtn.addEventListener('click', Main.newGameConfirm);
    }
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', renderers.hideModal);
    }

    // --- New Game Setup Modal Event Listeners ---
    if (createGameBtn) {
        createGameBtn.addEventListener('click', handleCreateGame);
    }

    // --- Opponent Customization Modal Event Listeners ---
    if (saveOpponentCustomizationBtn) {
        saveOpponentCustomizationBtn.addEventListener('click', handleSaveOpponentCustomization);
    }

    // --- Weekly Tasks Input Listener (using event delegation) ---
    // Listen on the parent element (weeklyTasksList) for changes on its children inputs
    if (weeklyTasksList) {
        weeklyTasksList.addEventListener('input', (event) => {
            if (event.target.classList.contains('task-hours-input')) {
                handleTaskHoursInput(event.target);
            }
        });
    }

    // Initial check for game state to potentially open correct modal/screen
    // This part is handled by main.js's initGame, but listeners must be ready.
}

// --- Specific Event Handlers ---

/**
 * Handles the "Create Club" button click in the New Game Setup modal.
 * Validates input and calls main.startNewGame.
 */
function handleCreateGame() {
    const hometown = hometownInput.value.trim();
    const clubName = clubNameInput.value.trim();
    const clubNickname = clubNicknameInput.value.trim();
    const primaryColor = primaryColorInput.value;
    const secondaryColor = secondaryColorInput.value;

    if (!hometown || !clubName || !clubNickname) {
        renderers.showModal('Input Error', 'Please fill in all club details: Hometown, Club Name, and Nickname.');
        return;
    }

    if (primaryColor === secondaryColor) {
        renderers.showModal('Kit Color Error', 'Primary and Secondary kit colors cannot be the same. Please choose different colors.');
        return;
    }

    const playerClubDetails = {
        hometown: hometown,
        clubName: clubName,
        nickname: clubNickname,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor
    };

    console.log("Player club details captured:", playerClubDetails);
    renderers.renderGameScreen('loadingScreen'); // Optional: show loading screen
    Main.startNewGame(playerClubDetails); // Calls the main game initialization logic
    renderers.hideModal(newGameModal.id); // Hide the new game modal (now handled by Main.startNewGame)
}

/**
 * Handles the "Save Opponent Customization" button click.
 * Collects data from the dynamically generated opponent forms.
 */
function handleSaveOpponentCustomization() {
    const customizedOpponents = [];
    const opponentItems = opponentListCustomization.querySelectorAll('.opponent-custom-item');

    opponentItems.forEach(item => {
        const clubId = item.querySelector('input[id^="opponentName_"]').id.replace('opponentName_', '');
        const nameInput = item.querySelector(`#opponentName_${clubId}`);
        const nicknameInput = item.querySelector(`#opponentNickname_${clubId}`);
        const primaryColorInput = item.querySelector(`#opponentPrimaryColor_${clubId}`);
        const secondaryColorInput = item.querySelector(`#opponentSecondaryColor_${clubId}`);

        const newName = nameInput.value.trim();
        const newNickname = nicknameInput.value.trim();
        const newPrimaryColor = primaryColorInput.value;
        const newSecondaryColor = secondaryColorInput.value;

        if (!newName || !newNickname) {
            renderers.showModal('Input Error', `Please fill in name and nickname for ${nameInput.placeholder || 'an opponent club'}.`);
            return; // Stop processing and show error
        }
        if (newPrimaryColor === newSecondaryColor) {
             renderers.showModal('Kit Color Error', `Primary and Secondary kit colors for ${newName} cannot be the same.`);
             return;
        }

        customizedOpponents.push({
            id: clubId,
            name: newName,
            nickname: newNickname,
            kitColors: {
                primary: newPrimaryColor,
                secondary: newSecondaryColor
            }
        });
    });

    if (customizedOpponents.length === opponentItems.length) {
        // If all inputs are valid, process the customization
        console.log("Opponents customized:", customizedOpponents);
        // Update game state with customized opponent data
        Main.gameState.leagues.forEach(league => {
            league.clubs.forEach(club => {
                const custom = customizedOpponents.find(c => c.id === club.id);
                if (custom) {
                    club.name = custom.name;
                    club.nickname = custom.nickname;
                    club.kitColors = custom.kitColors;
                }
            });
        });
        Main.gameState.opponentClubsCustomized = true; // Mark as done

        renderers.hideOpponentCustomizationModal();
        renderers.displayMessage('Rivals Customized!', 'Your league opponents are now set for the journey ahead.');
        renderers.renderGameScreen('homeScreen'); // Go to home screen after customization
        Main.updateUI(); // Update UI with new club names
        Main.saveGame(); // Save after customization
    }
}

/**
 * Handles input changes for task hours, updating the available hours display.
 * This is a placeholder for actual task assignment logic.
 * @param {HTMLInputElement} inputElement - The input element that changed.
 */
function handleTaskHoursInput(inputElement) {
    const taskId = inputElement.dataset.taskId;
    const assignedHours = parseInt(inputElement.value, 10);

    // Get the current game state's available hours and tasks
    let currentAvailableHours = Main.gameState.availableHours;
    const taskToUpdate = Main.gameState.weeklyTasks.find(task => task.id === taskId);

    if (taskToUpdate) {
        const oldAssignedHours = taskToUpdate.assignedHours || 0;
        const hoursDifference = assignedHours - oldAssignedHours;

        if (currentAvailableHours - hoursDifference >= 0) {
            taskToUpdate.assignedHours = assignedHours;
            Main.gameState.availableHours -= hoursDifference;
            renderers.updateWeeklyTasksDisplay(Main.gameState.weeklyTasks, Main.gameState.availableHours);
            // In a real scenario, you might want to save the state or update it more frequently
            console.log(`Task ${taskId} assigned ${assignedHours} hours. Remaining: ${Main.gameState.availableHours}`);
        } else {
            // Revert input value if not enough hours
            inputElement.value = oldAssignedHours;
            renderers.showModal('Not Enough Hours', `You only have ${currentAvailableHours} hours remaining!`);
        }
    }
}

