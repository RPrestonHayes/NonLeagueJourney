// js/utils/dataGenerator.js

/**
 * Provides functions for generating various game data entities.
 * Includes initial player generation, club names, committee members, and weekly tasks.
 */

import * as Constants from './constants.js';
// Removed import * as clubData from '../data/clubData.js'; as it's not directly used here
// and importing data modules into utils can create circular dependencies if not careful.
// getUniqueId and random utils are exported so they're accessible everywhere.
export { getRandomInt, getRandomElement, generateUniqueId }; // Re-export for clarity if needed by other utils

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
let nextMatchId = 1;

function generateUniqueId(prefix) { // Changed to internal function
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

// --- Club Name Generation (for opponents) ---
export function generateClubIdentity(baseLocation) {
    const locationParts = baseLocation.split(' ');
    const mainLocationWord = locationParts[0];

    const suffixes = ['United', 'Rovers', 'Athletic', 'Town', 'City', 'Wanderers', 'Victoria', 'Amateurs', 'Corinthians', 'Sports', 'Albion', 'Park', 'FC'];
    const prefixes = ['', 'East ', 'West ', 'North ', 'South ', 'Royal ', 'Old ', 'Young ', 'St. ', 'AFC '];
    const middleWords = ['Park', 'Lane', 'Bridge', 'Field', 'Brook', 'Grange', 'Vale', 'Heath', 'Green', 'Spring', 'Heights', 'Wood', 'Hill', 'Central'];
    const nicknames = ['The Reds', 'The Blues', 'The Whites', 'The Blacks', 'The Brewers', 'The Villagers', 'The Foxes', 'The Lions', 'The Pigeons', 'The Swans', 'The Robins', 'The Tigers', 'The Hornets', 'The Mariners', 'The Millers', 'The Railwaymen'];

    let clubName = '';
    let chosenLocation = mainLocationWord;

    const nearbyLocations = [...possibleNearbyTowns(mainLocationWord), mainLocationWord];
    chosenLocation = getRandomElement(nearbyLocations);

    const structureRoll = getRandomInt(1, 100);
    if (structureRoll <= 60) { clubName = chosenLocation + ' ' + getRandomElement(suffixes); }
    else if (structureRoll <= 85) { clubName = getRandomElement(prefixes) + chosenLocation + ' ' + getRandomElement(suffixes); }
    else { clubName = chosenLocation + ' ' + getRandomElement(middleWords) + ' ' + getRandomElement(suffixes); }

    const clubNickname = getRandomElement(nicknames);
    return { name: clubName.trim(), nickname: clubNickname };
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
export function generateWeeklyTasks(clubFacilities, committeeMembers) {
    const tasks = [];

    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PITCH_MAINT, description: 'Maintain the pitch', baseHours: 8, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.GRNDS });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.ADMIN_WORK, description: 'Handle club administration', baseHours: 10, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.SEC });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO, description: 'Talk to players, check morale', baseHours: 5, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR, description: 'Scout for new players in the local area', baseHours: 10, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE, description: 'Plan a fundraising event', baseHours: 8, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.SOC });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH, description: 'Seek local sponsors', baseHours: 7, assignedHours: 0, completed: false, requiresStaff: null });

    if (clubFacilities && clubFacilities[Constants.FACILITIES.CHGRMS] && clubFacilities[Constants.FACILITIES.CHGRMS].level < 2) {
        tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.FAC_CHECK, description: 'Clean changing rooms', baseHours: 4, assignedHours: 0, completed: false, requiresStaff: null });
    }

    tasks.forEach(task => {
        const staff = committeeMembers.find(cm => cm.role === task.requiresStaff);
        if (staff) {
            const reductionFactor = staff.skills.workEthic / Constants.ATTRIBUTE_MAX;
            task.baseHours = Math.max(1, Math.round(task.baseHours * (1 - reductionFactor * 0.5)));
            task.description += ` (Assisted by ${staff.name})`;
        }
    });

    return tasks.filter(task => task.baseHours <= Constants.WEEKLY_BASE_HOURS);
}


// --- Match Schedule Generation (Circle Method for realistic fixtures) ---
/**
 * Generates a realistic double round-robin match schedule for a league.
 * Ensures balanced home/away games and spreads opponents.
 *
 * @param {string} playerClubId - The ID of the player's club.
 * @param {Array<object>} allLeagueClubsData - Array of all club objects in the league with their full data.
 * @param {number} season - Current season number.
 * @returns {Array<object>} A list of match objects, structured per week. Each week is { week: number, matches: Array<matchObjects> }.
 */
export function generateMatchSchedule(playerClubId, allLeagueClubsData, season) {
    const numTeams = allLeagueClubsData.length;
    if (numTeams < 2) {
        console.warn("Not enough clubs to generate a match schedule.");
        return [];
    }

    let teamsForScheduling = [...allLeagueClubsData];
    const isOdd = numTeams % 2 !== 0;
    if (isOdd) {
        teamsForScheduling.push({ id: 'DUMMY_TEAM', name: 'BYE', location: 'N/A', kitColors: {}, overallTeamQuality: 0 });
    }
    const n = teamsForScheduling.length; // Number of teams including dummy, now guaranteed even

    const schedule = [];
    const totalRounds = (n - 1) * 2; // Double round-robin

    // Initial positioning of teams for the Circle Method
    // Teams are IDs, to manage home/away better.
    let teamIds = teamsForScheduling.map(t => t.id);
    let topHalf = teamIds.slice(0, n / 2);
    let bottomHalf = teamIds.slice(n / 2).reverse(); // Reverse bottom half for pairing

    for (let round = 0; round < totalRounds; round++) {
        const matchesInRound = [];
        const homeForRound = new Set();
        const awayForRound = new Set();

        // Pair first team with last team
        let team1_id = topHalf[0];
        let team2_id = bottomHalf[0];

        // Ensure real teams play each other
        if (team1_id !== 'DUMMY_TEAM' && team2_id !== 'DUMMY_TEAM') {
            // Determine home/away based on round number for fairness
            let homeId, awayId;
            if (round % 2 === 0) { // Even rounds, team1 is home for this pair
                homeId = team1_id;
                awayId = team2_id;
            } else { // Odd rounds, team2 is home for this pair
                homeId = team2_id;
                awayId = team1_id;
            }

            matchesInRound.push({
                id: generateUniqueId('M'),
                week: round + 1, // Match week index (1-indexed for the fixture array)
                season: season,
                homeTeamId: homeId,
                homeTeamName: allLeagueClubsData.find(c => c.id === homeId).name,
                awayTeamId: awayId,
                awayTeamName: allLeagueClubsData.find(c => c.id === awayId).name,
                competition: 'League',
                result: null,
                played: false
            });
            homeForRound.add(homeId);
            awayForRound.add(awayId);
        } else {
            // Handle BYE week if dummy team is involved
            const realTeamId = team1_id === 'DUMMY_TEAM' ? team2_id : team1_id;
            matchesInRound.push({
                id: generateUniqueId('M'),
                week: round + 1,
                season: season,
                homeTeamId: realTeamId, // BYE week shown as home for the real team
                homeTeamName: allLeagueClubsData.find(c => c.id === realTeamId).name,
                awayTeamId: 'BYE',
                awayTeamName: 'BYE',
                competition: 'League',
                result: 'BYE',
                played: true // BYE matches are always "played"
            });
        }


        // Pair remaining teams
        for (let i = 1; i < n / 2; i++) {
            team1_id = topHalf[i];
            team2_id = bottomHalf[i];

            if (team1_id === 'DUMMY_TEAM' || team2_id === 'DUMMY_TEAM') {
                const realTeamId = team1_id === 'DUMMY_TEAM' ? team2_id : team1_id;
                 matchesInRound.push({
                    id: generateUniqueId('M'),
                    week: round + 1,
                    season: season,
                    homeTeamId: realTeamId,
                    homeTeamName: allLeagueClubsData.find(c => c.id === realTeamId).name,
                    awayTeamId: 'BYE',
                    awayTeamName: 'BYE',
                    competition: 'League',
                    result: 'BYE',
                    played: true
                });
                continue;
            }

            // Standard home/away pairing logic for other teams:
            // Ensure no team plays home/away twice in a row if possible (within reason for this simple algo)
            let homeId = team1_id;
            let awayId = team2_id;

            // Simple alternating for balance on actual games:
            // For first leg (rounds 0 to n-2), if it's an even round, team1 is home. If odd, team2 is home.
            // For second leg (rounds n-1 to totalRounds-1), it's the reverse.
            const currentLegRound = round % (n - 1); // Round within 1st or 2nd leg
            const isSecondLeg = round >= (n - 1);

            if (currentLegRound % 2 === 0) { // Even round within its leg
                 homeId = isSecondLeg ? team2_id : team1_id;
                 awayId = isSecondLeg ? team1_id : team2_id;
            } else { // Odd round within its leg
                 homeId = isSecondLeg ? team1_id : team2_id;
                 awayId = isSecondLeg ? team2_id : team1_id;
            }
            
            // Final check to avoid immediate back-to-back home/away IF simple pattern creates it
            // (This is hard with simple round robin, perfect balancing needs more complex algos)
            // For now, the circle method's alternation is usually good enough.


            matchesInRound.push({
                id: generateUniqueId('M'),
                week: round + 1,
                season: season,
                homeTeamId: homeId,
                homeTeamName: allLeagueClubsData.find(c => c.id === homeId).name,
                awayTeamId: awayId,
                awayTeamName: allLeagueClubsData.find(c => c.id === awayId).name,
                competition: 'League',
                result: null,
                played: false
            });
        }
        
        // Add the matches for this round (week) to the schedule
        // Filter out any BYE vs BYE (if both sides of a pair were dummy)
        schedule.push({
            week: round + 1, // Match week index (1 to totalRounds)
            matches: matchesInRound.filter(m => m.homeTeamId !== 'DUMMY_TEAM' && m.awayTeamId !== 'DUMMY_TEAM')
        });

        // Rotate teams (except the first one, which is the fixed pivot)
        const fixedPivot = topHalf[0];
        const rotatedPart = [...topHalf.slice(1), ...bottomHalf];
        
        // Perform one rotation for all teams except the fixed pivot
        const lastOfRotated = rotatedPart.pop();
        rotatedPart.splice(0, 0, lastOfRotated); // Insert at the beginning of the rotated part

        // Reassemble topHalf and bottomHalf for the next round
        topHalf = [fixedPivot, ...rotatedPart.slice(0, n / 2 - 1)];
        bottomHalf = rotatedPart.slice(n / 2 - 1).reverse();
    }

    console.log(`Generated ${schedule.length} match weeks.`);
    return schedule;
}


// --- Initial Opponent Club Generation (structural data) ---
export function generateInitialOpponentClubs(playerClubLocation) {
    const opponentClubs = [];
    const baseLocationsPool = [...possibleNearbyTowns(playerClubLocation), playerClubLocation];

    for (let i = 0; i < Constants.DEFAULT_LEAGUE_SIZE - 1; i++) {
        const id = generateUniqueId('C');
        let location = getRandomElement(baseLocationsPool);
        let identity = generateClubIdentity(location);
        let name = identity.name;
        let nickname = identity.nickname;
        const kitColors = generateKitColors();

        if (getRandomInt(1, 100) < 30) {
            const majorTown = getRandomElement(['Loughborough', 'Leicester', 'Melton Mowbray', 'Nottingham', 'Derby']);
            name = `${majorTown} ${getRandomElement(['Reserves', 'Development', 'U23s'])}`;
            location = majorTown;
            nickname = getRandomElement(['The Young Guns', 'The Future', 'The Reserves']);
        }


        opponentClubs.push({
            id: id, name: name, location: location, nickname: nickname, kitColors: kitColors,
            overallTeamQuality: getRandomInt(5, 10), currentLeagueId: null, finalLeaguePosition: null,
            leagueStats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }
        });
    }
    return opponentClubs;
}

// --- Initial League Name Generation ---
export function generateInitialLeagueName(playerClubLocation) {
    const leagueId = generateUniqueId('L');
    const locationParts = playerClubLocation.split(' ');
    const mainLocationWord = locationParts[0];

    const regionalPrefixes = ['County', 'District', 'Regional', 'Area'];
    const divisionSuffixes = ['Division Three', 'Division Two', 'South', 'North', 'East', 'West', 'Alliance'];

    let leagueName = `${mainLocationWord} & ${getRandomElement(regionalPrefixes)} League ${getRandomElement(divisionSuffixes)}`;

    return { id: leagueId, name: leagueName.trim() };
}


// --- Internal helper for plausible nearby towns ---
function possibleNearbyTowns(centerTown) {
    const nearbyMap = {
        'Sileby': ['Loughborough', 'Mountsorrel', 'Rothley', 'Syston', 'Barrow upon Soar', 'Quorn', 'Anstey', 'Thurmaston', 'Melton Mowbray', 'Leicester'],
        'Loughborough': ['Sileby', 'Shepshed', 'Quorn', 'Kegworth', 'Mountsorrel', 'Hathern'],
        'Melton Mowbray': ['Asfordby', 'Wymondham', 'Somerby', 'Oakham', 'Syston'],
        'Leicester': ['Oadby', 'Wigston', 'Blaby', 'Enderby', 'Braunstone', 'Anstey', 'Thurmaston', 'Glenfield'],
        'Nottingham': ['Long Eaton', 'Beeston', 'West Bridgford', 'Arnold', 'Hucknall', 'Carlton'],
        'Derby': ['Long Eaton', 'Ilkeston', 'Alfreton', 'Belper', 'Ripley']
    };

    const specificNearby = nearbyMap[centerTown] || [];

    const genericVillages = ['Newton', 'Kingston', 'Charlton', 'Stanton', 'Hinton', 'Morton', 'Burton', 'Oakley', 'Ashley', 'Bradley'];
    return [...new Set([...specificNearby, ...genericVillages.slice(0, getRandomInt(3, 7))])];
}

