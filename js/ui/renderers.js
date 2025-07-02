// js/ui/renderers.js

/**
 * Handles all rendering of game state to the HTML DOM.
 * Manages screen visibility, updates dynamic content, and displays modals.
 */

// --- Module Imports ---
import * as Constants from '../utils/constants.js';
import * as gameLoop from '../logic/gameLoop.js';
import * as Main from '../main.js'; // Import Main to access gameState and other functions
// Import getCalendarWeekString directly from Main, as it is defined there
import { getCalendarWeekString } from '../main.js'; 

// --- DOM Element References (Cache for performance and correct ID access) ---
const gameScreens = document.querySelectorAll('.game-screen');
const modalOverlay = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalChoices = document.getElementById('modalChoices');
const modalCloseBtn = document.getElementById('modalCloseBtn');

const newGameModal = document.getElementById('newGameModal');
const opponentCustomizationModal = document.getElementById('opponentCustomizationModal');
const loadingScreen = document.getElementById('loadingScreen');

const clubNameDisplay = document.getElementById('clubNameDisplay');
const currentSeasonDisplay = document.getElementById('currentSeasonDisplay');
const currentWeekDisplay = document.getElementById('currentWeekDisplay');
const currentBalanceDisplay = document.getElementById('currentBalanceDisplay');
const newsContent = document.getElementById('newsContent');

const weeklyTasksList = document.getElementById('weeklyTasksList');
const availableHoursDisplay = document.getElementById('availableHoursDisplay');

// Data table containers
const squadListContainer = document.getElementById('squadList');
const facilitiesListContainer = document.getElementById('facilitiesList');
const transactionListContainer = document.getElementById('transactionList');
const leagueTableContainer = document.getElementById('leagueTable');
const fixturesListContainer = document.getElementById('fixturesList');
const committeeListContainer = document.getElementById('committeeList');
const clubHistoryListContainer = document.getElementById('clubHistoryList');
const financeBalanceDisplay = document.getElementById('financeBalanceDisplay');
const opponentListCustomization = document.getElementById('opponentListCustomization');


// --- Core Screen Management ---
/**
 * Renders a specific game screen or modal by showing it and hiding others.
 * @param {string} screenId - The ID of the screen or modal to show (e.g., 'homeScreen', 'newGameModal').
 */
export function renderGameScreen(screenId) {
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });
    modalOverlay.style.display = 'none'; // Always hide generic modal when changing screens
    newGameModal.style.display = 'none';
    opponentCustomizationModal.style.display = 'none';
    loadingScreen.style.display = 'none';

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        targetScreen.classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.screen + 'Screen' === screenId) {
                btn.classList.add('active-nav');
            } else {
                btn.classList.remove('active-nav');
            }
        });
    } else {
        console.error(`Attempted to render non-existent screen: ${screenId}`);
    }
}

/**
 * Shows the dedicated loading screen.
 */
export function showLoadingScreen() {
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });
    modalOverlay.style.display = 'none';
    newGameModal.style.display = 'none';
    opponentCustomizationModal.style.display = 'none';
    loadingScreen.style.display = 'flex';
    loadingScreen.classList.add('active');
}

/**
 * Hides the dedicated loading screen.
 */
export function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
    loadingScreen.classList.remove('active');
}


// --- Top Bar & News Updates ---
/**
 * Updates the season, week, and balance display in the header.
 * @param {number} season
 * @param {string} weekString - Formatted week string (e.g., "August Week 1").
 * @param {number} balance
 */
export function updateTopBarStats(season, weekString, balance) {
    currentSeasonDisplay.textContent = season;
    currentWeekDisplay.textContent = weekString;
    currentBalanceDisplay.textContent = `£${balance.toFixed(2)}`;
}

/**
 * Updates the main club name display in the header.
 * @param {string} name - The new club name.
 */
export function updateClubNameDisplay(name) {
    clubNameDisplay.textContent = name;
}

/**
 * Updates the latest news/message feed.
 * @param {string} message - The message to display.
 */
export function updateNewsFeed(message) {
    newsContent.textContent = message;
}

/**
 * Displays a short, non-interactive message. It will auto-hide.
 * Use for "Game Saved!" or very transient info. For anything the user needs to dismiss, use showModal.
 * @param {string} title - The message title.
 * @param {string} message - The message content.
 */
export function displayMessage(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalChoices.innerHTML = '';
    modalChoices.style.display = 'none';
    modalCloseBtn.style.display = 'none';

    modalOverlay.style.display = 'flex';

    setTimeout(() => {
        hideModal();
    }, 3000); // Auto-hide after 3 seconds
}


// --- Generic Modal Display (for ALL modals that need user dismissal) ---
/**
 * Shows a generic modal with a title, message, and action choices.
 * This is the ONLY function that should be used for modals that require user dismissal.
 *
 * @param {string} title - The modal title.
 * @param {string} message - The modal message/description.
 * @param {Array<object>} customChoices - Array of { text: string, action: function, isPrimary: boolean }.
 * Each action function will be called when the button is clicked.
 * @param {object} gameState - The current mutable gameState object, passed from the caller.
 * @param {object} updateUICallbacks - An object { updateUI: function, saveGame: function, renderHomeScreen: function, finalizeWeekProcessing: function } provided by Main/gameLoop.
 * @param {string|null} dismissalContext - An optional context string for the caller's logic.
 */
export function showModal(title, message, customChoices = [], gameState, updateUICallbacks, dismissalContext = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalChoices.innerHTML = ''; // Clear previous choices

    const choicesToRender = [...customChoices];

    // If no custom choices were provided, add a default 'Continue' button
    if (choicesToRender.length === 0) {
        // Default 'Continue' now calls hideModal() and then the updateUICallbacks.
        choicesToRender.push({ text: 'Continue', action: (gs, uic, context) => { // Pass gs, uic, context to action
            hideModal(); 
            console.log("DEBUG: here ");
            // Use the provided updateUICallbacks and gameState
            if (uic && uic.finalizeWeekProcessing) {
                uic.finalizeWeekProcessing(gs, context); // Call finalizer with correct gameState and context
            } else {
                console.warn("DEBUG: finalizeWeekProcessing callback not available in showModal default action.");
                // Fallback if callbacks aren't properly passed (shouldn't happen with correct Main.js setup)
                Main.updateUI(); 
                Main.saveGame(false);
                renderGameScreen('homeScreen');
            }
        }, isPrimary: true }); 
    }
    
    modalChoices.style.display = 'flex'; 
    modalCloseBtn.style.display = 'none'; // Hide the general 'X' close button. Only generated buttons dismiss.

    choicesToRender.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.classList.add('modal-choice-btn', choice.isPrimary ? 'primary-btn' : 'secondary-btn');
        button.onclick = () => {
            // Custom actions also hide modal, then execute their specific logic, passing callbacks.
            hideModal(); // Always hide modal when any button is clicked
            // Pass all necessary context/callbacks to the custom action
            choice.action(gameState, updateUICallbacks, dismissalContext); // Pass gameState, updateUICallbacks, dismissalContext
        };
        modalChoices.appendChild(button);
    });
    
    modalOverlay.style.display = 'flex'; // Show the modal overlay
}

/**
 * Hides the generic modal.
 * This function now ONLY hides the modal and clears its content.
 * It does NOT trigger screen changes or game state updates.
 */
export function hideModal() {
    modalOverlay.style.display = 'none';
    modalTitle.textContent = '';
    modalMessage.textContent = '';
    modalChoices.innerHTML = '';
    modalCloseBtn.onclick = null; // Reset click handler for safety
}

/**
 * Returns the current display status of the generic modal.
 * Used by other modules to check if a modal is already open.
 * @returns {string} The CSS display property property value (e.g., 'none', 'flex').
 */
export function getModalDisplayStatus() {
    return modalOverlay.style.display;
}

// --- New Game Setup Modal ---
/**
 * Renders the New Game Setup modal.
 * Map initialization removed as it's no longer used.
 */
export function renderNewGameModal() {
    renderGameScreen('newGameModal');
    // No map to initialize anymore
}

// --- Opponent Customization Modal ---
export function renderOpponentCustomizationModal(opponentClubs) {
    opponentListCustomization.innerHTML = '';

    opponentClubs.forEach(club => {
        const div = document.createElement('div');
        div.classList.add('opponent-custom-item');
        div.innerHTML = `
            <h4>${club.name}</h4>
            <div class="form-group">
                <label for="opponentName_${club.id}">Name:</label>
                <input type="text" id="opponentName_${club.id}" data-club-id="${club.id}" data-field="name" value="${club.name}">
            </div>
            <div class="form-group">
                <label for="opponentNickname_${club.id}">Nickname:</label>
                <input type="text" id="opponentNickname_${club.id}" data-club-id="${club.id}" data-field="nickname" value="${club.nickname || ''}">
            </div>
            <div class="form-group color-pickers">
                <div>
                    <label for="opponentPrimaryColor_${club.id}">Primary Kit:</label>
                    <input type="color" id="opponentPrimaryColor_${club.id}" data-club-id="${club.id}" data-field="primaryColor" value="${club.kitColors.primary}">
                </div>
                <div>
                    <label for="opponentSecondaryColor_${club.id}">Secondary Kit:</label>
                    <input type="color" id="opponentSecondaryColor_${club.id}" data-club-id="${club.id}" data-field="secondaryColor" value="${club.kitColors.secondary}">
                </div>
            </div>
        `;
        opponentListCustomization.appendChild(div);
    });

    renderGameScreen('opponentCustomizationModal');
}

export function hideOpponentCustomizationModal() {
    opponentCustomizationModal.style.display = 'none';
}


// --- Screen-Specific Renderers ---

export function renderHomeScreen(gameState) {
    // No direct rendering needed here as elements are updated by other renderers.
}

export function renderSquadScreen(players) {
    console.log("DEBUG: renderSquadScreen received players:", players);
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Pos</th>
                    <th>Age</th>
                    <th>Ovr</th>
                    <th>Morale</th>
                    <th>Fitness</th>
                    <th>Commitment</th>
                    <th>Gls</th>
                    <th>Apps</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (players && players.length > 0) {
        players.forEach(player => {
            tableHTML += `
                <tr>
                    <td>${player.name}</td>
                    <td>${player.preferredPosition}</td>
                    <td>${player.age}</td>
                    <td>${calculateOverallPlayerRating(player.attributes)}</td>
                    <td>${player.status.morale}%</td>
                    <td>${player.status.fitness}%</td>
                    <td>${player.traits.commitmentLevel}</td>
                    <td>${player.currentSeasonStats.goals}</td>
                    <td>${player.currentSeasonStats.appearances}</td>
                </tr>
            `;
        });
    } else {
        tableHTML += `<tr><td colspan="9">No players in squad.</td></tr>`;
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    squadListContainer.innerHTML = tableHTML;
}

function calculateOverallPlayerRating(attributes) {
    let sum = 0;
    let count = 0;
    for (const key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            if (key !== 'GK') {
                 sum += attributes[key];
                 count++;
            }
        }
    }
    if (attributes.GK && count > 0) {
        return Math.round((attributes.GK * 3 + sum) / (count + 3));
    } else if (attributes.GK && count === 0) {
        return Math.round(attributes.GK);
    }
    return count > 0 ? Math.round(sum / count) : 0;
}


/**
 * Renders the Facilities Screen.
 * @param {object} facilities - The facilities object from playerClub.
 */
export function renderFacilitiesScreen(facilities) {
    console.log("DEBUG: renderFacilitiesScreen received facilities:", facilities);
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Facility</th>
                    <th>Grade</th>
                    <th>Condition</th>
                    <th>Status</th>
                    <th>Next Upgrade Cost</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const key in facilities) {
        const facility = facilities[key];
        if (facility.level > 0 || key === Constants.FACILITIES.PITCH || key === Constants.FACILITIES.CHGRMS) {
            tableHTML += `
                <tr>
                    <td>${facility.name}</td>
                    <td>${facility.grade || 'N/A'}</td>
                    <td>${facility.condition}%</td>
                    <td>${facility.isUsable ? 'Usable' : 'Not Usable'}</td>
                    <td>£${facility.currentUpgradeCost ? facility.currentUpgradeCost.toFixed(2) : 'MAX'}</td>
                </tr>
            `;
        } else if (facility.level === 0) {
             tableHTML += `
                <tr>
                    <td>${facility.name}</td>
                    <td>${facility.grade || 'N/A'}</td>
                    <td>${facility.condition}%</td>
                    <td>Not Built</td>
                    <td>£${facility.currentUpgradeCost ? facility.currentUpgradeCost.toFixed(2) : 'N/A'} (Build)</td>
                </tr>
            `;
        }
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    facilitiesListContainer.innerHTML = tableHTML;
}

export function renderFinancesScreen(finances) {
    console.log("DEBUG: renderFinancesScreen received finances:", finances);
    const financeBalanceElement = document.getElementById('financeBalanceDisplay');
    if (financeBalanceElement) {
        financeBalanceElement.textContent = `£${finances.balance.toFixed(2)}`;
    } else {
        console.warn("DEBUG: financeBalanceDisplay element not found.");
    }


    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (finances.transactions && finances.transactions.length > 0) {
        finances.transactions.slice().reverse().forEach(transaction => {
            tableHTML += `
                <tr>
                    <td>${transaction.date}</td>
                    <td>${transaction.type}</td>
                    <td>${transaction.description}</td>
                    <td class="${transaction.amount >= 0 ? 'income' : 'expense'}">£${transaction.amount.toFixed(2)}</td>
                </tr>
            `;
        });
    } else {
        tableHTML += `<tr><td colspan="4">No transactions yet.</td></tr>`;
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    transactionListContainer.innerHTML = tableHTML;
}

/**
 * Renders the League Screen with the league name and table data.
 * @param {string} leagueName - The name of the current league.
 * @param {Array<object>} leagueTableData - Array of club objects for the league table.
 */
export function renderLeagueScreen(leagueName, leagueTableData) {
    console.log("DEBUG: renderLeagueScreen received leagueName:", leagueName, "and leagueTableData:", leagueTableData);
    
    // Update the h2 heading to include the league name
    const leagueScreenHeading = document.querySelector('#leagueScreen h2');
    if (leagueScreenHeading) {
        // Use innerHTML to allow <br> tag for a newline
        leagueScreenHeading.innerHTML = `${leagueName}<br>League Table`;
    }

    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Pos</th>
                    <th>Club</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Pts</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (leagueTableData && leagueTableData.length > 0) {
        leagueTableData.forEach((club, index) => {
            tableHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${club.name}</td>
                    <td>${club.played}</td>
                    <td>${club.won}</td>
                    <td>${club.drawn}</td>
                    <td>${club.lost}</td>
                    <td>${club.goalsFor}</td>
                    <td>${club.goalsAgainst}</td>
                    <td>${club.goalDifference}</td>
                    <td>${club.points}</td>
                </tr>
            `;
        });
    } else {
        tableHTML += `<tr><td colspan="10">League table not available.</td></tr>`;
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    leagueTableContainer.innerHTML = tableHTML;
}

/**
 * Renders the Fixtures & Results screen, now expecting grouped fixtures.
 * @param {Array<object>} groupedMatchSchedule - Array of match week objects, each containing an array of matches.
 */
export function renderFixturesScreen(groupedMatchSchedule) {
    console.log("DEBUG: renderFixturesScreen received groupedMatchSchedule:", groupedMatchSchedule);
    let htmlContent = '';

    if (groupedMatchSchedule && groupedMatchSchedule.length > 0) {
        // Sort the weekBlocks by their week number to ensure chronological display
        groupedMatchSchedule.sort((a, b) => a.week - b.week);

        groupedMatchSchedule.forEach(weekBlock => {
            if (weekBlock.matches.length === 0) {
                return;
            }

            // weekBlock.week is now always the absolute game week
            const displayWeekString = getCalendarWeekString(weekBlock.week); 
            htmlContent += `
                <div class="fixture-week-block">
                    <h3>Week ${displayWeekString}</h3>
                    <table class="data-table fixture-table">
                        <thead>
                            <tr>
                                <th>Home Team</th>
                                <th>Score</th>
                                <th>Away Team</th>
                                <th>Comp</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            weekBlock.matches.forEach(match => {
                const score = match.played && match.result ? match.result : 'vs';
                htmlContent += `
                    <tr>
                        <td>${match.homeTeamName}</td>
                        <td>${score}</td>
                        <td>${match.awayTeamName}</td>
                        <td>${match.competition}</td>
                    </tr>
                `;
            });

            htmlContent += `
                        </tbody>
                    </table>
                </div>
            `;
        });
    } else {
        htmlContent += `<p>No fixtures scheduled for this season yet.</p>`;
    }

    fixturesListContainer.innerHTML = htmlContent;
}

export function renderCommitteeScreen(committeeMembers) {
    console.log("DEBUG: renderCommitteeScreen received committeeMembers:", committeeMembers);
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Age</th>
                    <th>Satisfaction</th>
                    <th>Loyalty to You</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (committeeMembers && committeeMembers.length > 0) {
        committeeMembers.forEach(member => {
            tableHTML += `
                <tr>
                    <td>${member.name}</td>
                    <td>${member.role}</td>
                    <td>${member.age}</td>
                    <td>${member.personality.currentSatisfaction}%</td>
                    <td>${member.personality.loyaltyToYou}/20</td>
                </tr>
            `;
        });
    } else {
        tableHTML += `<tr><td colspan="5">No committee members.</td></tr>`;
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    committeeListContainer.innerHTML = tableHTML;
}

export function renderHistoryScreen(clubHistory) {
    console.log("DEBUG: renderHistoryScreen received clubHistory:", clubHistory);
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Season</th>
                    <th>League</th>
                    <th>Position</th>
                    <th>Wins</th>
                    <th>Draws</th>
                    <th>Losses</th>
                    <th>Cups</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (clubHistory && clubHistory.length > 0) {
        clubHistory.forEach(season => {
            tableHTML += `
                <tr>
                    <td>${season.season}</td>
                    <td>${season.leagueName}</td>
                    <td>${season.finalLeaguePosition}</td>
                    <td>${season.leagueWins}</td>
                    <td>${season.leagueDraws}</td>
                    <td>${season.leagueLosses}</td>
                    <td>${season.cupProgress}</td>
                </tr>
            `;
        });
    } else {
        tableHTML += `<tr><td colspan="7">No history yet. Get playing!</td></tr>`;
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    clubHistoryListContainer.innerHTML = tableHTML;
}

/**
 * Updates the weekly tasks list on the home screen.
 * @param {Array<object>} tasks - Array of task objects.
 * @param {number} availableHours - Player's remaining hours for the week.
 */
export function updateWeeklyTasksDisplay(tasks, availableHours) {
    if (!weeklyTasksList) return;

    availableHoursDisplay.textContent = availableHours;
    weeklyTasksList.innerHTML = '';

    if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
            const listItem = document.createElement('li');
            const descriptionText = task.longDescription ? task.longDescription : task.description;
            listItem.innerHTML = `
                <span>${task.description} (${task.baseHours} hrs)<br><small>${descriptionText}</small></span>
                <button class="complete-task-btn ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" ${task.completed || availableHours < task.baseHours ? 'disabled' : ''}>
                    ${task.completed ? 'Completed' : 'Do Task'}
                </button>
            `;
            weeklyTasksList.appendChild(listItem);
        });
    } else {
        weeklyTasksList.innerHTML = `<li>No tasks available this week.</li>`;
    }
}
