// js/ui/eventHandlers.js

/**
 * Handles all user interface events and dispatches them to relevant game logic.
 */

// --- Module Imports ---
// Import main game functions and gameState
import * as Main from '../main.js';
// Import rendering functions to interact with UI
import * as renderers from './renderers.js';
// Import Constants to access task types
import * as Constants from '../utils/constants.js';


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
        saveGameBtn.addEventListener('click', () => Main.saveGame(true)); // Explicitly show message for manual save
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

    // --- Weekly Tasks Button Listener (using event delegation) ---
    if (weeklyTasksList) {
        weeklyTasksList.addEventListener('click', (event) => {
            if (event.target.classList.contains('complete-task-btn')) {
                handleCompleteTask(event.target);
            }
        });
    }
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
        renderers.showModal('Input Error', 'Please fill in all club details: Hometown, Club Name, and Nickname.', [{ text: 'OK', action: renderers.hideModal }]);
        return;
    }

    if (primaryColor === secondaryColor) {
        renderers.showModal('Kit Color Error', 'Primary and Secondary kit colors cannot be the same. Please choose different colors.', [{ text: 'OK', action: renderers.hideModal }]);
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
    Main.startNewGame(playerClubDetails);
}

/**
 * Handles the "Save Opponent Customization" button click.
 * Collects data from the dynamically generated opponent forms.
 */
function handleSaveOpponentCustomization() {
    const customizedOpponents = [];
    const opponentItems = opponentListCustomization.querySelectorAll('.opponent-custom-item');

    let isValid = true;
    opponentItems.forEach(item => {
        const clubId = item.querySelector('input[data-field="name"]').dataset.clubId;
        const nameInput = item.querySelector(`input[data-field="name"][data-club-id="${clubId}"]`);
        const nicknameInput = item.querySelector(`input[data-field="nickname"][data-club-id="${clubId}"]`);
        const primaryColorInput = item.querySelector(`input[data-field="primaryColor"][data-club-id="${clubId}"]`);
        const secondaryColorInput = item.querySelector(`input[data-field="secondaryColor"][data-club-id="${clubId}"]`);

        const newName = nameInput.value.trim();
        const newNickname = nicknameInput.value.trim();
        const newPrimaryColor = primaryColorInput.value;
        const newSecondaryColor = secondaryColorInput.value;

        if (!newName || !newNickname) {
            renderers.showModal('Input Error', `Please fill in name and nickname for an opponent club.`, [{ text: 'OK', action: renderers.hideModal }]);
            isValid = false;
            return;
        }
        if (newPrimaryColor === newSecondaryColor) {
             renderers.showModal('Kit Color Error', `Primary and Secondary kit colors for ${newName} cannot be the same.`, [{ text: 'OK', action: renderers.hideModal }]);
             isValid = false;
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

    if (isValid && customizedOpponents.length === opponentItems.length) {
        Main.applyOpponentCustomization(customizedOpponents);
    }
}

/**
 * Handles the "Do Task" button click for weekly tasks.
 * STRICT "ALL OR NOTHING" implementation: Requires full task hours available.
 * @param {HTMLButtonElement} buttonElement - The button that was clicked.
 */
function handleCompleteTask(buttonElement) {
    const taskId = buttonElement.dataset.taskId;
    // Find the task object within the current gameState's weeklyTasks
    const task = Main.gameState.weeklyTasks.find(t => t.id === taskId);

    if (task && !task.completed) {
        // Strict check: available hours must be >= task's baseHours
        if (Main.gameState.availableHours >= task.baseHours) {
            // Deduct hours from availableHours
            Main.gameState.availableHours -= task.baseHours;
            // Mark task as completed for this week's processing
            task.assignedHours = task.baseHours; // Mark as assigned for gameLoop to process
            task.completed = true; // Mark as completed for UI state

            renderers.updateWeeklyTasksDisplay(Main.gameState.weeklyTasks, Main.gameState.availableHours);
            renderers.displayMessage('Task Completed', `${task.description} done!`);

            // Disable the button to prevent re-clicking
            buttonElement.disabled = true;
            buttonElement.textContent = 'Completed';
            buttonElement.classList.add('completed');

            Main.saveGame(false); // Save state silently after a task is done
        } else {
            renderers.showModal('Not Enough Hours', `You need exactly ${task.baseHours} hours for this task, but only have ${Main.gameState.availableHours} remaining! You cannot do this task partially.`, [{ text: 'OK', action: renderers.hideModal }]);
        }
    }
}

