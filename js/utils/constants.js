// js/utils/constants.js

/**
 * Defines constant values and enums for the game.
 * Uses 'shortcodes' where possible to minimize save file size.
 */

// --- Game Phases ---
export const GAME_PHASE = {
    SETUP: 'setup',
    OPPONENT_CUSTOMIZATION: 'opponent_customization', // Still needed for cup opponents
    PRE_SEASON_PLANNING: 'pre_season',
    WEEKLY_PLANNING: 'weekly_planning',
    MATCH_DAY: 'match_day',
    POST_MATCH: 'post_match',
    END_OF_SEASON: 'end_season',
    OFF_SEASON: 'off_season'
};

// --- Time Management ---
export const WEEKLY_BASE_HOURS = 10;
export const DECEMBER_HOURS_REDUCTION = 5; // Hours reduced during December

// --- Season Length & Calendar ---
export const PRE_SEASON_WEEKS = 4; // June Weeks 1-4
export const TOTAL_GAME_WEEKS_IN_YEAR = 52; // Total weeks in the game year

// LEAGUE_MATCH_WEEKS is now derived from TOTAL_GAME_WEEKS_IN_YEAR - PRE_SEASON_WEEKS
export const LEAGUE_MATCH_WEEKS = TOTAL_GAME_WEEKS_IN_YEAR - PRE_SEASON_WEEKS; // 52 - 4 = 48 weeks
export const TOTAL_LEAGUE_WEEKS = TOTAL_GAME_WEEKS_IN_YEAR; // The entire 52 weeks is the "league season" cycle

export const SEASON_START_MONTH_INDEX = 5; // June (0-indexed: Jan=0, Feb=1...June=5)
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// NEW Calendar Flow: 52 weeks total, with varying month lengths
// startWeek is the absolute gameState.currentWeek value
export const GAME_WEEK_TO_MONTH_MAP = [
    // June: Pre-season (Weeks 1-4)
    { monthIdxOffset: 0, weeks: 4, name: 'June', isPreSeason: true, startWeek: 1 }, // Week 1-4
    // July: League starts (Weeks 5-8)
    { monthIdxOffset: 1, weeks: 4, name: 'July', isLeague: true, startWeek: 5 }, // Week 5-8
    // August: League (Weeks 9-13) - 5 weeks
    { monthIdxOffset: 2, weeks: 5, name: 'August', isLeague: true, startWeek: 9 }, // Week 9-13
    // September: League (Weeks 14-17) - 4 weeks
    { monthIdxOffset: 3, weeks: 4, name: 'September', isLeague: true, startWeek: 14 }, // Week 14-17
    // October: League (Weeks 18-21) - 4 weeks
    { monthIdxOffset: 4, weeks: 4, name: 'October', isLeague: true, startWeek: 18 }, // Week 18-21
    // November: League (Weeks 22-26) - 5 weeks
    { monthIdxOffset: 5, weeks: 5, name: 'November', isLeague: true, startWeek: 22 }, // Week 22-26
    // December: League + Special Conditions (Weeks 27-30) - 4 weeks
    { monthIdxOffset: 6, weeks: 4, name: 'December', isLeague: true, isSpecialMonth: true, startWeek: 27 }, // Week 27-30
    // January: League (Weeks 31-35) - 5 weeks
    { monthIdxOffset: 7, weeks: 5, name: 'January', isLeague: true, startWeek: 31 }, // Week 31-35
    // February: League (Weeks 36-39) - 4 weeks
    { monthIdxOffset: 8, weeks: 4, name: 'February', isLeague: true, startWeek: 36 }, // Week 36-39
    // March: League (Weeks 40-44) - 5 weeks
    { monthIdxOffset: 9, weeks: 5, name: 'March', isLeague: true, startWeek: 40 }, // Week 40-44
    // April: League (Weeks 45-48) - 4 weeks
    { monthIdxOffset: 10, weeks: 4, name: 'April', isLeague: true, startWeek: 45 }, // Week 45-48
    // May: League Ends, Final weeks (Weeks 49-52) - 4 weeks
    { monthIdxOffset: 11, weeks: 4, name: 'May', isLeague: true, startWeek: 49 } // Week 49-52
];


// County Cup Schedule (Absolute gameState.currentWeek values)
// Recalculated based on the new 52-week calendar structure
export const COUNTY_CUP_ANNOUNCEMENT_WEEKS = [
    10, // August Week 2 (Game Week 10)
    15, // September Week 2 (Game Week 15) - shifted from 14
    19, // October Week 2 (Game Week 19) - shifted from 18
    23, // November Week 2 (Game Week 23) - shifted from 22
    32, // January Week 2 (Game Week 32) - shifted from 30
    37, // February Week 2 (Game Week 37) - shifted from 34
    41, // March Week 2 (Game Week 41) - shifted from 38
    46  // April Week 2 (Game Week 46 - Final Announcement) - shifted from 42
];
export const COUNTY_CUP_MATCH_WEEKS = [
    12, // August Week 4 (Game Week 12)
    17, // September Week 4 (Game Week 17) - shifted from 16
    21, // October Week 4 (Game Week 21) - shifted from 20
    25, // November Week 4 (Game Week 25) - shifted from 24
    34, // January Week 4 (Game Week 34) - shifted from 32
    39, // February Week 4 (Game Week 39) - shifted from 36
    43, // March Week 4 (Game Week 43) - shifted from 40
    48  // April Week 4 (Game Week 48 - Final) - shifted from 44
];

export const COUNTY_CUP_ROUND_NAMES = {
    12: 'Round 1', // Keyed by absolute game week of the match
    17: 'Round 2',
    21: 'Round 3',
    25: 'Round 4',
    34: 'Round 5',
    39: 'Quarter-Finals',
    43: 'Semi-Finals',
    48: 'Final'
};

export const COMMITTEE_MEETING_FREQUENCY_WEEKS = 4; // Unchanged

// --- Player Attributes ---
export const PLAYER_ATTRIBUTES = {
    PAC: 'Pace', STA: 'Stamina', STR: 'Strength', AGI: 'Agility', JUM: 'Jumping Reach',
    FT: 'First Touch', DRI: 'Dribbling', PAS: 'Passing', SHO: 'Shooting', TKL: 'Tackling',
    HD: 'Heading', CRO: 'Crossing', SP: 'Set Pieces', GK: 'Goalkeeping',
    AGG: 'Aggression', COM: 'Composure', CON: 'Concentration', DEC: 'Decision Making',
    DET: 'Determination', LEA: 'Leadership', OTB: 'Off the Ball', POS: 'Positioning',
    TMW: 'Teamwork', WRK: 'Work Rate',
};

// --- Player Positions ---
export const PLAYER_POSITIONS = {
    GK: 'Goalkeeper', SW: 'Sweeper', CB: 'Centre Back', LB: 'Left Back', RB: 'Right Back',
    LWB: 'Left Wing Back', RWB: 'Right Wing Back', CDM: 'Defensive Midfielder', CM: 'Central Midfielder',
    LM: 'Left Midfielder', RM: 'Right Midfielder', CAM: 'Attacking Midfielder',
    LW: 'Left Winger', RW: 'Right Winger', ST: 'Striker', CF: 'Centre Forward',
};

// --- Player Traits / Personalities ---
export const PLAYER_TRAITS = {
    AMB: 'Ambition', LOY: 'Loyalty', TEM: 'Temperament', PRO: 'Professionalism', COM: 'Commitment Level'
};

// --- Committee Member Roles ---
export const COMMITTEE_ROLES = {
    CHAIR: 'Chairperson', SEC: 'Club Secretary', TREAS: 'Treasurer', GRNDS: 'Head Groundsman',
    SOC: 'Social Secretary', PLYR_REP: 'Player Representative', V_COORD: 'Volunteer Coordinator'
};

// --- Facilities (with new grades and condition properties) ---
export const FACILITIES = {
    PITCH: 'Pitch',
    CHGRMS: 'Changing Rooms',
    TOILETS: 'Toilets',
    SNACKBAR: 'Snack Bar',
    COVERED_STAND: 'Covered Standing Area',
    TURNSTILES: 'Turnstiles',
};

export const FACILITY_GRADES = ['N/A', 'G', 'F', 'E', 'D', 'C', 'B', 'A']; // N/A for level 0. G is now 1. F is 2.
export const PITCH_UNPLAYABLE_THRESHOLD = 10; // Pitch is unplayable if condition <= this %


// --- Finance Transaction Types ---
export const TRANSACTION_TYPE = {
    SUBS_INCOME: 'Player Subscriptions', FUNDRAISE_IN: 'Fundraising Event Income', SPONSOR_IN: 'Sponsorship Income',
    MATCH_DAY_IN: 'Match Day Income', KIT_EXPENSE: 'Kit & Equipment Expense', PITCH_EXPENSE: 'Pitch Hire/Maintenance',
    TRAVEL_EXPENSE: 'Travel Expense', FAC_UPGRADE_EXP: 'Facility Upgrade Expense', WAGES_EXP: 'Staff/Player Wages',
    OTHER_EXP: 'Other Expense', PRIZE_MONEY: 'Prize Money', CUP_ENTRY_FEE: 'Cup Entry Fee'
};

// --- Weekly Tasks (updated with new specific maintenance types) ---
export const WEEKLY_TASK_TYPES = {
    PLAYER_CONVO: 'Player Conversation',
    RECRUIT_PLYR: 'Recruit New Player',
    PLAN_FUNDRAISE: 'Plan Fundraising Event',
    COMM_ENGAGE: 'Engage Committee',
    SPONSOR_SEARCH: 'Search for Sponsors',
    ADMIN_WORK: 'General Admin',
    FAC_CHECK: 'General Facility Check',

    // Specific maintenance tasks (dynamically added based on condition)
    PITCH_MAINT: 'General Pitch Maintenance', // This improves condition if not too low
    FIX_PITCH_DAMAGE: 'Repair Pitch Damage', // For severe damage or unplayable pitch
    CLEAN_CHGRMS_SPECIFIC: 'Deep Clean Changing Rooms', // For dirty/damaged changing rooms
};

// --- Random Event Types ---
export const EVENT_TYPES = {
    GOOD_VOLUNTEER: 'New Volunteer Appears', BAD_PITCH_DAMAGE: 'Pitch Damaged', NEUTRAL_JOURNALIST: 'Journalist Interview Request',
    GOOD_SMALL_SPONSOR: 'New Local Sponsorship Offer', BAD_EQUIPMENT_BREAK: 'Equipment Breakdown',
    BAD_PLAYER_ABSENT: 'Player Misses Match', GOOD_YOUTH_INTEREST: 'Youth Talent Emerges',
    BAD_COUNCIL_COMPLAINT: 'Council Complaint'
};
export const DECEMBER_BAD_EVENT_CHANCE_MULTIPLIER = 3; // Triple chance of bad events in December

// --- Competition Types ---
export const COMPETITION_TYPE = {
    LEAGUE: 'League',
    COUNTY_CUP: 'County Cup'
};

// --- Default Values / Game Settings ---
export const DEFAULT_STARTING_BALANCE = 500;
export const DEFAULT_INITIAL_PLAYERS = 15;
export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 20;

// --- Regional Pyramid Structure ---
export const NUM_REGIONAL_CLUBS = 60; // Total number of clubs in the regional pyramid (including player's)

export const LEAGUE_TIERS = {
    PREMIER: {
        level: 3,
        nameSuffix: 'Premier Division',
        numTeams: 20,
        promotedTeams: 2, // Teams promoted to a higher, non-regional league (e.g., National League System Step 6)
        relegatedTeams: 2,
        // Seed range for this league (inclusive, 1 is best)
        seedRange: { min: 1, max: 20 }
    },
    DIV1: {
        level: 2,
        nameSuffix: 'Division One',
        numTeams: 20,
        promotedTeams: 2,
        relegatedTeams: 2,
        seedRange: { min: 21, max: 40 }
    },
    DIV2: {
        level: 1, // Lowest tier
        nameSuffix: 'Division Two',
        numTeams: 20,
        promotedTeams: 2,
        relegatedTeams: 0, // No relegation from bottom tier
        seedRange: { min: 41, max: 60 } // Player's club will be seed 60
    }
};

// Initial pool size for County Cup teams generated at game start
// Now that we have 60 clubs, the INITIAL_CUP_POOL_SIZE can be 0,
// as the cup draw will pull from the existing 60 clubs + generate new ones as needed.
export const INITIAL_CUP_POOL_SIZE = 0;

// Kit Colors (for generation)
export const KIT_COLORS = [
    '#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#FFFFFF', '#000000', '#C0C0C0', '#800080', '#008000', '#800000',
    '#4B0082', '#A52A2A', '#D2B48C', '#F5F5DC'
];

// --- Club Customization Status ---
export const CLUB_CUSTOMIZATION_STATUS = {
    NOT_CUSTOMIZED: 'not_customized',
    CUSTOMIZED_ONCE: 'customized_once'
};
