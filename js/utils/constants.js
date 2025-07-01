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
export const PRE_SEASON_WEEKS = 4; // June Weeks 1-4
export const LEAGUE_MATCH_WEEKS = 40; // Total weeks for league matches (approx. 38 matches + buffer)
export const TOTAL_LEAGUE_WEEKS = PRE_SEASON_WEEKS + LEAGUE_MATCH_WEEKS; // Total weeks covering pre-season and league matches (44 weeks)

export const SEASON_START_MONTH_INDEX = 5; // June (0-indexed: Jan=0, Feb=1...June=5)
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// New Calendar Flow (approximate weeks, adjust as needed)
// This map helps the calendar string generation and event scheduling
// Week numbers here are the absolute gameState.currentWeek values
export const GAME_WEEK_TO_MONTH_MAP = [
    // June: Pre-season (Weeks 1-4)
    { monthIdxOffset: 0, weeks: 4, name: 'June', isPreSeason: true, startWeek: 1 },
    // July: League starts (Weeks 5-8, which is July Week 1-4)
    { monthIdxOffset: 1, weeks: 4, name: 'July', isLeague: true, startWeek: 5 },
    // August: League + Cup Round 1 (Weeks 9-12)
    { monthIdxOffset: 2, weeks: 4, name: 'August', isLeague: true, startWeek: 9 },
    // September: League + Cup Round 2 (Weeks 13-16)
    { monthIdxOffset: 3, weeks: 4, name: 'September', isLeague: true, startWeek: 13 },
    // October: League + Cup Round 3 (Weeks 17-20)
    { monthIdxOffset: 4, weeks: 4, name: 'October', isLeague: true, startWeek: 17 },
    // November: League + Cup Round 4 (Weeks 21-24)
    { monthIdxOffset: 5, weeks: 4, name: 'November', isLeague: true, startWeek: 21 },
    // December: League + Special Conditions (Weeks 25-28)
    { monthIdxOffset: 6, weeks: 4, name: 'December', isLeague: true, isSpecialMonth: true, startWeek: 25 },
    // January: League + Cup Round 5 (Weeks 29-32)
    { monthIdxOffset: 7, weeks: 4, name: 'January', isLeague: true, startWeek: 29 },
    // February: League + Cup QF (Weeks 33-36)
    { monthIdxOffset: 8, weeks: 4, name: 'February', isLeague: true, startWeek: 33 },
    // March: League + Cup SF (Weeks 37-40)
    { monthIdxOffset: 9, weeks: 4, name: 'March', isLeague: true, startWeek: 37 },
    // April: League + Cup Final (Weeks 41-44)
    { monthIdxOffset: 10, weeks: 4, name: 'April', isLeague: true, startWeek: 41 },
    // May: League Ends, Final weeks (Weeks 45-48)
    { monthIdxOffset: 11, weeks: 4, name: 'May', isLeague: true, startWeek: 45 }
    // Total weeks in season cycle: 48.
];


// County Cup Schedule (Absolute gameState.currentWeek values)
// Announcement Week: Always Month Week 2 (e.g., August W2 is game week 10)
export const COUNTY_CUP_ANNOUNCEMENT_WEEKS = [10, 14, 18, 22, 30, 34, 38, 42];
// Match Week: Always Month Week 4 (e.g., August W4 is game week 12)
export const COUNTY_CUP_MATCH_WEEKS = [12, 16, 20, 24, 32, 36, 40, 44];

export const COUNTY_CUP_ROUND_NAMES = {
    12: 'Round 1',
    16: 'Round 2',
    20: 'Round 3',
    24: 'Round 4',
    32: 'Round 5',
    36: 'Quarter-Finals',
    40: 'Semi-Finals',
    44: 'Final'
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
