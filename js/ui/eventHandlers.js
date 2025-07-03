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
// NEW: Import taskLogic to trigger task outcomes immediately
import * as taskLogic from '../logic/taskLogic.js';
// Import dataGenerator for postcode lookup
import * as dataGenerator from '../utils/dataGenerator.js';
// Import opponentData to access and update club data
import * as opponentData from '../data/opponentData.js';


// --- Cached DOM Elements ---
const navButtons = document.querySelectorAll('.nav-btn');
const advanceWeekBtn = document.getElementById('advanceWeekBtn');
const saveGameBtn = document.getElementById('saveGameBtn');
const loadGameBtn = document.getElementById('loadGameBtn');
const newGameBtn = document.getElementById('newGameBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// New Game Modal elements
const newGameModal = document.getElementById('newGameModal');
const hometownInput = document.getElementById('hometownInput'); // Now a text input
const groundPostcodeInput = document.getElementById('groundPostcodeInput'); // New postcode input
const clubNameInput = document.getElementById('clubNameInput');
const clubNicknameInput = document.getElementById('clubNicknameInput');
const primaryColorInput = document.getElementById('primaryColorInput');
const secondaryColorInput = document.getElementById('secondaryColorInput');
const createGameBtn = document.getElementById('createGameBtn');

// Opponent Customization Modal elements (still used for cup opponents)
const opponentCustomizationModal = document.getElementById('opponentCustomizationModal');
const opponentListCustomization = document.getElementById('opponentListCustomization');
const saveOpponentCustomizationBtn = document.getElementById('saveOpponentCustomizationBtn');

// Weekly Tasks
const weeklyTasksList = document.getElementById('weeklyTasksList');

// NEW: Edit Screen elements
const editScreen = document.getElementById('editScreen');
const clubToEditSelect = document.getElementById('clubToEditSelect');
const editClubDetailsForm = document.getElementById('editClubDetailsForm');
const editClubNameInput = document.getElementById('editClubNameInput');
const editClubNicknameInput = document.getElementById('editClubNicknameInput');
const editPrimaryColorInput = document.getElementById('editPrimaryColorInput');
const editSecondaryColorInput = document.getElementById('editSecondaryColorInput');
const saveEditedClubBtn = document.getElementById('saveEditedClubBtn');


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
            // NEW: If navigating to edit screen, render it
            if (screenId === 'editScreen') {
                renderers.renderEditScreen(Main.gameState);
            }
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

    // --- Opponent Customization Modal Event Listeners (for cup opponents) ---
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

    // NEW: Edit Screen Event Listeners
    if (clubToEditSelect) {
        clubToEditSelect.addEventListener('change', handleClubSelectForEdit);
    }
    if (saveEditedClubBtn) {
        saveEditedClubBtn.addEventListener('click', handleSaveEditedClub);
    }
}

// --- Specific Event Handlers ---

/**
 * Handles the "Create Club" button click in the New Game Setup modal.
 * Validates input and calls main.startNewGame.
 */
function handleCreateGame() {
    const hometownName = hometownInput.value.trim();
    const groundPostcode = groundPostcodeInput.value.trim();
    const clubName = clubNameInput.value.trim();
    const clubNickname = clubNicknameInput.value.trim();
    const primaryColor = primaryColorInput.value;
    const secondaryColor = secondaryColorInput.value;

    if (!hometownName || !groundPostcode || !clubName || !clubNickname) {
        renderers.showModal('Input Error', 'Please fill in all club details: Hometown, Ground Postcode, Club Name, and Nickname.', [{ text: 'OK', action: renderers.hideModal }]);
        return;
    }

    if (primaryColor === secondaryColor) {
        renderers.showModal('Kit Color Error', 'Primary and Secondary kit colors cannot be the same. Please choose different colors.', [{ text: 'OK', action: renderers.hideModal }]);
        return;
    }

    // Attempt to get county data from the postcode
    const playerCountyData = dataGenerator.getCountyDataFromPostcode(groundPostcode);

    if (!playerCountyData) {
        renderers.showModal('Location Error', 'Could not determine a valid county/region from the provided postcode. Please check the postcode or manually adjust opponent names later.', [{ text: 'OK', action: renderers.hideModal }]);
        // Even if county data isn't found, we can proceed with a fallback.
        // For now, we'll let the game start, but the generated opponents might be generic.
        // You could also choose to prevent game start until a valid postcode is entered.
    }

    const playerClubDetails = {
        hometown: hometownName, // This is now just the user-entered string
        groundPostcode: groundPostcode, // Store the postcode
        countyData: playerCountyData, // Pass the found county data (or null)
        clubName: clubName,
        nickname: clubNickname,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor
    };

    console.log("Player club details captured:", playerClubDetails);
    Main.startNewGame(playerClubDetails);
}

/**
 * Handles the "Save Opponent Customization" button click for the cup opponent modal.
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
 * This now immediately calls taskLogic to handle the outcome and modal.
 * @param {HTMLButtonElement} buttonElement - The button that was clicked.
 */
function handleCompleteTask(buttonElement) {
    const taskId = buttonElement.dataset.taskId;
    const task = Main.gameState.weeklyTasks.find(t => t.id === taskId);

    if (task && !task.completed) {
        if (Main.gameState.availableHours >= task.baseHours) {
            // Deduct hours immediately
            Main.gameState.availableHours -= task.baseHours;
            // Mark task as completed for this week's processing
            task.assignedHours = task.baseHours; // Mark as assigned for gameLoop to process
            task.completed = true; // Mark as completed for UI state

            // Update UI immediately to reflect hours deduction and button change
            renderers.updateWeeklyTasksDisplay(Main.gameState.weeklyTasks, Main.gameState.availableHours);
            
            // Disable the button to prevent re-clicking
            buttonElement.disabled = true;
            buttonElement.textContent = 'Completed';
            buttonElement.classList.add('completed');

            Main.saveGame(false); // Save state silently after a task is done

            // Immediately call taskLogic to handle the task's specific outcome/modal
            taskLogic.handleCompletedTaskOutcome(Main.gameState, task);

        } else {
            renderers.showModal('Not Enough Hours', `You need exactly ${task.baseHours} hours for this task, but only have ${Main.gameState.availableHours} remaining! You cannot do this task partially.`, [{ text: 'OK', action: renderers.hideModal }]);
        }
    }
}

// NEW: Edit Screen Handlers
/**
 * Handles selection of a club from the dropdown on the Edit screen.
 * Populates the form with the selected club's data.
 */
function handleClubSelectForEdit() {
    const selectedClubId = clubToEditSelect.value;
    if (selectedClubId) {
        const club = opponentData.getOpponentClub(selectedClubId);
        if (club) {
            editClubNameInput.value = club.name;
            editClubNicknameInput.value = club.nickname || '';
            editPrimaryColorInput.value = club.kitColors.primary;
            editSecondaryColorInput.value = club.kitColors.secondary;
            editClubDetailsForm.style.display = 'block';
            saveEditedClubBtn.dataset.clubId = club.id; // Store ID on button for saving
        }
    } else {
        editClubDetailsForm.style.display = 'none';
        saveEditedClubBtn.dataset.clubId = '';
    }
}

/**
 * Handles saving changes for a club from the Edit screen.
 * Updates club data and marks it as customized.
 */
function handleSaveEditedClub() {
    const clubId = saveEditedClubBtn.dataset.clubId;
    if (!clubId) {
        renderers.showModal('Error', 'No club selected for editing.', [{ text: 'OK', action: renderers.hideModal }]);
        return;
    }

    const newName = editClubNameInput.value.trim();
    const newNickname = editClubNicknameInput.value.trim();
    const newPrimaryColor = editPrimaryColorInput.value;
    const newSecondaryColor = editSecondaryColorInput.value;

    if (!newName || !newNickname) {
        renderers.showModal('Input Error', 'Please fill in both name and nickname.', [{ text: 'OK', action: renderers.hideModal }]);
        return;
    }
    if (newPrimaryColor === newSecondaryColor) {
        renderers.showModal('Kit Color Error', 'Primary and Secondary kit colors cannot be the same.', [{ text: 'OK', action: renderers.hideModal }]);
        return;
    }

    const clubToUpdate = opponentData.getOpponentClub(clubId);
    if (clubToUpdate) {
        clubToUpdate.name = newName;
        clubToUpdate.nickname = newNickname;
        clubToUpdate.kitColors.primary = newPrimaryColor;
        clubToUpdate.kitColors.secondary = newSecondaryColor;
        clubToUpdate.customizationStatus = Constants.CLUB_CUSTOMIZATION_STATUS.CUSTOMIZED_ONCE; // Mark as customized

        // Update in Main.gameState as well for consistency, especially if it's the player's club
        if (Main.gameState.playerClub.id === clubId) {
            Main.gameState.playerClub.name = newName;
            Main.gameState.playerClub.nickname = newNickname;
            Main.gameState.playerClub.kitColors.primary = newPrimaryColor;
            Main.gameState.playerClub.kitColors.secondary = newSecondaryColor;
            Main.applyThemeColors(newPrimaryColor, newSecondaryColor); // Apply theme if player's club
        } else {
            // If it's an AI club, ensure it's updated in the league and cup data if present
            Main.gameState.leagues.forEach(league => {
                const clubInLeague = league.allClubsData.find(c => c.id === clubId);
                if (clubInLeague) {
                    Object.assign(clubInLeague, { name: newName, nickname: newNickname, kitColors: { primary: newPrimaryColor, secondary: newSecondaryColor } });
                }
            });
            Main.gameState.countyCup.teams.forEach(cupTeam => {
                if (cupTeam.id === clubId) {
                    Object.assign(cupTeam, { name: newName, nickname: newNickname, kitColors: { primary: newPrimaryColor, secondary: newSecondaryColor } });
                }
            });
        }

        Main.saveGame(true);
        renderers.showModal('Changes Saved!', `${newName} details updated. This club can no longer be customized from this screen.`, [{ text: 'OK', action: () => {
            renderers.hideModal();
            renderers.renderEditScreen(Main.gameState); // Re-render edit screen to update dropdown
            Main.updateUI();
        }}]);
    } else {
        renderers.showModal('Error', 'Club not found for update.', [{ text: 'OK', action: renderers.hideModal }]);
    }
}
