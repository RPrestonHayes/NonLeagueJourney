// js/utils/constants.js

/**
 * Defines constant values and enums for the game.
 * Uses 'shortcodes' where possible to minimize save file size.
 */

// --- Game Phases ---
export const GAME_PHASE = {
    SETUP: 'setup',
    OPPONENT_CUSTOMIZATION: 'opponent_customization',
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
export const PRE_SEASON_WEEKS = 4;
export const LEAGUE_MATCH_WEEKS = 40; // Total weeks for league matches (assuming 20 teams playing home/away once)
export const TOTAL_LEAGUE_WEEKS = PRE_SEASON_WEEKS + LEAGUE_MATCH_WEEKS; // Total weeks covering pre-season and league matches

export const SEASON_START_MONTH_INDEX = 5; // June (0-indexed: Jan=0, Feb=1...June=5)
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// New Calendar Flow (approximate weeks, adjust as needed)
// This map helps the calendar string generation and event scheduling
export const GAME_WEEK_TO_MONTH_MAP = [
    // June: Pre-season (Weeks 1-4)
    { monthIdxOffset: 0, weeks: 4, name: 'June', isPreSeason: true },
    // July: League starts (Weeks 5-8, which is July Week 1-4)
    { monthIdxOffset: 1, weeks: 4, name: 'July', isLeague: true },
    // August: League + Cup Round 1 (Weeks 9-12)
    { monthIdxOffset: 2, weeks: 4, name: 'August', isLeague: true },
    // September: League + Cup Round 2 (Weeks 13-16)
    { monthIdxOffset: 3, weeks: 4, name: 'September', isLeague: true },
    // October: League + Cup Round 3 (Weeks 17-20)
    { monthIdxOffset: 4, weeks: 4, name: 'October', isLeague: true },
    // November: League + Cup Round 4 (Weeks 21-24)
    { monthIdxOffset: 5, weeks: 4, name: 'November', isLeague: true },
    // December: League + Special Conditions (Weeks 25-28)
    { monthIdxOffset: 6, weeks: 4, name: 'December', isLeague: true, isSpecialMonth: true },
    // January: League + Cup Round 5 (Weeks 29-32)
    { monthIdxOffset: 7, weeks: 4, name: 'January', isLeague: true },
    // February: League + Cup QF (Weeks 33-36)
    { monthIdxOffset: 8, weeks: 4, name: 'February', isLeague: true },
    // March: League + Cup SF (Weeks 37-40)
    { monthIdxOffset: 9, weeks: 4, name: 'March', isLeague: true },
    // April: League + Cup Final (Weeks 41-44)
    { monthIdxOffset: 10, weeks: 4, name: 'April', isLeague: true },
    // May: League Ends, Final weeks (Weeks 45-48)
    { monthIdxOffset: 11, weeks: 4, name: 'May', isLeague: true }
    // Total weeks in season cycle: 48. Assuming a league of 20 teams (19 games home, 19 away = 38 matches).
    // We can adjust TOTAL_LEAGUE_MATCH_WEEKS to 38 + a few buffer weeks, or have bye weeks.
    // Let's set TOTAL_LEAGUE_MATCH_WEEKS to 40 for now, implying some weeks without league games or buffer.
];


// Cup Schedule (Relative to League Match Weeks, where league match week 1 is currentWeek 5)
// County Cup Announced: Aug W2 (currentWeek 9), Sept W2 (currentWeek 13), Oct W2 (currentWeek 17), Nov W2 (currentWeek 21), Jan W2 (currentWeek 29), Feb W2 (currentWeek 33), Mar W2 (currentWeek 37), Apr W2 (currentWeek 41)
export const COUNTY_CUP_ANNOUNCEMENT_WEEKS = [9, 13, 17, 21, 29, 33, 37, 41];
// County Cup Match: Aug W4 (currentWeek 11), Sept W4 (currentWeek 15), Oct W4 (currentWeek 19), Nov W4 (currentWeek 23), Jan W4 (currentWeek 31), Feb W4 (currentWeek 35), Mar W4 (currentWeek 39), Apr W4 (currentWeek 43)
export const COUNTY_CUP_MATCH_WEEKS = [11, 15, 19, 23, 31, 35, 39, 43]; // Match is always 2 weeks after announcement

export const COUNTY_CUP_ROUND_NAMES = {
    11: 'Round 1',
    15: 'Round 2',
    19: 'Round 3',
    23: 'Round 4',
    31: 'Round 5',
    35: 'Quarter-Finals',
    39: 'Semi-Finals',
    43: 'Final'
};

export const COMMITTEE_MEETING_FREQUENCY_WEEKS = 4; // Unchanged

export const TOTAL_GAME_WEEKS_IN_YEAR = 52; // Still using a 52-week year for full cycle

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
export const DEFAULT_LEAGUE_SIZE = 12; // Assuming 12 teams for now, total matches 22
export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 20;

// Kit Colors (for generation)
export const KIT_COLORS = [
    '#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#FFFFFF', '#000000', '#C0C0C0', '#800080', '#008000', '#800000',
    '#4B0082', '#A52A2A', '#D2B48C', '#F5F5DC'
];