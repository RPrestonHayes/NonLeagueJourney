// js/utils/constants.js

/**
 * Defines constant values and enums for the game.
 * Uses 'shortcodes' where possible to minimize save file size.
 */

// --- Game Phases ---
export const GAME_PHASE = {
    SETUP: 'setup',                       // Initial game setup (hometown, club name)
    OPPONENT_CUSTOMIZATION: 'opponent_customization', // One-time opponent club customization
    PRE_SEASON_PLANNING: 'pre_season',    // Before season starts, squad/facility work
    WEEKLY_PLANNING: 'weekly_planning',   // Player allocates weekly hours
    MATCH_DAY: 'match_day',               // Match simulation occurs
    POST_MATCH: 'post_match',             // After match, results reviewed, injuries/morale
    END_OF_SEASON: 'end_season',          // Season review, promotions/relegations, awards
    OFF_SEASON: 'off_season'              // Between seasons, transfers, major facility work
};

// --- Time Management ---
export const WEEKLY_BASE_HOURS = 40; // Base hours a player can allocate per week

// --- Season Length ---
export const PRE_SEASON_WEEKS = 4; // Weeks before league matches start
export const TOTAL_LEAGUE_MATCH_WEEKS = 22; // For a 12-team league (11 opponents * 2 matches) = 22 match weeks
export const TOTAL_LEAGUE_WEEKS = PRE_SEASON_WEEKS + TOTAL_LEAGUE_MATCH_WEEKS; // Total weeks in a standard season
export const COMMITTEE_MEETING_FREQUENCY_WEEKS = 4; // How often committee meetings occur (e.g., every 4 weeks)


// --- Player Attributes (Shortcodes for display/storage) ---
// Each attribute will have a value between 1-20
export const PLAYER_ATTRIBUTES = {
    // Physical
    PAC: 'Pace',
    STA: 'Stamina',
    STR: 'Strength',
    AGI: 'Agility',
    JUM: 'Jumping Reach',
    // Technical
    FT: 'First Touch',
    DRI: 'Dribbling',
    PAS: 'Passing',
    SHO: 'Shooting',
    TKL: 'Tackling',
    HD: 'Heading',
    CRO: 'Crossing',
    SP: 'Set Pieces',
    GK: 'Goalkeeping', // General for GKs, will have sub-attributes
    // Mental
    AGG: 'Aggression',
    COM: 'Composure',
    CON: 'Concentration',
    DEC: 'Decision Making',
    DET: 'Determination',
    LEA: 'Leadership',
    OTB: 'Off the Ball',
    POS: 'Positioning',
    TMW: 'Teamwork',
    WRK: 'Work Rate',
};

// --- Player Positions (Shortcodes) ---
export const PLAYER_POSITIONS = {
    GK: 'Goalkeeper',
    SW: 'Sweeper', // Less common, but for depth
    CB: 'Centre Back',
    LB: 'Left Back',
    RB: 'Right Back',
    LWB: 'Left Wing Back',
    RWB: 'Right Wing Back',
    CDM: 'Defensive Midfielder',
    CM: 'Central Midfielder',
    LM: 'Left Midfielder',
    RM: 'Right Midfielder',
    CAM: 'Attacking Midfielder',
    LW: 'Left Winger',
    RW: 'Right Winger',
    ST: 'Striker',
    CF: 'Centre Forward',
};

// --- Player Traits / Personalities (for dialogue and events) ---
export const PLAYER_TRAITS = {
    AMB: 'Ambition',        // Desire to move to bigger clubs
    LOY: 'Loyalty',         // How likely to stay at the club
    TEM: 'Temperament',     // How they react to situations (calm/fiery)
    PRO: 'Professionalism', // Adherence to training/rules
    COM: 'Commitment Level' // Unpaid players: affects attendance
};

// --- Committee Member Roles ---
export const COMMITTEE_ROLES = {
    CHAIR: 'Chairperson',
    SEC: 'Club Secretary',
    TREAS: 'Treasurer',
    GRNDS: 'Head Groundsman',
    SOC: 'Social Secretary',
    PLYR_REP: 'Player Representative',
    V_COORD: 'Volunteer Coordinator'
};

// --- Facilities ---
export const FACILITIES = {
    PITCH: 'Pitch Condition',
    CHGRMS: 'Changing Rooms',
    TOILETS: 'Toilets',
    SNACKBAR: 'Snack Bar',
    COVERED_STAND: 'Covered Standing',
    TURNSTILES: 'Turnstiles',
    // More facilities can be added here
};

// --- Finance Transaction Types ---
export const TRANSACTION_TYPE = {
    SUBS_INCOME: 'Player Subscriptions',
    FUNDRAISE_IN: 'Fundraising Event Income',
    SPONSOR_IN: 'Sponsorship Income',
    MATCH_DAY_IN: 'Match Day Income', // Later game
    KIT_EXPENSE: 'Kit & Equipment Expense',
    PITCH_EXPENSE: 'Pitch Hire/Maintenance',
    TRAVEL_EXPENSE: 'Travel Expense',
    FAC_UPGRADE_EXP: 'Facility Upgrade Expense',
    WAGES_EXP: 'Staff/Player Wages', // Later game
    OTHER_EXP: 'Other Expense',
    PRIZE_MONEY: 'Prize Money' // For cup wins, promotion bonuses
};

// --- Weekly Tasks (example types, will have associated time/cost) ---
export const WEEKLY_TASK_TYPES = {
    PITCH_MAINT: 'Pitch Maintenance',
    PLAYER_CONVO: 'Player Conversation',
    RECRUIT_PLYR: 'Recruit New Player',
    PLAN_FUNDRAISE: 'Plan Fundraising Event',
    COMM_ENGAGE: 'Engage Committee',
    FAC_CHECK: 'Facility Check',
    SPONSOR_SEARCH: 'Search for Sponsors',
    ADMIN_WORK: 'General Admin'
};

// --- Random Event Types (basic examples) ---
export const EVENT_TYPES = {
    GOOD_VOLUNTEER: 'New Volunteer Appears',
    BAD_PITCH_DAMAGE: 'Pitch Damaged',
    NEUTRAL_JOURNALIST: 'Journalist Interview Request',
    GOOD_SMALL_SPONSOR: 'New Local Sponsorship Offer',
    BAD_EQUIPMENT_BREAK: 'Equipment Breakdown',
    BAD_PLAYER_ABSENT: 'Player Misses Match', // Due to non-injury reason
    GOOD_YOUTH_INTEREST: 'Youth Talent Emerges',
    BAD_COUNCIL_COMPLAINT: 'Council Complaint'
};

// --- Default Values / Game Settings ---
export const DEFAULT_STARTING_BALANCE = 500; // Example starting funds
export const DEFAULT_INITIAL_PLAYERS = 15; // Number of players in initial squad
export const DEFAULT_LEAGUE_SIZE = 12; // Number of teams in the starting league (player's club + 11 opponents)
export const ATTRIBUTE_MIN = 1;
export const ATTRIBUTE_MAX = 20; // Max value for player attributes and committee skills

// Kit Colors (for generation)
export const KIT_COLORS = [
    '#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FF00FF', '#00FFFF', '#FFA500', // Red, Blue, Yellow, Green, Magenta, Cyan, Orange
    '#FFFFFF', '#000000', '#C0C0C0', '#800080', '#008000', '#800000', // White, Black, Silver, Purple, Dark Green, Maroon
    '#4B0082', '#A52A2A', '#D2B48C', '#F5F5DC' // Indigo, Brown, Tan, Beige
];

