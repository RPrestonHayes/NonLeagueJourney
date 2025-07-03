// js/utils/dataGenerator.js

/**
 * Provides functions for generating various game data entities.
 * Includes initial player generation, club names, committee members, and weekly tasks.
 */

import * as Constants from './constants.js';
import { UK_COUNTIES_DATA } from '../data/CountiesData.js'; // Import the new CountiesData

// --- Helper Functions for Randomness ---
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomName(type = 'first') {
    const firstNames = ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan', 'Jackson', 'Sebastian', 'Mateo', 'Jack', 'Aiden', 'Owen', 'Samuel', 'David', 'Joseph', 'Julian', 'Gabriel', 'John', 'Wyatt', 'Carter', 'Luke', 'Harry', 'George', 'Charlie', 'Oscar', 'Leo', 'Arthur', 'Freddie', 'Archie', 'Noah', 'Theo', 'Finley', 'Lewis', 'Reggie', 'Bobby', 'Frankie', 'Louie', 'Ronnie', 'Alfie', 'Ralph'];
    const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Roberts', 'Lewis', 'Walker', 'Hall', 'Wright', 'Green', 'Edwards', 'Hughes', 'Jackson', 'Clarke', 'Phillips', 'Cook', 'Miller', 'Shaw', 'Bell', 'Baker', 'Morgan', 'Young', 'Scott', 'Pugh', 'Cole', 'Harrison', 'Taylor', 'Wilson', 'Burgess', 'Bennett', 'Chapman', 'Dawson', 'Ellis', 'Fisher', 'Grant', 'Hayes', 'Jenkins', 'King', 'Lowe', 'Marsh', 'Newman', 'Palmer', 'Quinn', 'Richards', 'Stevens', 'Turner'];
    if (type === 'first') return getRandomElement(firstNames);
    return getRandomElement(lastNames);
}

// --- Unique ID Generator ---
let nextPlayerId = 1;
let nextClubId = 1;
let nextCommitteeId = 1;
let nextTaskId = 1;
let nextTransactionId = 1;
let nextLeagueId = 1;
let nextMatchId = 1;

export function generateUniqueId(prefix) {
    switch (prefix) {
        case 'P': return `P${nextPlayerId++}`;
        case 'C': return `C${nextClubId++}`;
        case 'CM': return `CM${nextCommitteeId++}`;
        case 'T': return `T${nextTaskId++}`;
        case 'TR': return `TR${nextTransactionId++}`;
        case 'L': return `L${nextLeagueId++}`;
        case 'M': return `M${nextMatchId++}`;
        default: return `${prefix}${Date.now()}${getRandomInt(0, 999)}`;
    }
}

// --- Player Generation ---
export function generatePlayer(position = null, qualityTier = 1) {
    const id = generateUniqueId('P');
    const age = getRandomInt(18, 35);
    const firstName = getRandomName('first');
    const lastName = getRandomName('last');
    const preferredFoot = getRandomElement(['Left', 'Right', 'Both']);

    if (!position) { position = getRandomElement(Object.values(Constants.PLAYER_POSITIONS)); }

    const baseAttr = getRandomInt(Constants.ATTRIBUTE_MIN + (qualityTier - 1) * 2, Constants.ATTRIBUTE_MIN + qualityTier * 2);
    const attributes = {};
    for (const attrKey in Constants.PLAYER_ATTRIBUTES) {
        let value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr - 3), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 3));
        if (position === Constants.PLAYER_POSITIONS.GK) {
            if (attrKey === 'GK') value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 5), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 8));
            else value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr - 5), Math.min(Constants.ATTRIBUTE_MAX, baseAttr));
        } else if (position === Constants.PLAYER_POSITIONS.ST && attrKey === 'SHO') { value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 2), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 5)); }
        else if (position === Constants.PLAYER_POSITIONS.CB && attrKey === 'TKL') { value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 2), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 5)); }
        else if (position === Constants.PLAYER_POSITIONS.CM && attrKey === 'PAS') { value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 2), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 5)); }
        attributes[attrKey] = value;
    }

    const morale = getRandomInt(60, 90);
    const commitment = getRandomElement(['High', 'Medium', 'Low']);

    return {
        id: id, name: `${firstName} ${lastName}`, age: age, preferredPosition: position,
        secondaryPosition: getRandomElement([null, getRandomElement(Object.values(Constants.PLAYER_POSITIONS).filter(p => p !== position))]),
        foot: preferredFoot, height: getRandomInt(170, 195), nationality: 'English', currentClubId: null,
        attributes: attributes,
        traits: { ambition: getRandomInt(1, 10), loyalty: getRandomInt(10, 20), temperament: getRandomInt(1, 10), professionalism: getRandomInt(5, 15), commitmentLevel: commitment },
        currentSeasonStats: { appearances: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, manOfTheMatchAwards: 0, averageRating: 0 },
        status: { morale: morale, fitness: 100, injuryStatus: 'Fit', injuryReturnDate: null, suspended: false, suspensionGames: 0 }
    };
}

// --- Postcode/Location Lookup ---
/**
 * Finds the county data based on a postcode prefix.
 * @param {string} postcode - The full postcode (e.g., "LE12 7TF").
 * @returns {object|null} The matching county data object, or null if not found.
 */
export function getCountyDataFromPostcode(postcode) {
    if (!postcode || typeof postcode !== 'string') return null;

    // Normalize postcode to get the outward code (e.g., "LE12")
    const cleanedPostcode = postcode.toUpperCase().replace(/\s/g, '');
    let outwardCode = '';

    // Common UK postcode formats: AA9A 9AA, A9A 9AA, A9 9AA, A99 9AA, AA9 9AA, AA99 9AA
    // We need the part before the space, or the first 2-4 characters.
    const postcodeMatch = cleanedPostcode.match(/^([A-Z]{1,2}[0-9]{1,2}[A-Z]?)/);
    if (postcodeMatch && postcodeMatch[1]) {
        outwardCode = postcodeMatch[1];
    } else {
        // Fallback for less common or malformed postcodes, try first 2 chars
        outwardCode = cleanedPostcode.substring(0, 2);
    }

    // Find the county based on the postcode prefix
    for (const countyData of UK_COUNTIES_DATA) {
        if (countyData.postcodePrefixes.some(prefix => outwardCode.startsWith(prefix))) {
            return countyData;
        }
    }

    // Fallback if no specific postcode prefix match
    // Try to find a county by matching the town name directly if provided in the playerClubDetails.hometown
    // Or set a default. This logic is handled in main.js if playerCountyData is null.
    return null;
}


// --- Club Name Generation (for opponents) ---
/**
 * Generates a club identity (name and nickname) based on a given region.
 * Includes logic for color-based and reserve/youth team nicknames.
 * @param {object} baseLocationRegion - The county data object for the base location.
 * @returns {object} An object { name: string, nickname: string }.
 */
export function generateClubIdentity(baseLocationRegion) {
    const townsInRegion = baseLocationRegion.towns;

    const suffixes = ['United', 'Rovers', 'Athletic', 'Town', 'City', 'Wanderers', 'Victoria', 'Amateurs', 'Corinthians', 'Sports', 'Albion', 'Park', 'FC', 'County', 'District'];
    const prefixes = ['', 'East ', 'West ', 'North ', 'South ', 'Royal ', 'Old ', 'Young ', 'St. ', 'AFC '];
    const middleWords = ['Park', 'Lane', 'Bridge', 'Field', 'Brook', 'Grange', 'Vale', 'Heath', 'Green', 'Spring', 'Heights', 'Wood', 'Hill', 'Central', 'Abbey', 'Grove', 'Meadow'];
    const genericNicknames = ['The Reds', 'The Blues', 'The Whites', 'The Blacks', 'The Brewers', 'The Villagers', 'The Foxes', 'The Lions', 'The Pigeons', 'The Swans', 'The Robins', 'The Tigers', 'The Hornets', 'The Mariners', 'The Millers', 'The Railwaymen', 'The Oaks', 'The Pilgrims'];

    let clubNameParts = [];
    let chosenLocation = getRandomElement(townsInRegion); // Pick a town from the selected region

    const structureRoll = getRandomInt(1, 100);

    // Prioritize single-location names to avoid geographically illogical combinations
    if (structureRoll <= 60) { // Increased chance for single-location names
        clubNameParts.push(chosenLocation);
        clubNameParts.push(getRandomElement(suffixes));
    } else if (structureRoll <= 85) { // Still good chance for simple Town/City names
        clubNameParts.push(chosenLocation);
        clubNameParts.push(getRandomElement(['Town', 'City', 'United', 'Athletic']));
    } else if (structureRoll <= 95) { // Reduced chance for middle-word names
        clubNameParts.push(chosenLocation);
        clubNameParts.push(getRandomElement(middleWords));
        clubNameParts.push(getRandomElement(suffixes));
    } else { // Lowest chance for prefixed names
        clubNameParts.push(getRandomElement(prefixes));
        clubNameParts.push(chosenLocation);
        clubNameParts.push(getRandomElement(suffixes));
    }

    let finalClubName = clubNameParts.filter(part => part.trim() !== '').join(' ').trim();

    // Ensure at least two words for common club naming conventions if it ends up too short
    if (finalClubName.split(' ').length < 2) {
        finalClubName = `${chosenLocation} ${getRandomElement(suffixes)}`;
    }

    // Further refine combination names, making them less frequent and ensuring distinct towns
    // Removed specific combination logic to avoid geographically illogical combinations
    // The current logic prioritizes single-location names and avoids combining unrelated towns.


    let clubNickname = getRandomElement(genericNicknames); // Start with a generic nickname

    // --- Nickname Overrides based on Club Name ---

    // 1. Color-based nicknames
    const colorKeywords = {
        'Red': ['Red', 'Scarlet', 'Crimson', 'Ruby'],
        'Blue': ['Blue', 'Azure', 'Navy', 'Sky'],
        'Green': ['Green', 'Emerald', 'Lime', 'Forest'],
        'White': ['White', 'Lilywhite', 'Snow'],
        'Black': ['Black', 'Ebony', 'Jet'],
        'Yellow': ['Yellow', 'Gold', 'Amber'],
        'Purple': ['Purple', 'Violet', 'Lavender'],
        'Orange': ['Orange', 'Tangerine'],
        'Silver': ['Silver', 'Grey'],
        'Maroon': ['Maroon']
    };

    for (const colorName in colorKeywords) {
        const keywords = colorKeywords[colorName];
        if (keywords.some(keyword => finalClubName.toLowerCase().includes(keyword.toLowerCase()))) {
            clubNickname = `The ${colorName}s`;
            break; // Found a color, apply and exit
        }
    }

    // 2. Reserve/Youth team nicknames
    if (finalClubName.toLowerCase().includes('reserves') || finalClubName.toLowerCase().includes('u23s')) {
        clubNickname = getRandomElement(['Reserves', 'The Ressies', 'Old Boys']);
    } else if (finalClubName.toLowerCase().includes('youth') || finalClubName.toLowerCase().includes('development') || finalClubName.toLowerCase().includes('juniors')) {
        clubNickname = getRandomElement(['Juniors', 'Young Boys', 'The Future', 'Development Squad']);
    }


    return { name: finalClubName.trim(), nickname: clubNickname };
}

/**
 * Generates the initial pool of all regional clubs (AI + Player) with assigned seed qualities.
 * @param {object} playerCountyData - The county data object for the player's chosen location.
 * @param {object} playerClubDetails - Details of the player's club (id, name, nickname, kitColors).
 * @returns {Array<object>} An array of all 60 club objects, including the player's, with seed qualities.
 */
export function generateRegionalClubPool(playerCountyData, playerClubDetails) {
    const allClubs = [];
    const townsPool = [...playerCountyData.towns];

    // Create AI clubs first, assign seeds 1 to 59
    for (let i = 0; i < Constants.NUM_REGIONAL_CLUBS - 1; i++) {
        const id = generateUniqueId('C');
        let identity = generateClubIdentity(playerCountyData);
        let name = identity.name;
        let nickname = identity.nickname;
        const kitColors = generateKitColors();

        // Assign initialSeedQuality (1 is best, 59 is worst AI)
        const initialSeedQuality = i + 1; // 1 to 59

        // Overall Team Quality (higher for better seeds)
        // Scale quality from 20 (best seed 1) down to 5 (worst AI seed 59)
        const overallTeamQuality = Math.max(5, Math.round(20 - (initialSeedQuality - 1) * (15 / (Constants.NUM_REGIONAL_CLUBS - 2))));

        // Add a chance for "reserve" teams from major towns in the region
        if (getRandomInt(1, 100) < 30 && townsPool.length > 0) {
            const majorTownCandidates = townsPool.filter(t => t.length > 7 || ['Leicester', 'Nottingham', 'Derby', 'Birmingham', 'Sheffield', 'Manchester', 'Liverpool', 'Leeds', 'Bristol', 'Newcastle'].includes(t));
            const majorTown = getRandomElement(majorTownCandidates.length > 0 ? majorTownCandidates : townsPool);
            
            if (majorTown) {
                name = `${majorTown} ${getRandomElement(['Reserves', 'U23s', 'Development Squad'])}`;
            }
        }

        allClubs.push({
            id: id, name: name, location: getRandomElement(townsPool), nickname: nickname, kitColors: kitColors,
            overallTeamQuality: overallTeamQuality,
            currentLeagueId: null, finalLeaguePosition: null, // These will be set by leagueData
            leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
            inCup: true, // Assume all initial clubs are eligible for the cup
            eliminatedFromCup: false,
            initialSeedQuality: initialSeedQuality, // Store the seed for sorting into leagues
            potentialLeagueLevel: 0, // Will be set by leagueData based on tier
            customizationStatus: Constants.CLUB_CUSTOMIZATION_STATUS.NOT_CUSTOMIZED // NEW: Default to not customized
        });
    }

    // Add Player's Club as the lowest seed (60)
    allClubs.push({
        id: playerClubDetails.id,
        name: playerClubDetails.clubName,
        location: playerClubDetails.hometown,
        nickname: playerClubDetails.nickname,
        kitColors: playerClubDetails.kitColors,
        overallTeamQuality: getRandomInt(1, 5), // Player club starts at lowest quality
        currentLeagueId: null,
        finalLeaguePosition: null,
        leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
        inCup: true,
        eliminatedFromCup: false,
        initialSeedQuality: Constants.NUM_REGIONAL_CLUBS, // Player is the last seed
        potentialLeagueLevel: 0, // Will be set by leagueData based on tier
        customizationStatus: Constants.CLUB_CUSTOMIZATION_STATUS.CUSTOMIZED_ONCE // NEW: Player's club is customized by default
    });

    console.log(`Generated ${allClubs.length} regional clubs.`);
    return allClubs;
}


// --- Committee Member Generation ---
export function generateCommitteeMember(role) {
    const id = generateUniqueId('CM');
    const firstName = getRandomName('first');
    const lastName = getRandomName('last');
    const age = getRandomInt(30, 70);

    const commonSkills = {
        administration: getRandomInt(5, 15), financialAcumen: getRandomInt(5, 15),
        groundsKeepingSkill: getRandomInt(5, 15), communityRelations: getRandomInt(5, 15),
        influence: getRandomInt(5, 15), initiative: getRandomInt(5, 15),
        workEthic: getRandomInt(5, 15), resistanceToChange: getRandomInt(1, 10)
    };

    switch (role) {
        case Constants.COMMITTEE_ROLES.SEC: commonSkills.administration = getRandomInt(10, 20); commonSkills.workEthic = getRandomInt(10, 20); break;
        case Constants.COMMITTEE_ROLES.TREAS: commonSkills.financialAcumen = getRandomInt(10, 20); commonSkills.administration = getRandomInt(8, 18); break;
        case Constants.COMMITTEE_ROLES.GRNDS: commonSkills.groundsKeepingSkill = getRandomInt(10, 20); commonSkills.workEthic = getRandomInt(10, 20); commonSkills.resistanceToChange = getRandomInt(5, 15); break;
        case Constants.COMMITTEE_ROLES.SOC: commonSkills.communityRelations = getRandomInt(10, 20); commonSkills.initiative = getRandomInt(10, 20); break;
        case Constants.COMMITTEE_ROLES.PLYR_REP: commonSkills.communityRelations = getRandomInt(8, 18); commonSkills.influence = getRandomInt(8, 18); break;
        case Constants.COMMITTEE_ROLES.V_COORD: commonSkills.administration = getRandomInt(8, 18); commonSkills.communityRelations = getRandomInt(8, 18); commonSkills.initiative = getRandomInt(8, 18); break;
        case Constants.COMMITTEE_ROLES.CHAIR: break;
    }

    return {
        id: id, name: `${firstName} ${lastName}`, role: role, age: age,
        relationshipToClub: getRandomElement(['Long-time fan', 'Former player', 'Local business owner', 'Dedicated volunteer']),
        skills: commonSkills,
        personality: { loyaltyToYou: getRandomInt(5, 15), overallClubLoyalty: getRandomInt(10, 20), enthusiasm: getRandomInt(5, 15), currentSatisfaction: getRandomInt(60, 90) },
        responsibilities: []
    };
}

// --- Weekly Task Generation ---
/**
 * Generates a list of weekly tasks available to the player based on club needs and facility condition.
 * Tasks are filtered to be "all or nothing" within WEEKLY_BASE_HOURS.
 * @param {object} clubFacilities - Current state of player's club facilities.
 * @param {array} committeeMembers - Current list of committee members.
 * @returns {Array<object>} An array of task objects.
 */
export function generateWeeklyTasks(clubFacilities, committeeMembers) {
    const tasks = [];

    const groundsmanSkill = committeeMembers.find(cm => cm.role === Constants.COMMITTEE_ROLES.GRNDS)?.skills.groundsKeepingSkill || 0;
    const secretarySkill = committeeMembers.find(cm => cm.role === Constants.COMMITTEE_ROLES.SEC)?.skills.administration || 0;
    const socialSecSkill = committeeMembers.find(cm => cm.role === Constants.COMMITTEE_ROLES.SOC)?.skills.communityRelations || 0;

    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO, description: 'Talk to Players', longDescription: 'Have a one-on-one chat with a player to boost morale or address concerns (e.g., low form, commitment).', baseHours: 5, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR, description: 'Scout for New Player', longDescription: 'Dedicate time to scouting the local area. Chance to find and recruit new talent.', baseHours: 10, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH, description: 'Seek Sponsors', longDescription: `Approach local businesses for sponsorship deals. Chance to gain new income based on club reputation.`, baseHours: 7, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.FAC_CHECK, description: 'General Facility Check', longDescription: `Perform a general inspection of all club facilities. Minor condition increase (up to 5%) for all facilities.`, baseHours: 4, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.ADMIN_WORK, description: 'Handle Administration', longDescription: `Tackle the mountain of paperwork and administrative duties required to run the club.`, baseHours: 6, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.SEC });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE, description: 'Plan Fundraiser', longDescription: `Organize an event to raise much-needed funds for the club. Success depends on effort and social secretary skill.`, baseHours: 7, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.SOC });


    if (clubFacilities[Constants.FACILITIES.PITCH].level > 0) {
        const pitch = clubFacilities[Constants.FACILITIES.PITCH];
        
        if (pitch.condition < 90) {
             const estImprovement = Math.min(pitch.maxCondition - pitch.condition, 6 + Math.round(groundsmanSkill / 2));
             tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PITCH_MAINT, description: 'General Pitch Maintenance', longDescription: `Work on the pitch to maintain its quality. Current Grade: ${pitch.grade}, Condition: ${pitch.condition}%. Expected: ~+${estImprovement}% condition.`, baseHours: 6, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.GRNDS });
        }
        if (pitch.condition < 50) {
            const estRepair = Math.min(pitch.maxCondition - pitch.condition, 8 + Math.round(groundsmanSkill * 1.5));
            tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.FIX_PITCH_DAMAGE, description: 'Repair Major Pitch Damage', longDescription: `Repair significant damage to the pitch. Current Grade: ${pitch.grade}, Condition: ${pitch.condition}%. Expected: ~+${estRepair}% condition.`, baseHours: 8, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.GRNDS });
        }
        if (pitch.condition < Constants.PITCH_UNPLAYABLE_THRESHOLD) {
            const estUrgentRepair = Math.min(pitch.maxCondition - pitch.condition, 10 + groundsmanSkill * 2);
            tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.FIX_PITCH_DAMAGE, description: 'Urgent Pitch Repair (Unplayable)', longDescription: `The pitch is unplayable! Urgent repairs needed to allow matches to proceed. Current Grade: ${pitch.grade}, Condition: ${pitch.condition}%. Expected: ~+${estUrgentRepair}% condition.`, baseHours: 10, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.GRNDS });
        }
    }

    if (clubFacilities[Constants.FACILITIES.CHGRMS].level > 0) {
        const chgrms = clubFacilities[Constants.FACILITIES.CHGRMS];
        if (chgrms.condition < 70) {
            const estClean = Math.min(chgrms.maxCondition - chgrms.condition, 8 + Math.round(secretarySkill / 2));
            tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.CLEAN_CHGRMS_SPECIFIC, description: 'Deep Clean Changing Rooms', longDescription: `Thoroughly clean and tidy the changing rooms. Current Grade: ${chgrms.grade}, Condition: ${chgrms.condition}%. Expected: ~+${estClean}% condition.`, baseHours: 8, assignedHours: 0, completed: false, requiresStaff: null });
        }
    }
    
    tasks.forEach(task => {
        if (task.requiresStaff) {
            const staff = committeeMembers.find(cm => cm.role === task.requiresStaff);
            if (staff) {
                const reductionFactor = staff.skills.workEthic / Constants.ATTRIBUTE_MAX;
                const originalBaseHours = task.baseHours;
                task.baseHours = Math.max(1, Math.round(originalBaseHours * (1 - reductionFactor * 0.3)));
                task.description += ` (Assisted by ${staff.name}, est. hrs reduced from ${originalBaseHours} to ${task.baseHours})`;
            }
        }
    });

    return tasks.filter(task => task.baseHours <= Constants.WEEKLY_BASE_HOURS);
}


// --- Match Schedule Generation (Circle Method for realistic fixtures) ---
/**
 * Generates a match schedule for a given competition.
 * @param {string} playerClubId - The ID of the player's club.
 * @param {Array<object>} allTeamsData - All team objects participating in this competition.
 * @param {number} season - The current season number.
 * @param {string} competitionType - The type of competition (e.g., Constants.COMPETITION_TYPE.LEAGUE).
 * @returns {Array<object>} An array of match week objects.
 */
export function generateMatchSchedule(playerClubId, allTeamsData, season, competitionType) {
    const numTeams = allTeamsData.length;
    if (numTeams < 2) {
        console.warn("Not enough teams to generate a match schedule.");
        return [];
    }

    let teams = [...allTeamsData.map(c => c.id)];
    const originalNumTeams = teams.length;
    const hasDummy = originalNumTeams % 2 !== 0;
    if (hasDummy) {
        teams.push('DUMMY_TEAM');
    }
    const N = teams.length;

    const newSchedule = [];
    const numRoundsPerHalf = N - 1;

    for (let round = 0; round < numRoundsPerHalf * 2; round++) {
        const currentRoundMatches = [];
        
        // Calculate the absolute game week number for league fixtures
        // League internal fixture week (round + 1) is offset by PRE_SEASON_WEEKS
        const absoluteGameWeekForLeague = Constants.PRE_SEASON_WEEKS + (round + 1); 

        const team1_id_pivot = teams[0];
        const team2_id_pivot = teams[N / 2];

        const isSecondLeg = round >= numRoundsPerHalf;
        let homeId_pivot, awayId_pivot;

        if (round % 2 === 0) {
            homeId_pivot = isSecondLeg ? team2_id_pivot : team1_id_pivot;
            awayId_pivot = isSecondLeg ? team1_id_pivot : team2_id_pivot;
        } else {
            homeId_pivot = isSecondLeg ? team1_id_pivot : team2_id_pivot;
            awayId_pivot = isSecondLeg ? team2_id_pivot : team1_id_pivot;
        }
        
        if (homeId_pivot !== 'DUMMY_TEAM' && awayId_pivot !== 'DUMMY_TEAM') {
            currentRoundMatches.push({
                id: generateUniqueId('M'), week: absoluteGameWeekForLeague, season: season, // Use absoluteGameWeekForLeague
                homeTeamId: homeId_pivot, homeTeamName: allTeamsData.find(c => c.id === homeId_pivot).name,
                awayTeamId: awayId_pivot, awayTeamName: allTeamsData.find(c => c.id === awayId_pivot).name,
                competition: competitionType, // Use the passed competition type
                result: null, played: false
            });
        } else {
            const realTeamId = homeId_pivot === 'DUMMY_TEAM' ? team2_id_pivot : team1_id_pivot;
            if (realTeamId !== 'DUMMY_TEAM') {
                currentRoundMatches.push({
                    id: generateUniqueId('M'), week: absoluteGameWeekForLeague, season: season, // Use absoluteGameWeekForLeague
                    homeTeamId: realTeamId, homeTeamName: allTeamsData.find(c => c.id === realTeamId).name,
                    awayTeamId: 'BYE', awayTeamName: 'BYE', competition: competitionType, result: 'BYE', played: true
                });
            }
        }


        for (let i = 1; i < N / 2; i++) {
            const teamA_id = teams[i];
            const teamB_id = teams[N - i];

            let h, a;
            if ((round % (N - 1)) % 2 === 0) {
                 h = isSecondLeg ? teamB_id : teamA_id;
                 a = isSecondLeg ? teamA_id : teamB_id;
            } else {
                 h = isSecondLeg ? teamA_id : teamB_id;
                 a = isSecondLeg ? teamB_id : teamA_id;
            }

            if (h !== 'DUMMY_TEAM' && a !== 'DUMMY_TEAM') {
                currentRoundMatches.push({
                    id: generateUniqueId('M'), week: absoluteGameWeekForLeague, season: season, // Use absoluteGameWeekForLeague
                    homeTeamId: h, homeTeamName: allTeamsData.find(c => c.id === h).name,
                    awayTeamId: a, awayTeamName: allTeamsData.find(c => c.id === a).name,
                    competition: competitionType, // Use the passed competition type
                    result: null, played: false
                });
            } else {
                const realTeamId = h === 'DUMMY_TEAM' ? a : h;
                if (realTeamId !== 'DUMMY_TEAM') {
                    currentRoundMatches.push({
                        id: generateUniqueId('M'), week: absoluteGameWeekForLeague, season: season, // Use absoluteGameWeekForLeague
                        homeTeamId: realTeamId, homeTeamName: allTeamsData.find(c => c.id === realTeamId).name,
                        awayTeamId: 'BYE', awayTeamName: 'BYE', competition: competitionType, result: 'BYE', played: true
                    });
                }
            }
        }
        
        newSchedule.push({
            week: absoluteGameWeekForLeague, // Use absolute game week
            competition: competitionType, // Add competition type to the week block
            matches: currentRoundMatches.filter(match => match.homeTeamId !== 'DUMMY_TEAM' && match.awayTeamId !== 'DUMMY_TEAM')
        });

        const firstTeamId = teams[0];
        const lastRotatingId = teams.pop();
        teams.splice(1, 0, lastRotatingId);
        teams[0] = firstTeamId;
    }

    console.log(`Generated ${newSchedule.length} match weeks for ${competitionType}.`, newSchedule);
    return newSchedule;
}


// --- Initial Opponent Club Generation (structural data) ---
// This function is now mostly replaced by generateRegionalClubPool
export function generateInitialOpponentClubs(playerCountyData) { // Now expects a countyData object
    const generatedOpponents = [];
    // This function will likely become obsolete or be used for generating clubs outside the initial 60 pool.
    // Keeping it for compatibility if any old code paths still reference it.
    console.warn("generateInitialOpponentClubs called. This function might be deprecated soon for initial league setup.");

    const townsPool = [...playerCountyData.towns]; // Use towns from the selected county

    for (let i = 0; i < Constants.DEFAULT_LEAGUE_SIZE - 1; i++) {
        const id = generateUniqueId('C');
        let identity = generateClubIdentity(playerCountyData); // Pass the county data object
        let name = identity.name;
        let nickname = identity.nickname;
        const kitColors = generateKitColors();

        // Add a chance for "reserve" teams from major towns in the region
        if (getRandomInt(1, 100) < 30) {
            const majorTownCandidates = townsPool.filter(t => t.length > 7 || ['Leicester', 'Nottingham', 'Derby', 'Birmingham', 'Sheffield', 'Manchester', 'Liverpool', 'Leeds', 'Bristol', 'Newcastle'].includes(t));
            const majorTown = getRandomElement(majorTownCandidates.length > 0 ? majorTownCandidates : townsPool);
            
            if (majorTown) {
                name = `${majorTown} ${getRandomElement(['Reserves', 'U23s', 'Development Squad'])}`;
                // Nickname will be handled by generateClubIdentity's internal logic
            }
        }

        generatedOpponents.push({
            id: id, name: name, location: getRandomElement(townsPool), nickname: nickname, kitColors: kitColors,
            overallTeamQuality: getRandomInt(5, 10), // Initial league opponents are lower quality
            currentLeagueId: null, finalLeaguePosition: null, // These will be set by leagueData
            leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 },
            inCup: true, // Assume all initial league teams are in the cup
            eliminatedFromCup: false,
            potentialLeagueLevel: 0 // Default for league teams
        });
    }
    console.log("Initial opponent clubs generated:", generatedOpponents.map(c => c.name));
    return [...generatedOpponents];
}

// --- Initial League Name Generation ---
/**
 * Generates an initial league name based on the player's chosen county data.
 * This is now used to get the county prefix for tiered leagues.
 * @param {object} playerCountyData - The county data object for the player's chosen location.
 * @returns {string} The county name (e.g., "Leicestershire").
 */
export function getCountyNameForLeagues(playerCountyData) { // Renamed and modified
    return playerCountyData.county;
}

// --- Kit Color Generation ---
export function generateKitColors() {
    const primary = getRandomElement(Constants.KIT_COLORS);
    let secondary = getRandomElement(Constants.KIT_COLORS.filter(color => color !== primary));
    if (primary !== '#FFFFFF' && primary !== '#000000' && getRandomInt(1,100) < 15) {
        secondary = getRandomElement(['#FFFFFF', '#000000']);
    } else if (primary === secondary) {
        secondary = getRandomElement(Constants.KIT_COLORS.filter(color => color !== primary));
    }
    return { primary: primary, secondary: secondary };
}
