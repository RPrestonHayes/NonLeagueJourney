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
export const PRE_SEASON_WEEKS = 4; // Weeks 1-4 are pre-season. Matches start in game Week 5.
export const TOTAL_LEAGUE_MATCH_WEEKS = 22; // For a 12-team league (11 opponents * 2 matches) = 22 match weeks. These occur from game Week 5 onwards.
export const TOTAL_LEAGUE_WEEKS = PRE_SEASON_WEEKS + TOTAL_LEAGUE_MATCH_WEEKS; // Total weeks in a league season (4 pre-season + 22 regular season = 26 weeks)

export const COMMITTEE_MEETING_FREQUENCY_WEEKS = 4;

// NEW: Calendar Constants (Revised for clarity and accuracy)
export const SEASON_START_MONTH_INDEX = 7; // August (0-indexed: Jan=0, Aug=7)
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// This map defines weeks *relative to the start of the regular season (after pre-season)*.
// So, the first entry (September) starts at week 1 of the "regular season block".
// Example: Game Week 5 is Regular Season Week 1, which is September Week 1.
// Total weeks in this map must sum up to TOTAL_LEAGUE_MATCH_WEEKS (22 weeks).
export const GAME_WEEK_TO_MONTH_MAP = [
    { monthIdxOffset: 1, weeks: 4, name: 'September' }, // Regular Season Weeks 1-4  (Game Weeks 5-8)
    { monthIdxOffset: 2, weeks: 4, name: 'October' },    // Regular Season Weeks 5-8  (Game Weeks 9-12)
    { monthIdxOffset: 3, weeks: 4, name: 'November' },   // Regular Season Weeks 9-12 (Game Weeks 13-16)
    { monthIdxOffset: 4, weeks: 4, name: 'December' },   // Regular Season Weeks 13-16 (Game Weeks 17-20)
    { monthIdxOffset: 5, weeks: 4, name: 'January' },    // Regular Season Weeks 17-20 (Game Weeks 21-24)
    { monthIdxOffset: 6, weeks: 2, name: 'February' },   // Regular Season Weeks 21-22 (Game Weeks 25-26 - Season End)
    // Total weeks so far: 4+4+4+4+4+2 = 22. This matches TOTAL_LEAGUE_MATCH_WEEKS.
    // So, game week 26 is the last week of regular season matches (February Week 2, for example).
];

// Total weeks in a full game year cycle (including off-season)
// This will define how many weeks into off-season it will show before a new season truly starts.
// For example, if season ends at Week 26, then Week 27 starts off-season.
// A full year is 52 weeks.
export const TOTAL_GAME_WEEKS_IN_YEAR = 52;


// --- Player Attributes (Shortcodes for display/storage) ---
export const PLAYER_ATTRIBUTES = {
    PAC: 'Pace', STA: 'Stamina', STR: 'Strength', AGI: 'Agility', JUM: 'Jumping Reach',
    FT: 'First Touch', DRI: 'Dribbling', PAS: 'Passing', SHO: 'Shooting', TKL: 'Tackling',
    HD: 'Heading', CRO: 'Crossing', SP: 'Set Pieces', GK: 'Goalkeeping',
    AGG: 'Aggression', COM: 'Composure', CON: 'Concentration', DEC: 'Decision Making',
    DET: 'Determination', LEA: 'Leadership', OTB: 'Off the Ball', POS: 'Positioning',
    TMW: 'Teamwork', WRK: 'Work Rate',
};

// --- Player Positions (Shortcodes) ---
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

// --- Facilities ---
export const FACILITIES = {
    PITCH: 'Pitch Condition', CHGRMS: 'Changing Rooms', TOILETS: 'Toilets', SNACKBAR: 'Snack Bar',
    COVERED_STAND: 'Covered Standing', TURNSTILES: 'Turnstiles',
};

// --- Finance Transaction Types ---
export const TRANSACTION_TYPE = {
    SUBS_INCOME: 'Player Subscriptions', FUNDRAISE_IN: 'Fundraising Event Income', SPONSOR_IN: 'Sponsorship Income',
    MATCH_DAY_IN: 'Match Day Income', KIT_EXPENSE: 'Kit & Equipment Expense', PITCH_EXPENSE: 'Pitch Hire/Maintenance',
    TRAVEL_EXPENSE: 'Travel Expense', FAC_UPGRADE_EXP: 'Facility Upgrade Expense', WAGES_EXP: 'Staff/Player Wages',
    OTHER_EXP: 'Other Expense', PRIZE_MONEY: 'Prize Money'
};

// --- Weekly Tasks ---
export const WEEKLY_TASK_TYPES = {
    PITCH_MAINT: 'Pitch Maintenance', PLAYER_CONVO: 'Player Conversation', RECRUIT_PLYR: 'Recruit New Player',
    PLAN_FUNDRAISE: 'Plan Fundraising Event', COMM_ENGAGE: 'Engage Committee',
    FAC_CHECK: 'Facility Check', SPONSOR_SEARCH: 'Search for Sponsors', ADMIN_WORK: 'General Admin'
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

