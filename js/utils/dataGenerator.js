// js/utils/dataGenerator.js

/**
 * Provides functions for generating various game data entities.
 * Includes initial player generation, club names, committee members, and weekly tasks.
 */

import * as Constants from './constants.js';
import * as clubData from '../data/clubData.js'; // Import clubData to get club name dynamically

// --- Helper Functions for Randomness ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName(type = 'first') {
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

export function generateUniqueId(prefix) {
    switch (prefix) {
        case 'P': return `P${nextPlayerId++}`;
        case 'C': return `C${nextClubId++}`;
        case 'CM': return `CM${nextCommitteeId++}`;
        case 'T': return `T${nextTaskId++}`;
        case 'TR': return `TR${nextTransactionId++}`;
        case 'L': return `L${nextLeagueId++}`;
        default: return `${prefix}${Date.now()}${getRandomInt(0, 999)}`;
    }
}

// --- Player Generation ---
/**
 * Generates a single player object with random attributes.
 * @param {string} position - The preferred position of the player (e.g., Constants.PLAYER_POSITIONS.ST)
 * @param {number} qualityTier - A number representing general quality (e.g., 1 for low, 5 for high)
 * @returns {object} A player object.
 */
export function generatePlayer(position = null, qualityTier = 1) {
    const id = generateUniqueId('P');
    const age = getRandomInt(18, 35);
    const firstName = getRandomName('first');
    const lastName = getRandomName('last');
    const preferredFoot = getRandomElement(['Left', 'Right', 'Both']);

    // Determine position if not provided
    if (!position) {
        position = getRandomElement(Object.values(Constants.PLAYER_POSITIONS));
    }

    // Generate attributes based on qualityTier (lower quality for grassroots)
    const baseAttr = getRandomInt(Constants.ATTRIBUTE_MIN + (qualityTier - 1) * 2, Constants.ATTRIBUTE_MIN + qualityTier * 2);
    const attributes = {};
    for (const attrKey in Constants.PLAYER_ATTRIBUTES) {
        // Give slight bias towards relevant attributes for position
        let value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr - 3), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 3));

        // Adjust for specific positions
        if (position === Constants.PLAYER_POSITIONS.GK) {
            if (attrKey === 'GK') value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 5), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 8)); // Higher GK for GKs
            else value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr - 5), Math.min(Constants.ATTRIBUTE_MAX, baseAttr)); // Lower for outfield skills
        } else if (position === Constants.PLAYER_POSITIONS.ST && attrKey === 'SHO') {
            value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 2), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 5));
        } else if (position === Constants.PLAYER_POSITIONS.CB && attrKey === 'TKL') {
            value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 2), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 5));
        } else if (position === Constants.PLAYER_POSITIONS.CM && attrKey === 'PAS') {
            value = getRandomInt(Math.max(Constants.ATTRIBUTE_MIN, baseAttr + 2), Math.min(Constants.ATTRIBUTE_MAX, baseAttr + 5));
        }
        attributes[attrKey] = value;
    }

    // Initial morale and commitment for unpaid players
    const morale = getRandomInt(60, 90); // Start fairly happy
    const commitment = getRandomElement(['High', 'Medium', 'Low']); // Crucial for non-league

    return {
        id: id,
        name: `${firstName} ${lastName}`,
        age: age,
        preferredPosition: position,
        secondaryPosition: getRandomElement([null, getRandomElement(Object.values(Constants.PLAYER_POSITIONS).filter(p => p !== position))]), // Ensure secondary is different from primary
        foot: preferredFoot,
        height: getRandomInt(170, 195), // cm
        nationality: 'English', // Default for grassroots
        currentClubId: null, // Will be set when assigned to a club

        attributes: attributes,

        traits: {
            ambition: getRandomInt(1, 10),
            loyalty: getRandomInt(10, 20),
            temperament: getRandomInt(1, 10),
            professionalism: getRandomInt(5, 15),
            commitmentLevel: commitment
        },

        currentSeasonStats: {
            appearances: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            manOfTheMatchAwards: 0,
            averageRating: 0
        },

        status: {
            morale: morale,
            fitness: 100, // Start fit
            injuryStatus: 'Fit',
            injuryReturnDate: null,
            suspended: false,
            suspensionGames: 0
        }
    };
}

// --- Club Name Generation (for opponents) ---
/**
 * Generates a plausible non-league club name based on a location.
 * Uses a dynamic pool of possible elements to ensure variety around the given hometown.
 * @param {string} baseLocation - The central town/city (player's hometown or a major nearby town).
 * @returns {object} An object containing { name: string, nickname: string }.
 */
export function generateClubIdentity(baseLocation) {
    const locationParts = baseLocation.split(' ');
    const mainLocationWord = locationParts[0]; // Use first word for commonality

    const suffixes = ['United', 'Rovers', 'Athletic', 'Town', 'City', 'Wanderers', 'Victoria', 'Amateurs', 'Corinthians', 'Sports', 'Albion', 'Park', 'FC'];
    const prefixes = ['', 'East ', 'West ', 'North ', 'South ', 'Royal ', 'Old ', 'Young ', 'St. ', 'AFC ']; // Added common prefixes
    const middleWords = ['Park', 'Lane', 'Bridge', 'Field', 'Brook', 'Grange', 'Vale', 'Heath', 'Green', 'Spring', 'Heights', 'Wood', 'Hill', 'Central'];
    const nicknames = ['The Reds', 'The Blues', 'The Whites', 'The Blacks', 'The Brewers', 'The Villagers', 'The Foxes', 'The Lions', 'The Pigeons', 'The Swans', 'The Robins', 'The Tigers', 'The Hornets', 'The Mariners', 'The Millers', 'The Railwaymen'];


    let clubName = '';
    let chosenLocation = mainLocationWord;

    // Introduce some variation in location for local teams
    const nearbyLocations = [
        mainLocationWord, // The hometown itself
        ...possibleNearbyTowns(mainLocationWord) // Generate some plausible nearby smaller towns/villages
    ];
    chosenLocation = getRandomElement(nearbyLocations);


    // Decide on name structure
    const structureRoll = getRandomInt(1, 100);

    if (structureRoll <= 60) { // Most common: Location + Suffix
        clubName = chosenLocation + ' ' + getRandomElement(suffixes);
    } else if (structureRoll <= 85) { // Prefix + Location + Suffix
        clubName = getRandomElement(prefixes) + chosenLocation + ' ' + getRandomElement(suffixes);
    } else { // Location + Midword + Suffix (e.g., "Anstey Lane Sports")
        clubName = chosenLocation + ' ' + getRandomElement(middleWords) + ' ' + getRandomElement(suffixes);
    }

    const clubNickname = getRandomElement(nicknames);

    return { name: clubName.trim(), nickname: clubNickname };
}

// --- Kit Color Generation ---
/**
 * Generates initial kit colors for a club.
 * @returns {object} An object with primary and secondary hex colors.
 */
export function generateKitColors() {
    const primary = getRandomElement(Constants.KIT_COLORS);
    let secondary = getRandomElement(Constants.KIT_COLORS.filter(color => color !== primary)); // Ensure different
    // Small chance for same color if it's white/black and paired with a bright primary
    if (primary !== '#FFFFFF' && primary !== '#000000' && getRandomInt(1,100) < 15) {
        secondary = getRandomElement(['#FFFFFF', '#000000']);
    } else if (primary === secondary) { // Fallback if somehow same
        secondary = getRandomElement(Constants.KIT_COLORS.filter(color => color !== primary));
    }

    return { primary: primary, secondary: secondary };
}

// --- Committee Member Generation ---
/**
 * Generates a committee member for the player's club.
 * @param {string} role - The role of the committee member (from Constants.COMMITTEE_ROLES).
 * @returns {object} A committee member object.
 */
export function generateCommitteeMember(role) {
    const id = generateUniqueId('CM');
    const firstName = getRandomName('first');
    const lastName = getRandomName('last');
    const age = getRandomInt(30, 70);

    const commonSkills = {
        administration: getRandomInt(5, 15),
        financialAcumen: getRandomInt(5, 15),
        groundsKeepingSkill: getRandomInt(5, 15),
        communityRelations: getRandomInt(5, 15),
        influence: getRandomInt(5, 15),
        initiative: getRandomInt(5, 15),
        workEthic: getRandomInt(5, 15),
        resistanceToChange: getRandomInt(1, 10) // Lower for more amenable, higher for resistant
    };

    // Adjust skills based on role
    switch (role) {
        case Constants.COMMITTEE_ROLES.SEC:
            commonSkills.administration = getRandomInt(10, 20);
            commonSkills.workEthic = getRandomInt(10, 20);
            break;
        case Constants.COMMITTEE_ROLES.TREAS:
            commonSkills.financialAcumen = getRandomInt(10, 20);
            commonSkills.administration = getRandomInt(8, 18);
            break;
        case Constants.COMMITTEE_ROLES.GRNDS:
            commonSkills.groundsKeepingSkill = getRandomInt(10, 20);
            commonSkills.workEthic = getRandomInt(10, 20);
            commonSkills.resistanceToChange = getRandomInt(5, 15); // Groundsmen can be set in their ways!
            break;
        case Constants.COMMITTEE_ROLES.SOC:
            commonSkills.communityRelations = getRandomInt(10, 20);
            commonSkills.initiative = getRandomInt(10, 20);
            break;
        case Constants.COMMITTEE_ROLES.PLYR_REP:
            commonSkills.communityRelations = getRandomInt(8, 18);
            commonSkills.influence = getRandomInt(8, 18);
            break;
        case Constants.COMMITTEE_ROLES.V_COORD:
            commonSkills.administration = getRandomInt(8, 18);
            commonSkills.communityRelations = getRandomInt(8, 18);
            commonSkills.initiative = getRandomInt(8, 18);
            break;
        case Constants.COMMITTEE_ROLES.CHAIR:
            // Chairperson is player, but for AI this would be strong leader
            break;
    }

    return {
        id: id,
        name: `${firstName} ${lastName}`,
        role: role,
        age: age,
        relationshipToClub: getRandomElement(['Long-time fan', 'Former player', 'Local business owner', 'Dedicated volunteer']),
        skills: commonSkills,
        personality: {
            loyaltyToYou: getRandomInt(5, 15), // How much they like/trust the player
            overallClubLoyalty: getRandomInt(10, 20),
            enthusiasm: getRandomInt(5, 15),
            currentSatisfaction: getRandomInt(60, 90)
        },
        responsibilities: [] // To be filled by game logic
    };
}

// --- Weekly Task Generation ---
/**
 * Generates a list of weekly tasks available to the player.
 * @param {object} clubFacilities - Current state of player's club facilities.
 * @param {array} committeeMembers - Current list of committee members.
 * @returns {Array<object>} An array of task objects.
 */
export function generateWeeklyTasks(clubFacilities, committeeMembers) {
    const tasks = [];

    // Basic required tasks
    tasks.push({
        id: generateUniqueId('T'),
        type: Constants.WEEKLY_TASK_TYPES.PITCH_MAINT,
        description: 'Maintain the pitch',
        baseHours: 8, // Takes time if no dedicated groundsman
        assignedHours: 0,
        completed: false,
        requiresStaff: Constants.COMMITTEE_ROLES.GRNDS // Example staff requirement
    });

    tasks.push({
        id: generateUniqueId('T'),
        type: Constants.WEEKLY_TASK_TYPES.ADMIN_WORK,
        description: 'Handle club administration',
        baseHours: 10,
        assignedHours: 0,
        completed: false,
        requiresStaff: Constants.COMMITTEE_ROLES.SEC
    });

    tasks.push({
        id: generateUniqueId('T'),
        type: Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO,
        description: 'Talk to players, check morale',
        baseHours: 5,
        assignedHours: 0,
        completed: false,
        requiresStaff: null // Player must do this
    });

    tasks.push({
        id: generateUniqueId('T'),
        type: Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR,
        description: 'Scout for new players in the local area',
        baseHours: 10,
        assignedHours: 0,
        completed: false,
        requiresStaff: null // Player or later a scout
    });

    tasks.push({
        id: generateUniqueId('T'),
        type: Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE,
        description: 'Plan a fundraising event',
        baseHours: 8,
        assignedHours: 0,
        completed: false,
        requiresStaff: Constants.COMMITTEE_ROLES.SOC
    });

    tasks.push({
        id: generateUniqueId('T'),
        type: Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH,
        description: 'Seek local sponsors',
        baseHours: 7,
        assignedHours: 0,
        completed: false,
        requiresStaff: null // Player or later commercial manager
    });

    // Dynamically adjust tasks based on facilities, committee, etc.
    // Example: If changing rooms are bad, add a "Clean Changing Rooms" task
    if (clubFacilities && clubFacilities[Constants.FACILITIES.CHGRMS] && clubFacilities[Constants.FACILITIES.CHGRMS].level < 2) {
        tasks.push({
            id: generateUniqueId('T'),
            type: Constants.WEEKLY_TASK_TYPES.FAC_CHECK,
            description: 'Clean changing rooms',
            baseHours: 4,
            assignedHours: 0,
            completed: false,
            requiresStaff: null // Initially player/volunteer
        });
    }

    // Reduce hours if a relevant committee member is present
    tasks.forEach(task => {
        const staff = committeeMembers.find(cm => cm.role === task.requiresStaff);
        if (staff) {
            // Placeholder for staff efficiency calculation
            // Max reduction of 50% for now based on max work ethic
            const reductionFactor = staff.skills.workEthic / Constants.ATTRIBUTE_MAX; // Use Constants.ATTRIBUTE_MAX
            task.baseHours = Math.max(1, Math.round(task.baseHours * (1 - reductionFactor * 0.5)));
            task.description += ` (Assisted by ${staff.name})`;
        }
    });

    return tasks;
}


// --- Match Generation (Placeholder for league fixtures) ---
/**
 * Generates a placeholder match schedule for the first season.
 * In a real scenario, this would be part of league generation and fixture creation.
 * @param {string} playerClubId - The ID of the player's club.
 * @param {Array<object>} allLeagueClubs - Array of all club objects in the league (including player's club).
 * @param {number} season - Current season number.
 * @returns {Array<object>} A list of match objects.
 */
export function generateMatchSchedule(playerClubId, allLeagueClubs, season) {
    const schedule = [];
    if (allLeagueClubs.length < 2) {
        console.warn("Not enough clubs to generate matches for schedule.");
        return [];
    }

    let currentMatchWeek = 1;
    // Simple double round-robin fixture generation (home and away)
    // This is a simplified version and would be improved by a proper fixture generator
    // to ensure realistic week distribution.

    for (let i = 0; i < allLeagueClubs.length; i++) {
        for (let j = i + 1; j < allLeagueClubs.length; j++) {
            const homeTeam = allLeagueClubs[i];
            const awayTeam = allLeagueClubs[j];

            // Match 1: Home vs Away
            schedule.push({
                id: generateUniqueId('M'),
                week: currentMatchWeek,
                season: season,
                homeTeamId: homeTeam.id,
                homeTeamName: homeTeam.name,
                awayTeamId: awayTeam.id,
                awayTeamName: awayTeam.name,
                competition: 'League',
                result: null,
                played: false
            });

            // Match 2: Away vs Home (return fixture)
            schedule.push({
                id: generateUniqueId('M'),
                week: currentMatchWeek + 1, // Simple increment, real fixture gen is complex
                season: season,
                homeTeamId: awayTeam.id,
                homeTeamName: awayTeam.name,
                awayTeamId: homeTeam.id,
                awayTeamName: homeTeam.name,
                competition: 'League',
                result: null,
                played: false
            });
            currentMatchWeek += 2; // Increment for the next pair of matches
        }
    }
    // Sort schedule by week
    schedule.sort((a, b) => a.week - b.week);
    return schedule;
}

// --- Initial Opponent Club Generation (structural data) ---
/**
 * Generates initial opponent clubs for a league based on the player's hometown.
 * These will only contain structural data and basic quality for efficiency.
 * @param {string} playerClubLocation - The player's club location to help generate relevant opponent names.
 * @param {string} playerClubId - The ID of the player's club to exclude it.
 * @returns {Array<object>} An array of opponent club objects (structural data).
 */
export function generateInitialOpponentClubs(playerClubLocation, playerClubId) {
    const opponentClubs = [];
    // Ensure the player's hometown is not directly used for opponent names unless it's a "reserve" team
    const baseLocationsPool = [...possibleNearbyTowns(playerClubLocation), playerClubLocation]; // Include hometown for "reserve" names

    for (let i = 0; i < Constants.DEFAULT_LEAGUE_SIZE - 1; i++) { // -1 because player's club is one team
        const id = generateUniqueId('C');
        let location = getRandomElement(baseLocationsPool);
        let identity = generateClubIdentity(location);
        let name = identity.name;
        let nickname = identity.nickname;
        const kitColors = generateKitColors();

        // Introduce a chance for "Reserve" or "Development" teams from larger nearby towns
        if (getRandomInt(1, 100) < 30) { // 30% chance for a reserve/dev team
            const majorTown = getRandomElement(['Loughborough', 'Leicester', 'Melton Mowbray', 'Nottingham', 'Derby']);
            name = `${majorTown} ${getRandomElement(['Reserves', 'Development', 'U23s'])}`;
            location = majorTown; // Set their actual location to the major town
            nickname = getRandomElement(['The Young Guns', 'The Future', 'The Reserves']);
        }


        opponentClubs.push({
            id: id,
            name: name,
            location: location,
            nickname: nickname,
            kitColors: kitColors,
            overallTeamQuality: getRandomInt(5, 10), // Low quality for grassroots
            currentLeagueId: null, // This will be set by leagueData after creation
            finalLeaguePosition: null
        });
    }
    return opponentClubs;
}

/**
 * Generates a plausible name for the initial hyper-local league.
 * @param {string} playerClubLocation - The player's club's hometown.
 * @returns {object} An object with { id: string, name: string }.
 */
export function generateInitialLeagueName(playerClubLocation) {
    const leagueId = generateUniqueId('L');
    const locationParts = playerClubLocation.split(' ');
    const mainLocationWord = locationParts[0];

    const regionalPrefixes = ['County', 'District', 'Regional', 'Area'];
    const divisionSuffixes = ['Division Three', 'Division Two', 'South', 'North', 'East', 'West', 'Alliance'];

    let leagueName = `${mainLocationWord} & ${getRandomElement(regionalPrefixes)} League ${getRandomElement(divisionSuffixes)}`;

    return { id: leagueId, name: leagueName.trim() };
}


// --- Internal helper for plausible nearby towns (can be expanded) ---
function possibleNearbyTowns(centerTown) {
    // This is a simplified list. In a full game, you'd have a more robust database.
    const nearbyMap = {
        'Sileby': ['Loughborough', 'Mountsorrel', 'Rothley', 'Syston', 'Barrow upon Soar', 'Quorn', 'Anstey', 'Thurmaston', 'Melton Mowbray', 'Leicester'],
        'Loughborough': ['Sileby', 'Shepshed', 'Quorn', 'Kegworth', 'Mountsorrel', 'Hathern'],
        'Melton Mowbray': ['Asfordby', 'Wymondham', 'Somerby', 'Oakham', 'Syston'],
        'Leicester': ['Oadby', 'Wigston', 'Blaby', 'Enderby', 'Braunstone', 'Anstey', 'Thurmaston', 'Glenfield'],
        'Nottingham': ['Long Eaton', 'Beeston', 'West Bridgford', 'Arnold', 'Hucknall', 'Carlton'], // Example for potential wider region
        'Derby': ['Long Eaton', 'Ilkeston', 'Alfreton', 'Belper', 'Ripley'] // Example for potential wider region
    };

    const specificNearby = nearbyMap[centerTown] || [];

    // Add some general common village/town names that could be anywhere in the UK
    const genericVillages = ['Newton', 'Kingston', 'Charlton', 'Stanton', 'Hinton', 'Morton', 'Burton', 'Oakley', 'Ashley', 'Bradley'];
    return [...new Set([...specificNearby, ...genericVillages.slice(0, getRandomInt(3, 7))])]; // Add a few generic ones too
}

