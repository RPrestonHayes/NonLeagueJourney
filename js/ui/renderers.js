// js/ui/renderers.js

/**
 * Handles all rendering of game state to the HTML DOM.
 * Manages screen visibility, updates dynamic content, and displays modals.
 */

// --- DOM Element References (Cache for performance) ---
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
const financeBalanceDisplay = document.getElementById('financeBalanceDisplay'); // Corrected ID reference
const opponentListCustomization = document.getElementById('opponentListCustomization');


// --- Core Screen Management ---
/**
 * Renders a specific game screen or modal by showing it and hiding others.
 * @param {string} screenId - The ID of the screen or modal to show (e.g., 'homeScreen', 'newGameModal').
 */
export function renderGameScreen(screenId) {
    // Hide all game screens and modals first
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active'); // IMPORTANT: Remove 'active' class from all screens
    });
    modalOverlay.style.display = 'none';
    newGameModal.style.display = 'none';
    opponentCustomizationModal.style.display = 'none';
    loadingScreen.style.display = 'none';

    // Show the requested screen/modal
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        targetScreen.classList.add('active'); // IMPORTANT: Add 'active' class to the target screen

        // Add active class to nav button if it corresponds to a main screen
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
        screen.classList.remove('active'); // Ensure active is removed
    });
    modalOverlay.style.display = 'none';
    newGameModal.style.display = 'none';
    opponentCustomizationModal.style.display = 'none';
    loadingScreen.style.display = 'flex';
    loadingScreen.classList.add('active'); // Loading screen is also "active"
}

/**
 * Hides the dedicated loading screen.
 */
export function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
    loadingScreen.classList.remove('active'); // Remove active
}


// --- Top Bar & News Updates ---
/**
 * Updates the season, week, and balance display in the header.
 * @param {number} season
 * @param {number} week
 * @param {number} balance
 */
export function updateTopBarStats(season, week, balance) {
    currentSeasonDisplay.textContent = season;
    currentWeekDisplay.textContent = week;
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
 * Displays a short, temporary message (e.g., "Game Saved!").
 * Uses the generic modal but hides choices and close button for quick info.
 * @param {string} title - The message title.
 * @param {string} message - The message content.
 */
export function displayMessage(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalChoices.innerHTML = ''; // Clear choices
    modalChoices.style.display = 'none'; // Hide choices
    modalCloseBtn.style.display = 'none'; // Hide close button for auto-disappearing message

    modalOverlay.style.display = 'flex'; // Show modal

    // Automatically hide after a few seconds
    setTimeout(() => {
        hideModal();
    }, 3000); // 3 seconds
}


// --- Generic Modal Display (for confirmations, events with choices) ---
/**
 * Shows a generic modal with a title, message, and optional action choices.
 * This is for interactive modals, unlike displayMessage for quick info.
 * @param {string} title - The modal title.
 * @param {string} message - The modal message/description.
 * @param {Array<object>} choices - Optional array of { text: string, action: function, isPrimary: boolean }
 */
export function showModal(title, message, choices = []) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalChoices.innerHTML = ''; // Clear previous choices

    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.classList.add('modal-choice-btn', choice.isPrimary ? 'primary-btn' : 'secondary-btn');
        button.onclick = () => {
            choice.action();
            // hideModal(); // Modals with choices often hide via the action itself, or based on specific logic
            // Commenting out hideModal here. The action itself should call hideModal if needed.
        };
        modalChoices.appendChild(button);
    });

    if (choices.length > 0) {
        modalChoices.style.display = 'flex';
        modalCloseBtn.style.display = 'none';
    } else {
        modalChoices.style.display = 'block';
        modalCloseBtn.style.display = 'block';
    }

    modalOverlay.style.display = 'flex';
}

/**
 * Hides the generic modal.
 */
export function hideModal() {
    modalOverlay.style.display = 'none';
    modalTitle.textContent = '';
    modalMessage.textContent = '';
    modalChoices.innerHTML = '';
}

// --- New Game Setup Modal ---
/**
 * Prepares and displays the New Game Setup modal.
 * This is called at game start if no save is found.
 */
export function renderNewGameModal() {
    renderGameScreen('newGameModal');
}

// --- Opponent Customization Modal ---
/**
 * Renders the opponent customization modal with editable fields for each opponent club.
 * @param {Array<object>} opponentClubs - Array of opponent club structural data.
 */
export function renderOpponentCustomizationModal(opponentClubs) {
    opponentListCustomization.innerHTML = ''; // Clear previous content

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

/**
 * Hides the opponent customization modal.
 */
export function hideOpponentCustomizationModal() {
    opponentCustomizationModal.style.display = 'none';
}


// --- Screen-Specific Renderers ---

/**
 * Renders the Home Screen content.
 * @param {object} gameState - The current gameState object.
 */
export function renderHomeScreen(gameState) {
    // No direct rendering needed here as elements are updated by other renderers.
}


/**
 * Renders the Squad Screen with player data.
 * @param {Array<object>} players - Array of player objects.
 */
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
            const overallRating = calculateOverallPlayerRating(player.attributes);
            tableHTML += `
                <tr>
                    <td>${player.name}</td>
                    <td>${player.preferredPosition}</td>
                    <td>${player.age}</td>
                    <td>${overallRating}</td>
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

/**
 * Helper to calculate overall player rating (simplified for now).
 * @param {object} attributes - Player's attributes.
 * @returns {number} Overall rating.
 */
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
                    <th>Level</th>
                    <th>Status</th>
                    <th>Next Upgrade Cost</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const key in facilities) {
        const facility = facilities[key];
        tableHTML += `
            <tr>
                <td>${facility.name}</td>
                <td>${facility.level}</td>
                <td>${facility.status}</td>
                <td>£${facility.currentUpgradeCost ? facility.currentUpgradeCost.toFixed(2) : 'N/A'}</td>
            </tr>
        `;
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    facilitiesListContainer.innerHTML = tableHTML;
}

/**
 * Renders the Finances Screen.
 * @param {object} finances - The finances object from playerClub.
 */
export function renderFinancesScreen(finances) {
    console.log("DEBUG: renderFinancesScreen received finances:", finances);
    // Ensure the ID of the balance display is correct, it was `financeBalanceDisplay` in my previous HTML
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
 * Renders the League Table screen.
 * @param {Array<object>} leagueTableData - Array of club objects with league stats.
 */
export function renderLeagueScreen(leagueTableData) {
    console.log("DEBUG: renderLeagueScreen received leagueTableData:", leagueTableData);
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
 * Renders the Fixtures & Results screen.
 * @param {Array<object>} matchSchedule - Array of match objects.
 */
export function renderFixturesScreen(matchSchedule) {
    console.log("DEBUG: renderFixturesScreen received matchSchedule:", matchSchedule);
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Week</th>
                    <th>Home Team</th>
                    <th>Away Team</th>
                    <th>Result</th>
                    <th>Comp</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (matchSchedule && matchSchedule.length > 0) {
        matchSchedule.forEach(match => {
            tableHTML += `
                <tr>
                    <td>${match.week}</td>
                    <td>${match.homeTeamName}</td>
                    <td>${match.awayTeamName}</td>
                    <td>${match.result ? match.result : 'vs'}</td>
                    <td>${match.competition}</td>
                </tr>
            `;
        });
    } else {
        tableHTML += `<tr><td colspan="5">No fixtures scheduled.</td></tr>`;
    }

    tableHTML += `
            </tbody>
        </table>
    `;
    fixturesListContainer.innerHTML = tableHTML;
}

/**
 * Renders the Committee Screen.
 * @param {Array<object>} committeeMembers - Array of committee member objects.
 */
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

/**
 * Renders the Club History screen.
 * @param {Array<object>} clubHistory - Array of historical season summaries.
 */
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
    if (!weeklyTasksList) return; // Ensure element exists

    availableHoursDisplay.textContent = availableHours;
    weeklyTasksList.innerHTML = ''; // Clear previous tasks

    if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span>${task.description} (${task.baseHours} hrs)</span>
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

