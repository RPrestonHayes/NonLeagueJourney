// js/data/clubData.js

/**
 * Manages all data related to the player's football club.
 * Provides functions for creating the club, managing finances,
 * facilities, and committee members.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';

// --- Initial Club Setup Data ---

// Base properties for each facility, with their initial level, status, and base costs.
// This forms the template for a new club's facilities.
const BASE_FACILITIES_PROPERTIES = {
    [Constants.FACILITIES.PITCH]: {
        name: 'Pitch',
        level: 1, // 1: Basic field, 2: Maintained, 3: Good, 4: Excellent, 5: Pro-grade
        status: 'Unkempt Field',
        baseUpgradeCost: 200, // Base cost for Level 1->2 upgrade
        maintenanceCost: 10, // Weekly maintenance cost
        capacityContribution: 0 // No direct capacity from pitch
    },
    [Constants.FACILITIES.CHGRMS]: {
        name: 'Changing Rooms',
        level: 1, // 1: Basic Hut, 2: Small Rooms, 3: Decent, 4: Modern
        status: 'Basic Hut',
        baseUpgradeCost: 150,
        maintenanceCost: 5,
        capacityContribution: 0
    },
    [Constants.FACILITIES.TOILETS]: {
        name: 'Toilets',
        level: 0, // 0: None, 1: Basic Portables, 2: Small Block, 3: Modern Facilities
        status: 'None',
        baseUpgradeCost: 100,
        maintenanceCost: 3,
        capacityContribution: 0
    },
    [Constants.FACILITIES.SNACKBAR]: {
        name: 'Snack Bar',
        level: 0, // 0: None, 1: Tea Hut, 2: Basic Kiosk, 3: Full Snack Bar
        status: 'None',
        baseUpgradeCost: 250,
        maintenanceCost: 8,
        capacityContribution: 0,
        revenuePerMatch: 15 // Example base revenue
    },
    [Constants.FACILITIES.COVERED_STAND]: {
        name: 'Covered Standing Area',
        level: 0, // 0: None, 1: Small Cover, 2: Medium Cover
        status: 'None',
        baseUpgradeCost: 300,
        maintenanceCost: 15,
        capacityContribution: 50 // Adds 50 standing capacity
    },
    [Constants.FACILITIES.TURNSTILES]: {
        name: 'Turnstiles',
        level: 0, // 0: None, 1: Basic, 2: Modern
        status: 'None',
        baseUpgradeCost: 120,
        maintenanceCost: 2,
        capacityContribution: 0 // Enables controlled entry for tickets
    }
    // More facilities can be added here as the game progresses (e.g., SEATED_STAND, FLOODLIGHTS)
};

// --- Player Club State (Internal representation) ---
// This module will operate on an object passed to its functions, not maintain a global internal state.
// The functions will return modified objects for Main.gameState to update.


// --- Club Creation ---
/**
 * Creates and initializes a new player club object.
 * @param {object} details - Object with hometown, clubName, nickname, primaryColor, secondaryColor.
 * @returns {object} The newly created player club object.
 */
export function createPlayerClub(details) {
    const clubId = dataGenerator.generateUniqueId('PC'); // Player Club ID

    // Initialize facilities based on BASE_FACILITIES_PROPERTIES
    const initialFacilities = {};
    for (const key in BASE_FACILITIES_PROPERTIES) {
        initialFacilities[key] = { ...BASE_FACILITIES_PROPERTIES[key] }; // Deep copy
        // Calculate initial upgrade cost based on current level (initially level 1 cost for new facilities)
        initialFacilities[key].currentUpgradeCost = calculateUpgradeCost(initialFacilities[key].baseUpgradeCost, initialFacilities[key].level);
    }

    // Initialize committee members
    const initialCommittee = [
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.SEC),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.TREAS),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.GRNDS),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.SOC)
    ];

    return {
        id: clubId,
        name: details.clubName,
        nickname: details.nickname,
        location: details.hometown,
        kitColors: {
            primary: details.primaryColor,
            secondary: details.secondaryColor
        },
        finances: {
            balance: Constants.DEFAULT_STARTING_BALANCE,
            transactions: [] // Empty transaction log initially
        },
        facilities: initialFacilities,
        committee: initialCommittee,
        reputation: 10, // Initial reputation for grassroots club
        fanbase: 0, // Very small initial fanbase
        customizationHistory: { // Track if initial free changes used
            nameChanges: 0,
            colorChanges: 0
        }
    };
}

// --- Finance Management ---
/**
 * Adds a transaction to the club's finance log and updates the balance.
 * Returns a new finances object to be assigned back to gameState.
 * @param {object} currentFinances - The current finances object (from gameState.playerClub.finances).
 * @param {number} amount - The amount of the transaction (positive for income, negative for expense).
 * @param {string} type - The type of transaction (from Constants.TRANSACTION_TYPE).
 * @param {string} description - A short description of the transaction.
 * @returns {object} A new finances object with updated balance and transaction log.
 */
export function addTransaction(currentFinances, amount, type, description) {
    const newTransaction = {
        id: dataGenerator.generateUniqueId('TR'),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        type: type,
        description: description,
        amount: amount
    };

    const updatedTransactions = [...currentFinances.transactions, newTransaction];
    const newBalance = currentFinances.balance + amount;

    return {
        balance: newBalance,
        transactions: updatedTransactions
    };
}

// --- Facility Management ---
/**
 * Calculates the cost for the next upgrade level of a facility.
 * Cost increases with level.
 * @param {number} baseCost - The base cost of the facility upgrade.
 * @param {number} currentLevel - The current level of the facility.
 * @returns {number} The calculated upgrade cost.
 */
function calculateUpgradeCost(baseCost, currentLevel) {
    // Example: cost increases by 50% for each level
    return baseCost * Math.pow(1.5, currentLevel - 1); // currentLevel - 1 because baseCost is for level 1->2
}

/**
 * Attempts to upgrade a specific facility for the player's club.
 * Returns a new facilities object if successful, or the original if not.
 * Assumes finance check and deduction happens externally in main.js/gameLoop.
 * @param {object} currentFacilities - The current facilities object.
 * @param {string} facilityKey - The key of the facility to upgrade (from Constants.FACILITIES).
 * @returns {object|null} The updated facilities object if upgrade is possible, null otherwise.
 */
export function upgradeFacility(currentFacilities, facilityKey) {
    const facility = currentFacilities[facilityKey];

    if (!facility) {
        console.error(`Facility key "${facilityKey}" not found.`);
        return null;
    }
    if (facility.level >= facility.maxLevel) {
        console.warn(`${facility.name} is already at max level.`);
        return null;
    }

    // Create a deep copy to ensure immutability
    const updatedFacilities = JSON.parse(JSON.stringify(currentFacilities));
    const updatedFacility = updatedFacilities[facilityKey];

    updatedFacility.level++;
    updatedFacility.status = getFacilityStatusByLevel(facilityKey, updatedFacility.level);
    // Recalculate upgrade cost for the *next* level
    updatedFacility.currentUpgradeCost = calculateUpgradeCost(updatedFacility.baseUpgradeCost, updatedFacility.level);

    return updatedFacilities;
}

/**
 * Gets the descriptive status string for a facility based on its key and level.
 * @param {string} facilityKey - The key of the facility.
 * @param {number} level - The level of the facility.
 * @returns {string} The descriptive status.
 */
export function getFacilityStatusByLevel(facilityKey, level) {
    switch (facilityKey) {
        case Constants.FACILITIES.PITCH:
            return ['None', 'Unkempt Field', 'Basic Pitch', 'Good Pitch', 'Excellent Pitch', 'Pro-Grade Pitch'][level];
        case Constants.FACILITIES.CHGRMS:
            return ['None', 'Basic Hut', 'Small Rooms', 'Decent Rooms', 'Modern Facilities'][level];
        case Constants.FACILITIES.TOILETS:
            return ['None', 'Portable Toilets', 'Basic Toilet Block', 'Modern Toilets'][level];
        case Constants.FACILITIES.SNACKBAR:
            return ['None', 'Tea Hut', 'Basic Kiosk', 'Full Snack Bar'][level];
        case Constants.FACILITIES.COVERED_STAND:
            return ['None', 'Small Covered Area', 'Medium Covered Area'][level];
        case Constants.FACILITIES.TURNSTILES:
            return ['None', 'Basic Turnstile', 'Modern Turnstiles'][level];
        default:
            return `Level ${level}`;
    }
}

// --- Committee Management ---
/**
 * Adds a new committee member to the club's committee.
 * Returns a new committee array.
 * @param {Array<object>} currentCommittee - The current array of committee members.
 * @param {object} memberObject - The committee member object to add.
 * @returns {Array<object>} A new array with the added committee member.
 */
export function addCommitteeMember(currentCommittee, memberObject) {
    return [...currentCommittee, memberObject];
}

// --- Club Identity Management ---
/**
 * Updates the player club's name and nickname.
 * Returns a new club object with updated identity.
 * @param {object} currentPlayerClub - The current player club object.
 * @param {string} newName - The new club name.
 * @param {string} newNickname - The new club nickname.
 * @returns {object} A new player club object with updated identity.
 */
export function updateClubIdentity(currentPlayerClub, newName, newNickname) {
    const updatedClub = { ...currentPlayerClub };
    updatedClub.name = newName;
    updatedClub.nickname = newNickname;
    updatedClub.customizationHistory.nameChanges++;
    return updatedClub;
}

/**
 * Updates the player club's kit colors.
 * Returns a new club object with updated colors.
 * @param {object} currentPlayerClub - The current player club object.
 * @param {string} newPrimaryColor - The new primary kit color (hex).
 * @param {string} newSecondaryColor - The new secondary kit color (hex).
 * @returns {object} A new player club object with updated kit colors.
 */
export function updateClubKitColors(currentPlayerClub, newPrimaryColor, newSecondaryColor) {
    const updatedClub = { ...currentPlayerClub };
    updatedClub.kitColors = {
        primary: newPrimaryColor,
        secondary: newSecondaryColor
    };
    updatedClub.customizationHistory.colorChanges++;
    return updatedClub;
}

/**
 * Calculates the current total capacity of the club's ground.
 * @param {object} facilities - The facilities object.
 * @returns {number} The total current capacity.
 */
export function calculateTotalCapacity(facilities) {
    let totalCapacity = 0;
    // Initial basic standing capacity even without specific stands
    totalCapacity += 50; // Base capacity for a field

    if (facilities[Constants.FACILITIES.COVERED_STAND] && facilities[Constants.FACILITIES.COVERED_STAND].level > 0) {
        totalCapacity += facilities[Constants.FACILITIES.COVERED_STAND].capacityContribution * facilities[Constants.FACILITIES.COVERED_STAND].level;
    }
    // Add other facilities like seated stands here later
    return totalCapacity;
}

/**
 * Calculates the current total weekly maintenance cost for all facilities.
 * @param {object} facilities - The facilities object.
 * @returns {number} The total weekly maintenance cost.
 */
export function calculateTotalMaintenanceCost(facilities) {
    let totalCost = 0;
    for (const key in facilities) {
        const facility = facilities[key];
        // Only count maintenance for built facilities (level > 0)
        if (facility.level > 0) {
            totalCost += facility.maintenanceCost * facility.level; // Cost increases with level
        }
    }
    return totalCost;
}

/**
 * Calculates potential match day revenue based on facilities (snackbar, turnstiles).
 * @param {object} facilities - The facilities object.
 * @param {number} currentFanbase - The number of fans currently attending.
 * @returns {number} Estimated match day revenue.
 */
export function calculateMatchDayRevenue(facilities, currentFanbase) {
    let revenue = 0;

    // Revenue from snack bar
    if (facilities[Constants.FACILITIES.SNACKBAR] && facilities[Constants.FACILITIES.SNACKBAR].level > 0) {
        // Base revenue per match + bonus based on level and fanbase
        revenue += facilities[Constants.FACILITIES.SNACKBAR].revenuePerMatch * facilities[Constants.FACILITIES.SNACKBAR].level;
        revenue += (currentFanbase / 10) * facilities[Constants.FACILITIES.SNACKBAR].level; // Example: more fans, more revenue
    }

    // Revenue from tickets (only if turnstiles exist)
    if (facilities[Constants.FACILITIES.TURNSTILES] && facilities[Constants.FACILITIES.TURNSTILES].level > 0) {
        const ticketPrice = 3; // Example ticket price
        revenue += Math.min(currentFanbase, calculateTotalCapacity(facilities)) * ticketPrice;
    }

    return revenue;
}


