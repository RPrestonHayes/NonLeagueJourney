// js/utils/dataGenerator.js

/**
 * Provides functions for generating various game data entities.
 * Includes initial player generation, club names, committee members, and weekly tasks.
 */

import * as Constants from './constants.js';
// Removed import * as clubData from '../data/clubData.js'; as it's not directly used here
// and importing data modules into utils can create circular dependencies if not careful.
// getUniqueId and random utils are exported so they're accessible everywhere.
// Export getRandomName as well
export { getRandomInt, getRandomElement, generateUniqueId, getRandomName }; // NEW: Added getRandomName to export list

// --- Helper Functions for Randomness ---
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName(type = 'first') { // Changed to internal function
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
    const groundsman = committeeMembers.find(cm => cm.role === Constants.COMMITTEE_ROLES.GRNDS);
    const secretary = committeeMembers.find(cm => cm.role === Constants.COMMITTEE_ROLES.SEC);
    const socialSec = committeeMembers.find(cm => cm.role === Constants.COMMITTEE_ROLES.SOC);

    // Always available tasks
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PLAYER_CONVO, description: 'Talk to players, check morale', baseHours: 5, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.RECRUIT_PLYR, description: 'Scout for new players in the local area', baseHours: 10, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.SPONSOR_SEARCH, description: 'Seek local sponsors', baseHours: 7, assignedHours: 0, completed: false, requiresStaff: null });
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.FAC_CHECK, description: 'General Facility Check', baseHours: 4, assignedHours: 0, completed: false, requiresStaff: null });

    // Dynamic tasks based on facility condition and staff
    // Pitch Maintenance (General)
    if (clubFacilities[Constants.FACILITIES.PITCH].level > 0) {
        if (clubFacilities[Constants.FACILITIES.PITCH].condition < 90) {
             tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PITCH_MAINT, description: 'General Pitch Maintenance', baseHours: 6, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.GRNDS });
        }
        if (clubFacilities[Constants.FACILITIES.PITCH].condition < 50 && clubFacilities[Constants.FACILITIES.PITCH].isUsable) {
            tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.FIX_PITCH_DAMAGE, description: 'Repair Major Pitch Damage', baseHours: 10, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.GRNDS });
        }
        if (clubFacilities[Constants.FACILITIES.PITCH].condition < Constants.PITCH_UNPLAYABLE_THRESHOLD) {
            tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.FIX_PITCH_DAMAGE, description: 'Urgent Pitch Repair (Unplayable)', baseHours: 10, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.GRNDS });
        }
    }

    // Changing Rooms Cleaning
    if (clubFacilities[Constants.FACILITIES.CHGRMS].level > 0) {
        if (clubFacilities[Constants.FACILITIES.CHGRMS].condition < 70) {
            tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.CLEAN_CHGRMS_SPECIFIC, description: 'Deep Clean Changing Rooms', baseHours: 8, assignedHours: 0, completed: false, requiresStaff: null });
        }
    }
    
    // Admin Work (always needed but can be staff assisted)
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.ADMIN_WORK, description: 'Handle club administration', baseHours: 6, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.SEC });

    // Fundraising (if social secretary exists, or if finances are low)
    // Note: getFinances() would need to be imported from clubData.js if used here,
    // Or we pass the full club object from gameState.
    // For now, let's simplify to always offer fundraising.
    tasks.push({ id: generateUniqueId('T'), type: Constants.WEEKLY_TASK_TYPES.PLAN_FUNDRAISE, description: 'Plan a fundraising event', baseHours: 7, assignedHours: 0, completed: false, requiresStaff: Constants.COMMITTEE_ROLES.SOC });


    tasks.forEach(task => {
        if (task.requiresStaff) {
            const staff = committeeMembers.find(cm => cm.role === task.requiresStaff);
            if (staff) {
                const reductionFactor = staff.skills.workEthic / Constants.ATTRIBUTE_MAX;
                task.baseHours = Math.max(1, Math.round(task.baseHours * (1 - reductionFactor * 0.3)));
                task.description += ` (Assisted by ${staff.name})`;
            }
        }
    });

    return tasks.filter(task => task.baseHours <= Constants.WEEKLY_BASE_HOURS);
}


// --- Match Schedule Generation (Circle Method for realistic fixtures) ---
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
    const n = teamsForScheduling.length;

    const schedule = [];
    const totalRounds = (n - 1) * 2;

    let teamIds = teamsForScheduling.map(t => t.id);
    const fixedPivotId = teamIds[0];
    let rotatingTeamIds = teamIds.slice(1);

    for (let round = 0; round < totalRounds; round++) {
        const matchesInRound = [];
        
        let team1_id_pivot = fixedPivotId;
        let team2_id_pivot = rotatingTeamIds[0];

        if (team1_id_pivot === 'DUMMY_TEAM' || team2_id_pivot === 'DUMMY_TEAM') {
            const realTeamId = team1_id_pivot === 'DUMMY_TEAM' ? team2_id_pivot : team1_id_pivot;
            if (realTeamId !== 'DUMMY_TEAM') {
                matchesInRound.push({
                    id: generateUniqueId('M'), week: round + 1, season: season,
                    homeTeamId: realTeamId, homeTeamName: allLeagueClubsData.find(c => c.id === realTeamId).name,
                    awayTeamId: 'BYE', awayTeamName: 'BYE', competition: 'League', result: 'BYE', played: true
                });
            }
        } else {
            let homeId, awayId;
            if (round % 2 === 0) { homeId = team1_id_pivot; awayId = team2_id_pivot; }
            else { homeId = team2_id_pivot; awayId = team1_id_pivot; }
            matchesInRound.push({
                id: generateUniqueId('M'), week: round + 1, season: season,
                homeTeamId: homeId, homeTeamName: allLeagueClubsData.find(c => c.id === homeId).name,
                awayTeamId: awayId, awayTeamName: allLeagueClubsData.find(c => c.id === awayId).name,
                competition: 'League', result: null, played: false
            });
        }

        for (let i = 1; i < n / 2; i++) {
            let teamA_id = rotatingTeamIds[i];
            let teamB_id = rotatingTeamIds[n - 1 - i];

            if (teamA_id === 'DUMMY_TEAM' || teamB_id === 'DUMMY_TEAM') {
                const realTeamId = teamA_id === 'DUMMY_TEAM' ? teamB_id : teamA_id;
                if (realTeamId !== 'DUMMY_TEAM') {
                    matchesInRound.push({
                        id: generateUniqueId('M'), week: round + 1, season: season,
                        homeTeamId: realTeamId, homeTeamName: allLeagueClubsData.find(c => c.id === realTeamId).name,
                        awayTeamId: 'BYE', awayTeamName: 'BYE', competition: 'League', result: 'BYE', played: true
                    });
                }
                continue;
            }

            let homeId, awayId;
            const isSecondLeg = round >= (n - 1);

            if ((i - 1) % 2 === 0) {
                 homeId = isSecondLeg ? teamB_id : teamA_id;
                 awayId = isSecondLeg ? teamA_id : teamB_id;
            } else {
                 homeId = isSecondLeg ? teamA_id : teamB_id;
                 awayId = isSecondLeg ? teamB_id : teamA_id;
            }

            matchesInRound.push({
                id: generateUniqueId('M'), week: round + 1, season: season,
                homeTeamId: homeId, homeTeamName: allLeagueClubsData.find(c => c.id === homeId).name,
                awayTeamId: awayId, awayTeamName: allLeagueClubsData.find(c => c.id === awayId).name,
                competition: 'League', result: null, played: false
            });
        }
        
        schedule.push({
            week: round + 1,
            matches: matchesInRound.filter(match => match.homeTeamId !== 'DUMMY_TEAM' && match.awayTeamId !== 'DUMMY_TEAM')
        });

        const fixedPivot = topHalf[0]; // Need to re-derive topHalf/bottomHalf from teamsForScheduling
        // To accurately rotate the remaining teams while keeping pivot fixed:
        const firstTeam = teamsForScheduling.shift(); // Remove pivot temporarily
        teamsForScheduling.push(firstTeam); // Put pivot at the end
        const tempRotate = teamsForScheduling.slice(1); // Get all except pivot and first rotating
        teamsForScheduling.splice(1, rotatingTeamIds.length, rotatingTeamIds.pop(), ...tempRotate); // Rotate


        // Correct rotation for Circle Method:
        // Hold the first team fixed. Rotate the remaining N-1 teams.
        const rotatedPart = rotatingTeamIds; // This is the array of rotating teams from the start of the round
        const lastOfRotating = rotatedPart.pop(); // Remove last team
        rotatedPart.splice(0, 0, lastOfRotating); // Insert at beginning
        rotatingTeamIds = rotatedPart; // Update rotating teams for next round
    }

    // After the loop, the rotation logic was slightly incorrect in previous versions.
    // Let's use a simpler, known-good Circle Method rotation.

    // New, simplified Circle Method implementation to ensure correct rotation and pairing.
    // This assumes teams are IDs initially.
    let teams = allLeagueClubsData.map(t => t.id); // Use only IDs for rotation
    const originalNumTeams = teams.length;
    const hasDummy = originalNumTeams % 2 !== 0;
    if (hasDummy) {
        teams.push('DUMMY_TEAM'); // Add dummy ID
    }
    const N = teams.length; // N is now even

    const newSchedule = [];
    const numRoundsPerHalf = N - 1; // Each team plays N-1 opponents once in a half-season

    for (let round = 0; round < numRoundsPerHalf * 2; round++) { // totalRounds = (N-1)*2
        const currentRoundMatches = [];
        // First team (pivot) plays against the middle team
        const homePivot = teams[0];
        const awayPivot = teams[N / 2];

        // Determine home/away based on round parity for the pivot match
        let h1, a1;
        if (round % 2 === 0) { // Even round for the first leg, odd for second leg
            h1 = homePivot;
            a1 = awayPivot;
        } else {
            h1 = awayPivot;
            a1 = homePivot;
        }
        
        if (h1 !== 'DUMMY_TEAM' && a1 !== 'DUMMY_TEAM') {
            currentRoundMatches.push({
                id: generateUniqueId('M'), week: round + 1, season: season,
                homeTeamId: h1, homeTeamName: allLeagueClubsData.find(c => c.id === h1).name,
                awayTeamId: a1, awayTeamName: allLeagueClubsData.find(c => c.id === a1).name,
                competition: 'League', result: null, played: false
            });
        } else {
             // Handle BYE for dummy team
            const realTeamId = h1 === 'DUMMY_TEAM' ? a1 : h1;
            if (realTeamId !== 'DUMMY_TEAM') {
                currentRoundMatches.push({
                    id: generateUniqueId('M'), week: round + 1, season: season,
                    homeTeamId: realTeamId, homeTeamName: allLeagueClubsData.find(c => c.id === realTeamId).name,
                    awayTeamId: 'BYE', awayTeamName: 'BYE', competition: 'League', result: 'BYE', played: true
                });
            }
        }


        // Pair remaining teams in a "cross" pattern
        for (let i = 1; i < N / 2; i++) {
            const teamA_id = teams[i];
            const teamB_id = teams[N - i];

            let h, a;
            // Home/away swap for balance in each round's pairings
            if (round % 2 === 0) {
                h = teamA_id;
                a = teamB_id;
            } else {
                h = teamB_id;
                a = teamA_id;
            }

            if (h !== 'DUMMY_TEAM' && a !== 'DUMMY_TEAM') {
                currentRoundMatches.push({
                    id: generateUniqueId('M'), week: round + 1, season: season,
                    homeTeamId: h, homeTeamName: allLeagueClubsData.find(c => c.id === h).name,
                    awayTeamId: a, awayTeamName: allLeagueClubsData.find(c => c.id === a).name,
                    competition: 'League', result: null, played: false
                });
            } else {
                const realTeamId = h === 'DUMMY_TEAM' ? a : h;
                if (realTeamId !== 'DUMMY_TEAM') {
                    currentRoundMatches.push({
                        id: generateUniqueId('M'), week: round + 1, season: season,
                        homeTeamId: realTeamId, homeTeamName: allLeagueClubsData.find(c => c.id === realTeamId).name,
                        awayTeamId: 'BYE', awayTeamName: 'BYE', competition: 'League', result: 'BYE', played: true
                    });
                }
            }
        }

        newSchedule.push({
            week: round + 1,
            matches: currentRoundMatches.filter(m => m.homeTeamId !== 'DUMMY_TEAM' && m.awayTeamId !== 'DUMMY_TEAM') // Filter out any BYE matches
        });

        // Rotate teams: Keep first team fixed. Move last team to second position. Shift others.
        // Slice the array for rotation (exclude pivot at index 0)
        const lastOfRotating = teams.pop();
        teams.splice(1, 0, lastOfRotating); // Insert at index 1

        // The rotation should be like this:
        // teams = [T1, T2, T3, T4, T5, T6]
        // After 1st round: [T1, T6, T2, T3, T4, T5] (T1 fixed, T6 moves to T2's spot, others shift)
        // This is done by taking the last element and inserting it right after the first.
    }

    console.log(`Generated ${newSchedule.length} match weeks.`);
    return newSchedule;
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

