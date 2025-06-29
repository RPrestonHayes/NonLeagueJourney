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
    // Hide all game screens and modals first
    gameScreens.forEach(screen => screen.style.display = 'none');
    modalOverlay.style.display = 'none';
    newGameModal.style.display = 'none';
    opponentCustomizationModal.style.display = 'none';

    // Show the requested screen/modal
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        // Add active class to nav button if it corresponds to a main screen
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.screen === screenId.replace('Screen', '')) {
                btn.classList.add('active-nav');
            } else {
                btn.classList.remove('active-nav');
            }
        });
    } else {
        console.error(`Attempted to render non-existent screen: ${screenId}`);
    }
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

// --- Generic Modal Display ---
/**
 * Shows a generic modal with a title, message, and optional action choices.
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
            hideModal(); // Hide modal after action, unless action explicitly prevents it
        };
        modalChoices.appendChild(button);
    });

    // Show/hide choice container based on if choices exist
    if (choices.length > 0) {
        modalChoices.style.display = 'flex';
        modalCloseBtn.style.display = 'none'; // If choices, typically don't need a separate close button
    } else {
        modalChoices.style.display = 'none';
        modalCloseBtn.style.display = 'block'; // If no choices, show close button
    }

    modalOverlay.style.display = 'flex'; // Use flex to center the modal
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
    renderGameScreen('newGameModal'); // Shows the modal by its ID
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
                <input type="text" id="opponentName_${club.id}" value="${club.name}">
            </div>
            <div class="form-group">
                <label for="opponentNickname_${club.id}">Nickname:</label>
                <input type="text" id="opponentNickname_${club.id}" value="${club.nickname || ''}">
            </div>
            <div class="form-group color-pickers">
                <div>
                    <label for="opponentPrimaryColor_${club.id}">Primary Kit:</label>
                    <input type="color" id="opponentPrimaryColor_${club.id}" value="${club.kitColors.primary}">
                </div>
                <div>
                    <label for="opponentSecondaryColor_${club.id}">Secondary Kit:</label>
                    <input type="color" id="opponentSecondaryColor_${club.id}" value="${club.kitColors.secondary}">
                </div>
            </div>
        `;
        opponentListCustomization.appendChild(div);
    });

    renderGameScreen('opponentCustomizationModal'); // Shows the modal
}

/**
 * Hides the opponent customization modal.
 */
export function hideOpponentCustomizationModal() {
    opponentCustomizationModal.style.display = 'none';
}


// --- Screen-Specific Renderers (Placeholders for now, will render data tables) ---

/**
 * Renders the Home Screen content.
 * @param {object} gameState - The current gameState object.
 */
export function renderHomeScreen(gameState) {
    // Already updated by updateTopBarStats, newsContent. Just ensure structure is there.
    // Additional dynamic elements for home screen can be added here
    updateWeeklyTasksDisplay(gameState.weeklyTasks, gameState.availableHours);
    updateNewsFeed(gameState.messages[gameState.messages.length - 1]?.text || 'No new news.');
}


/**
 * Renders the Squad Screen with player data.
 * @param {Array<object>} players - Array of player objects.
 */
export function renderSquadScreen(players) {
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
            const overallRating = calculateOverallPlayerRating(player.attributes); // Helper function needed
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
    // A very basic average for overall rating. Will need more sophisticated logic later.
    let sum = 0;
    let count = 0;
    for (const key in attributes) {
        if (key !== 'GK') { // Exclude GK if not a GK to prevent skewed rating
             sum += attributes[key];
             count++;
        }
    }
    if (attributes.GK) { // If it's a GK, prioritize GK attribute
        return Math.round((attributes.GK * 3 + sum) / (count + 3));
    }
    return count > 0 ? Math.round(sum / count) : 0;
}


/**
 * Renders the Facilities Screen.
 * @param {object} facilities - The facilities object from playerClub.
 */
export function renderFacilitiesScreen(facilities) {
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
                <td>£${facility.upgradeCost.toFixed(2)}</td>
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
    financeBalanceDisplay.textContent = `£${finances.balance.toFixed(2)}`;

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
        // Show most recent transactions first
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
                <input type="number" min="0" max="${availableHours}" value="${task.assignedHours}" data-task-id="${task.id}" class="task-hours-input">
            `;
            weeklyTasksList.appendChild(listItem);
        });
    } else {
        weeklyTasksList.innerHTML = `<li>No tasks available this week.</li>`;
    }
}

