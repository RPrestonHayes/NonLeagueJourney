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

// --- Season Length & Calendar ---
export const PRE_SEASON_WEEKS = 4;
export const TOTAL_LEAGUE_MATCH_WEEKS = 22;
export const TOTAL_LEAGUE_WEEKS = PRE_SEASON_WEEKS + TOTAL_LEAGUE_MATCH_WEEKS;
export const COMMITTEE_MEETING_FREQUENCY_WEEKS = 4;

export const SEASON_START_MONTH_INDEX = 7;
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const GAME_WEEK_TO_MONTH_MAP = [
    { monthIdxOffset: 1, weeks: 4, name: 'September' },
    { monthIdxOffset: 2, weeks: 4, name: 'October' },
    { monthIdxOffset: 3, weeks: 4, name: 'November' },
    { monthIdxOffset: 4, weeks: 4, name: 'December' },
    { monthIdxOffset: 5, weeks: 4, name: 'January' },
    { monthIdxOffset: 6, weeks: 2, name: 'February' },
];

export const TOTAL_GAME_WEEKS_IN_YEAR = 52;


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
    PITCH: 'Pitch Condition',
    CHGRMS: 'Changing Rooms',
    TOILETS: 'Toilets',
    SNACKBAR: 'Snack Bar',
    COVERED_STAND: 'Covered Standing',
    TURNSTILES: 'Turnstiles',
    // New types of tasks for facilities maintenance/improvement
    IMPROVE_PITCH_COND: 'Improve Pitch Condition',
    CLEAN_CHGRMS: 'Clean Changing Rooms',
    REPAIR_EQUIPMENT: 'Repair Equipment',
};

export const FACILITY_GRADES = ['F', 'E', 'D', 'C', 'B', 'A']; // F is lowest, A is highest

// --- Finance Transaction Types ---
export const TRANSACTION_TYPE = {
    SUBS_INCOME: 'Player Subscriptions', FUNDRAISE_IN: 'Fundraising Event Income', SPONSOR_IN: 'Sponsorship Income',
    MATCH_DAY_IN: 'Match Day Income', KIT_EXPENSE: 'Kit & Equipment Expense', PITCH_EXPENSE: 'Pitch Hire/Maintenance',
    TRAVEL_EXPENSE: 'Travel Expense', FAC_UPGRADE_EXP: 'Facility Upgrade Expense', WAGES_EXP: 'Staff/Player Wages',
    OTHER_EXP: 'Other Expense', PRIZE_MONEY: 'Prize Money'
};

// --- Weekly Tasks (updated with new types and context for facility maintenance) ---
export const WEEKLY_TASK_TYPES = {
    PITCH_MAINT: 'Pitch Maintenance (General)', // Renamed for clarity
    PLAYER_CONVO: 'Player Conversation',
    RECRUIT_PLYR: 'Recruit New Player',
    PLAN_FUNDRAISE: 'Plan Fundraising Event',
    COMM_ENGAGE: 'Engage Committee',
    FAC_CHECK: 'Facility Check (General)', // Renamed
    SPONSOR_SEARCH: 'Search for Sponsors',
    ADMIN_WORK: 'General Admin',

    // Specific maintenance tasks (these might be dynamically added)
    FIX_PITCH_DAMAGE: 'Repair Pitch Damage',
    CLEAN_CHGRMS_SPECIFIC: 'Deep Clean Changing Rooms', // More specific than FAC_CHECK
    // REPAIR_EQUIPMENT is now a general event outcome rather than fixed task
};

// --- Random Event Types ---
export const EVENT_TYPES = {
    GOOD_VOLUNTEER: 'New Volunteer Appears', BAD_PITCH_DAMAGE: 'Pitch Damaged', NEUTRAL_JOURNALIST: 'Journalist Interview Request',
    GOOD_SMALL_SPONSOR: 'New Local Sponsorship Offer', BAD_EQUIPMENT_BREAK: 'Equipment Breakdown',
    BAD_PLAYER_ABSENT: 'Player Misses Match', GOOD_YOUTH_INTEREST: 'Youth Talent Emerges',
    BAD_COUNCIL_COMPLAINT: 'Council Complaint'
};

// --- Default Values / Game Settings ---
export const DEFAULT_STARTING_BALANCE = 500;
export const DEFAULT_INITIAL_PLAYERS = 15;
export const DEFAULT_LEAGUE_SIZE = 12;
export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 20;

// Kit Colors (for generation)
export const KIT_COLORS = [
    '#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#FFFFFF', '#000000', '#C0C0C0', '#800080', '#008000', '#800000',
    '#4B0082', '#A52A2A', '#D2B48C', '#F5F5DC'
];

