// js/data/clubData.js

/**
 * Manages all data related to the player's football club.
 * Provides functions for creating the club, managing finances,
 * facilities, and committee members.
 */

import * as Constants from '../utils/constants.js';
import * as dataGenerator from '../utils/dataGenerator.js';
import { getRandomInt } from '../utils/dataGenerator.js';

// --- Initial Club Setup Data ---

// Base properties for each facility, with their initial level, status, and base costs.
// Added grade, condition, decay, and degradation properties.
const BASE_FACILITIES_PROPERTIES = {
    [Constants.FACILITIES.PITCH]: {
        name: Constants.FACILITIES.PITCH,
        level: 1, // Level 1 is Grade G
        grade: 'G', // Initial grade
        condition: 60, // % 0-100
        maxCondition: 100,
        baseUpgradeCost: 200, // Cost for Level 1->2 (Grade G->F)
        maintenanceCost: 10, // Weekly running cost (applied in gameLoop)
        naturalImprovementPerWeek: 10, // Default improvement by Groundsman (applied in gameLoop)
        damagePerMatch: 50, // Max % damage per match if ignored (applied in gameLoop)
        conditionDegradeThreshold: 50, // Condition below which 'conditionBelow50Weeks' starts counting
        degradeWeeks: 4, // Weeks below conditionDegradeThreshold to lose grade
        conditionBelow50Weeks: 0, // Tracker for grade degradation
        isUsable: true // Can be set to false if condition is too low (e.g., Pitch unplayable)
    },
    [Constants.FACILITIES.CHGRMS]: {
        name: Constants.FACILITIES.CHGRMS,
        level: 1, // Level 1 is Grade F
        grade: 'F',
        condition: 60,
        maxCondition: 100,
        baseUpgradeCost: 150,
        maintenanceCost: 5,
        naturalImprovementPerWeek: 0, // No natural improvement for cleaning, requires task
        damagePerMatch: 10, // Base % damage per match from player use
        conditionDegradeThreshold: 50,
        degradeWeeks: 4,
        conditionBelow50Weeks: 0,
        isUsable: true
    },
    [Constants.FACILITIES.TOILETS]: {
        name: Constants.FACILITIES.TOILETS,
        level: 0, // 0: Not Built
        grade: Constants.FACILITY_GRADES[0], // 'N/A'
        condition: 0, maxCondition: 100, baseUpgradeCost: 100, maintenanceCost: 3,
        naturalImprovementPerWeek: 0, damagePerMatch: 0, conditionDegradeThreshold: 50, degradeWeeks: 4,
        conditionBelow50Weeks: 0, isUsable: false // Not usable until built
    },
    [Constants.FACILITIES.SNACKBAR]: {
        name: Constants.FACILITIES.SNACKBAR,
        level: 0,
        grade: Constants.FACILITY_GRADES[0], // 'N/A'
        condition: 0, maxCondition: 100, baseUpgradeCost: 250, maintenanceCost: 8,
        naturalImprovementPerWeek: 0, damagePerMatch: 0, conditionDegradeThreshold: 50, degradeWeeks: 4,
        conditionBelow50Weeks: 0, isUsable: false, revenuePerMatch: 15
    },
    [Constants.FACILITIES.COVERED_STAND]: {
        name: Constants.FACILITIES.COVERED_STAND,
        level: 0,
        grade: Constants.FACILITY_GRADES[0], // 'N/A'
        condition: 0, maxCondition: 100, baseUpgradeCost: 300, maintenanceCost: 15,
        naturalImprovementPerWeek: 0, damagePerMatch: 0, conditionDegradeThreshold: 50, degradeWeeks: 4,
        conditionBelow50Weeks: 0, isUsable: false, capacityContribution: 50
    },
    [Constants.FACILITIES.TURNSTILES]: {
        name: Constants.FACILITIES.TURNSTILES,
        level: 0,
        grade: Constants.FACILITY_GRADES[0], // 'N/A'
        condition: 0, maxCondition: 100, baseUpgradeCost: 120, maintenanceCost: 2,
        naturalImprovementPerWeek: 0, damagePerMatch: 0, conditionDegradeThreshold: 50, degradeWeeks: 4,
        conditionBelow50Weeks: 0, isUsable: false
    }
};

let currentCommittee = [];
let currentFinances = {}; // This is no longer the primary finance object, it's part of playerClub

// --- NEW: Initializer functions for playerClub properties ---

/**
 * Creates the initial facilities object for a new club.
 * @returns {object} The initial facilities state.
 */
export function createInitialFacilities() {
    const initialFacilities = {};
    for (const key in BASE_FACILITIES_PROPERTIES) {
        initialFacilities[key] = { ...BASE_FACILITIES_PROPERTIES[key] };
        
        if (initialFacilities[key].level === 0) {
            initialFacilities[key].grade = Constants.FACILITY_GRADES[0];
            initialFacilities[key].status = getFacilityStatusByLevel(key, 0);
            initialFacilities[key].condition = 0;
            initialFacilities[key].isUsable = false;
            initialFacilities[key].currentUpgradeCost = initialFacilities[key].baseUpgradeCost;
        } else {
            initialFacilities[key].grade = Constants.FACILITY_GRADES[initialFacilities[key].level];
            initialFacilities[key].status = getFacilityStatusByLevel(key, initialFacilities[key].level);
            initialFacilities[key].currentUpgradeCost = calculateUpgradeCost(initialFacilities[key].baseUpgradeCost, initialFacilities[key].level);
        }
    }
    return initialFacilities;
}

/**
 * Creates the initial committee members for a new club.
 * @returns {Array<object>} An array of initial committee members.
 */
export function createInitialCommittee() {
    const initialCommitteeMembers = [
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.SEC),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.TREAS),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.GRNDS),
        dataGenerator.generateCommitteeMember(Constants.COMMITTEE_ROLES.SOC)
    ];
    currentCommittee = initialCommitteeMembers; // Update internal reference
    return initialCommitteeMembers;
}


// --- Club Creation (now just a template, actual club object built in main.js/dataGenerator) ---
// This function is now deprecated as the player club is created within generateRegionalClubPool
export function createPlayerClub(details) {
    console.warn("createPlayerClub is deprecated. Player club is now created in generateRegionalClubPool.");
    // This function is kept for compatibility but its role is diminished.
    // It will return a basic structure.
    return {
        id: dataGenerator.generateUniqueId('PC'),
        name: details.clubName, nickname: details.nickname,
        location: details.hometown,
        groundPostcode: details.groundPostcode,
        county: details.county,
        kitColors: { primary: details.primaryColor, secondary: details.secondaryColor },
        finances: { balance: Constants.DEFAULT_STARTING_BALANCE, transactions: [] },
        facilities: createInitialFacilities(),
        committee: createInitialCommittee(),
        reputation: 10, fanbase: 0,
        customizationHistory: { nameChanges: 0, colorChanges: 0 },
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
        finalLeaguePosition: null,
        squad: [],
        initialSeedQuality: Constants.NUM_REGIONAL_CLUBS, // Default to lowest if created via this deprecated function
        potentialLeagueLevel: Constants.LEAGUE_TIERS.DIV2.level // Default to lowest league
    };
}

// --- Finance Management ---
export function addTransaction(currentFinancesState, amount, type, description) {
    const newTransaction = {
        id: dataGenerator.generateUniqueId('TR'),
        date: new Date().toISOString().split('T')[0],
        type: type, description: description, amount: amount
    };
    const updatedTransactions = [...currentFinancesState.transactions, newTransaction];
    const newBalance = currentFinancesState.balance + amount;
    currentFinances = { balance: newBalance, transactions: updatedTransactions }; // Update internal reference
    return currentFinances;
}

export function getFinances() {
    return { ...currentFinances }; // Returns a copy of the internal reference
}


// --- Facility Management ---
function calculateUpgradeCost(baseCost, currentLevel) {
    return baseCost * Math.pow(1.5, currentLevel);
}

export function upgradeFacility(currentFacilitiesState, facilityKey) {
    const facility = currentFacilitiesState[facilityKey];
    if (!facility) { console.error(`Facility key "${facilityKey}" not found.`); return null; }
    if (facility.level >= (Constants.FACILITY_GRADES.length - 1)) {
        console.warn(`${facility.name} is already at max level.`);
        return null;
    }

    const updatedFacilities = JSON.parse(JSON.stringify(currentFacilitiesState));
    const updatedFacility = updatedFacilities[facilityKey];

    updatedFacility.level++;
    updatedFacility.grade = Constants.FACILITY_GRADES[updatedFacility.level];
    updatedFacility.status = getFacilityStatusByLevel(facilityKey, updatedFacility.level);
    updatedFacility.currentUpgradeCost = calculateUpgradeCost(updatedFacility.baseUpgradeCost, updatedFacility.level);
    updatedFacility.isUsable = true;
    updatedFacility.condition = Math.min(updatedFacility.maxCondition, updatedFacility.condition + 20);

    return updatedFacilities;
}

export function getFacilityStatusByLevel(facilityKey, level) {
    switch (facilityKey) {
        case Constants.FACILITIES.PITCH: return ['Not Built', 'Unkempt Field', 'Basic Pitch', 'Good Pitch', 'Excellent Pitch', 'Pro-Grade Pitch'][level];
        case Constants.FACILITIES.CHGRMS: return ['Not Built', 'Basic Hut', 'Small Rooms', 'Decent Rooms', 'Modern Facilities'][level];
        case Constants.FACILITIES.TOILETS: return ['Not Built', 'Portable Toilets', 'Basic Toilet Block', 'Modern Toilets'][level];
        case Constants.FACILITIES.SNACKBAR: return ['Not Built', 'Tea Hut', 'Basic Kiosk', 'Full Snack Bar'][level];
        case Constants.FACILITIES.COVERED_STAND: return ['Not Built', 'Small Covered Area', 'Medium Covered Area', 'Large Covered Area'][level];
        case Constants.FACILITIES.TURNSTILES: return ['Not Built', 'Basic Turnstile', 'Modern Turnstiles'][level];
        default: return `Level ${level}`;
    }
}

export function updateFacilityCondition(currentFacilitiesState, facilityKey, change) {
    const updatedFacilities = JSON.parse(JSON.stringify(currentFacilitiesState));
    const facility = updatedFacilities[facilityKey];

    if (!facility || facility.level === 0) return currentFacilitiesState;

    const oldCondition = facility.condition;
    facility.condition = Math.max(0, Math.min(facility.maxCondition, facility.condition + change));

    if (facilityKey === Constants.FACILITIES.PITCH) {
        facility.isUsable = facility.condition >= Constants.PITCH_UNPLAYABLE_THRESHOLD;
        if (!facility.isUsable && oldCondition >= Constants.PITCH_UNPLAYABLE_THRESHOLD) {
            console.log(`DEBUG: Pitch became unplayable! Condition: ${facility.condition}`);
        } else if (facility.isUsable && oldCondition < Constants.PITCH_UNPLAYABLE_THRESHOLD) {
             console.log(`DEBUG: Pitch became playable! Condition: ${facility.condition}`);
        }
    } else {
        facility.isUsable = facility.condition > 0;
    }

    if (facility.condition < facility.conditionDegradeThreshold) {
        facility.conditionBelow50Weeks++;
    } else {
        facility.conditionBelow50Weeks = 0;
    }

    return updatedFacilities;
}

export function degradeFacilityGrade(currentFacilitiesState, facilityKey) {
    const updatedFacilities = JSON.parse(JSON.stringify(currentFacilitiesState));
    const facility = updatedFacilities[facilityKey];

    if (!facility || facility.level <= 1 || facility.conditionBelow50Weeks < facility.degradeWeeks) {
        return null;
    }

    if (facility.condition < facility.conditionDegradeThreshold) {
        facility.level = Math.max(1, facility.level - 1);
        facility.grade = Constants.FACILITY_GRADES[facility.level];
        facility.status = getFacilityStatusByLevel(facilityKey, facility.level);
        facility.conditionBelow50Weeks = 0;
        console.log(`DEBUG: ${facility.name} degraded to Grade ${facility.grade}`);
        return updatedFacilities;
    }
    return null;
}


// --- Committee Management ---
export function setCommittee(committee) {
    currentCommittee = [...(committee || [])]; // Ensure it's always an array
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
    totalCapacity += 50;

    if (facilities[Constants.FACILITIES.COVERED_STAND] && facilities[Constants.FACILITIES.COVERED_STAND].level > 0) {
        totalCapacity += facilities[Constants.FACILITIES.COVERED_STAND].capacityContribution * facilities[Constants.FACILITIES.COVERED_STAND].level;
    }
    return totalCapacity;
}

export function calculateTotalMaintenanceCost(facilities) {
    let totalCost = 0;
    for (const key in facilities) {
        const facility = facilities[key];
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
