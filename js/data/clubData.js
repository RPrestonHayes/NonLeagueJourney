// js/data/clubData.js

/**
 * Manages all data related to the player's football club.
 * Provides functions for creating the club, managing finances,
 * facilities, and committee members.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';
import { getRandomInt } from '../utils/dataGenerator.js'; // Ensure getRandomInt is imported here

// --- Initial Club Setup Data ---

// Base properties for each facility, with their initial level, status, and base costs.
// Added grade, condition, decay, and degradation properties.
const BASE_FACILITIES_PROPERTIES = {
    [Constants.FACILITIES.PITCH]: {
        name: 'Pitch',
        level: 1, // 1: Unkempt Field, 2: Basic Pitch, ..., 5: Pro-Grade
        grade: 'G', // Initial grade
        condition: 60, // % 0-100
        maxCondition: 100,
        baseUpgradeCost: 200,
        maintenanceCost: 10, // Weekly running cost
        naturalImprovementPerWeek: 10, // Default improvement by Groundsman
        damagePerMatch: 50, // Max % damage per match if ignored
        degradeThreshold: 10, // Condition below which it's unplayable
        degradeWeeks: 4, // Weeks below condition to lose grade
        gradeReductionFactor: 0.5, // How much condition improves/degrades a grade
        capacityContribution: 0,
        conditionBelow50Weeks: 0, // Tracker for grade degradation
        isUsable: true // Can be set to false if condition is too low
    },
    [Constants.FACILITIES.CHGRMS]: {
        name: 'Changing Rooms',
        level: 1, // 1: Basic Hut, 2: Small Rooms, ...
        grade: 'F', // Initial grade (lowest without being non-existent)
        condition: 60,
        maxCondition: 100,
        baseUpgradeCost: 150,
        maintenanceCost: 5,
        naturalImprovementPerWeek: 0, // No natural improvement for cleaning, requires task
        damagePerMatch: 10, // Base % damage per match
        degradeThreshold: 10,
        degradeWeeks: 4,
        gradeReductionFactor: 0.5,
        capacityContribution: 0,
        conditionBelow50Weeks: 0,
        isUsable: true
    },
    [Constants.FACILITIES.TOILETS]: {
        name: 'Toilets',
        level: 0, // 0: None, 1: Basic Portables, ...
        grade: 'N/A', // No grade until built
        condition: 0,
        maxCondition: 100,
        baseUpgradeCost: 100,
        maintenanceCost: 3,
        naturalImprovementPerWeek: 0,
        damagePerMatch: 0,
        degradeThreshold: 10,
        degradeWeeks: 4,
        gradeReductionFactor: 0.5,
        capacityContribution: 0,
        conditionBelow50Weeks: 0,
        isUsable: true
    },
    [Constants.FACILITIES.SNACKBAR]: {
        name: 'Snack Bar',
        level: 0,
        grade: 'N/A',
        condition: 0,
        maxCondition: 100,
        baseUpgradeCost: 250,
        maintenanceCost: 8,
        naturalImprovementPerWeek: 0,
        damagePerMatch: 0,
        degradeThreshold: 10,
        degradeWeeks: 4,
        gradeReductionFactor: 0.5,
        capacityContribution: 0,
        revenuePerMatch: 15,
        conditionBelow50Weeks: 0,
        isUsable: true
    },
    [Constants.FACILITIES.COVERED_STAND]: {
        name: 'Covered Standing Area',
        level: 0,
        grade: 'N/A',
        condition: 0,
        maxCondition: 100,
        baseUpgradeCost: 300,
        maintenanceCost: 15,
        naturalImprovementPerWeek: 0,
        damagePerMatch: 0,
        degradeThreshold: 10,
        degradeWeeks: 4,
        gradeReductionFactor: 0.5,
        capacityContribution: 50,
        conditionBelow50Weeks: 0,
        isUsable: true
    },
    [Constants.FACILITIES.TURNSTILES]: {
        name: 'Turnstiles',
        level: 0,
        grade: 'N/A',
        condition: 0,
        maxCondition: 100,
        baseUpgradeCost: 120,
        maintenanceCost: 2,
        naturalImprovementPerWeek: 0,
        damagePerMatch: 0,
        degradeThreshold: 10,
        degradeWeeks: 4,
        gradeReductionFactor: 0.5,
        capacityContribution: 0,
        conditionBelow50Weeks: 0,
        isUsable: true
    }
};

let currentCommittee = [];

// --- Club Creation ---
export function createPlayerClub(details) {
    const clubId = dataGenerator.generateUniqueId('PC');

    const initialFacilities = {};
    for (const key in BASE_FACILITIES_PROPERTIES) {
        initialFacilities[key] = { ...BASE_FACILITIES_PROPERTIES[key] };
        // Ensure grade is set correctly for initial level. For level 0, no grade.
        if (initialFacilities[key].level === 0) {
            initialFacilities[key].grade = 'N/A';
            initialFacilities[key].condition = 0;
            initialFacilities[key].isUsable = false;
        } else {
            // Map initial level to a grade if grade is dynamic
            initialFacilities[key].grade = Constants.FACILITY_GRADES[initialFacilities[key].level]; // e.g. level 1 = F, level 2 = E etc.
        }
        initialFacilities[key].currentUpgradeCost = calculateUpgradeCost(initialFacilities[key].baseUpgradeCost, initialFacilities[key].level);
    }

    const initialCommittee = [
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.SEC),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.TREAS),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.GRNDS),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.SOC)
    ];
    currentCommittee = initialCommittee;

    return {
        id: clubId, name: details.clubName, nickname: details.nickname, location: details.hometown,
        kitColors: { primary: details.primaryColor, secondary: details.secondaryColor },
        finances: { balance: Constants.DEFAULT_STARTING_BALANCE, transactions: [] },
        facilities: initialFacilities,
        committee: initialCommittee,
        reputation: 10, fanbase: 0,
        customizationHistory: { nameChanges: 0, colorChanges: 0 },
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
        finalLeaguePosition: null
    };
}

// --- Finance Management ---
export function addTransaction(currentFinances, amount, type, description) {
    const newTransaction = {
        id: dataGenerator.generateUniqueId('TR'),
        date: new Date().toISOString().split('T')[0],
        type: type, description: description, amount: amount
    };
    const updatedTransactions = [...currentFinances.transactions, newTransaction];
    const newBalance = currentFinances.balance + amount;
    return { balance: newBalance, transactions: updatedTransactions };
}

// --- Facility Management ---
function calculateUpgradeCost(baseCost, currentLevel) {
    return baseCost * Math.pow(1.5, currentLevel); // Cost for Level 0->1 is baseCost * 1.5^0. For 1->2 is baseCost * 1.5^1.
}

export function upgradeFacility(currentFacilities, facilityKey) {
    const facility = currentFacilities[facilityKey];
    if (!facility) { console.error(`Facility key "${facilityKey}" not found.`); return null; }
    if (facility.level >= (Constants.FACILITY_GRADES.length - 1)) { // Max level is tied to number of grades
        console.warn(`${facility.name} is already at max level.`);
        return null;
    }

    const updatedFacilities = JSON.parse(JSON.stringify(currentFacilities));
    const updatedFacility = updatedFacilities[facilityKey];

    updatedFacility.level++;
    updatedFacility.grade = Constants.FACILITY_GRADES[updatedFacility.level]; // Update grade based on new level
    updatedFacility.status = getFacilityStatusByLevel(facilityKey, updatedFacility.level);
    updatedFacility.currentUpgradeCost = calculateUpgradeCost(updatedFacility.baseUpgradeCost, updatedFacility.level);
    updatedFacility.isUsable = true; // Mark as usable once built/upgraded
    updatedFacility.condition = Math.min(updatedFacility.maxCondition, updatedFacility.condition + 20); // Small condition boost on upgrade

    return updatedFacilities;
}

export function getFacilityStatusByLevel(facilityKey, level) {
    switch (facilityKey) {
        case Constants.FACILITIES.PITCH:
            return ['Non-Existent', 'Unkempt Field', 'Basic Pitch', 'Good Pitch', 'Excellent Pitch', 'Pro-Grade Pitch'][level];
        case Constants.FACILITIES.CHGRMS:
            return ['Non-Existent', 'Basic Hut', 'Small Rooms', 'Decent Rooms', 'Modern Facilities'][level];
        case Constants.FACILITIES.TOILETS:
            return ['Non-Existent', 'Portable Toilets', 'Basic Toilet Block', 'Modern Toilets'][level];
        case Constants.FACILITIES.SNACKBAR:
            return ['Non-Existent', 'Tea Hut', 'Basic Kiosk', 'Full Snack Bar'][level];
        case Constants.FACILITIES.COVERED_STAND:
            return ['Non-Existent', 'Small Covered Area', 'Medium Covered Area', 'Large Covered Area'][level];
        case Constants.FACILITIES.TURNSTILES:
            return ['Non-Existent', 'Basic Turnstile', 'Modern Turnstiles'][level];
        default:
            return `Level ${level}`;
    }
}

/**
 * Updates a facility's condition.
 * @param {object} currentFacilities - The current facilities object.
 * @param {string} facilityKey - The key of the facility.
 * @param {number} change - The amount to change condition by (positive for improve, negative for degrade).
 * @returns {object} Updated facilities object.
 */
export function updateFacilityCondition(currentFacilities, facilityKey, change) {
    const updatedFacilities = JSON.parse(JSON.stringify(currentFacilities));
    const facility = updatedFacilities[facilityKey];

    if (!facility || facility.level === 0) return currentFacilities; // Cannot change condition of non-existent facility

    facility.condition = Math.max(0, Math.min(facility.maxCondition, facility.condition + change));

    // Update usability based on threshold
    facility.isUsable = facility.condition >= facility.degradeThreshold;

    // Manage conditionBelow50Weeks for grade degradation
    if (facility.condition < 50) {
        facility.conditionBelow50Weeks++;
    } else {
        facility.conditionBelow50Weeks = 0;
    }

    return updatedFacilities;
}

/**
 * Attempts to degrade a facility's grade if its condition is persistently low.
 * @param {object} currentFacilities - The current facilities object.
 * @param {string} facilityKey - The key of the facility.
 * @returns {object|null} Updated facilities object if grade changed, null otherwise.
 */
export function degradeFacilityGrade(currentFacilities, facilityKey) {
    const updatedFacilities = JSON.parse(JSON.stringify(currentFacilities));
    const facility = updatedFacilities[facilityKey];

    if (!facility || facility.level <= 1 || facility.conditionBelow50Weeks < facility.degradeWeeks) {
        return null; // Cannot degrade if at lowest level 1, or condition not persistently low
    }

    // Degrade grade and reset conditionWeeks counter
    facility.level = Math.max(1, facility.level - 1); // Grade cannot go below level 1
    facility.grade = Constants.FACILITY_GRADES[facility.level];
    facility.status = getFacilityStatusByLevel(facilityKey, facility.level);
    facility.conditionBelow50Weeks = 0; // Reset counter after degradation

    return updatedFacilities;
}


// --- Committee Management ---
export function setCommittee(committee) {
    currentCommittee = [...committee];
    console.log("Committee set/updated in clubData module.");
}

export function getCommittee() {
    return [...currentCommittee];
}

export function addCommitteeMember(currentCommitteeArray, memberObject) {
    currentCommittee = [...currentCommitteeArray, memberObject];
    return currentCommittee;
}

// --- Club Identity Management ---
export function updateClubIdentity(currentPlayerClub, newName, newNickname) {
    const updatedClub = { ...currentPlayerClub };
    updatedClub.name = newName;
    updatedClub.nickname = newNickname;
    updatedClub.customizationHistory.nameChanges++;
    return updatedClub;
}

export function updateClubKitColors(currentPlayerClub, newPrimaryColor, newSecondaryColor) {
    const updatedClub = { ...currentPlayerClub };
    updatedClub.kitColors = { primary: newPrimaryColor, secondary: newSecondaryColor };
    updatedClub.customizationHistory.colorChanges++;
    return updatedClub;
}

export function calculateTotalCapacity(facilities) {
    let totalCapacity = 0;
    totalCapacity += 50; // Base capacity for a field

    if (facilities[Constants.FACILITIES.COVERED_STAND] && facilities[Constants.FACILITIES.COVERED_STAND].level > 0) {
        totalCapacity += facilities[Constants.FACILITIES.COVERED_STAND].capacityContribution * facilities[Constants.FACILITIES.COVERED_STAND].level;
    }
    return totalCapacity;
}

export function calculateTotalMaintenanceCost(facilities) {
    let totalCost = 0;
    for (const key in facilities) {
        const facility = facilities[key];
        // Only count maintenance for built and non-zero level facilities
        if (facility.level > 0) {
            totalCost += facility.maintenanceCost * facility.level;
        }
    }
    return totalCost;
}

export function calculateMatchDayRevenue(facilities, currentFanbase) {
    let revenue = 0;

    if (facilities[Constants.FACILITIES.SNACKBAR] && facilities[Constants.FACILITIES.SNACKBAR].level > 0) {
        revenue += facilities[Constants.FACILITIES.SNACKBAR].revenuePerMatch * facilities[Constants.FACILITIES.SNACKBAR].level;
        revenue += (currentFanbase / 10) * facilities[Constants.FACILITIES.SNACKBAR].level;
    }

    if (facilities[Constants.FACILITIES.TURNSTILES] && facilities[Constants.FACILITIES.TURNSTILES].level > 0) {
        const ticketPrice = 3;
        revenue += Math.min(currentFanbase, calculateTotalCapacity(facilities)) * ticketPrice;
    }

    return revenue;
}

