/**
 * Centralized configuration for Blood on the Clocktower (BOTC) analytics.
 * Ported from botc_config.py
 */

// Scripts considered part of the normal rotation
// All other scripts are considered Teensyville (small-player scripts)
export const NORMAL_SCRIPTS = new Set([
    "trouble brewing",
    "bad moon rising",
    "sects & violets",
    "trouble in violets",
    "trouble in legion",
    "hide & seek",
    "trouble brewing on expert mode",
    "trained killer",
    "irrational behavior",
    "binary supernovae",
    "everybody can play"
]);

// List of commonly used game modes/scripts for dropdown menus
export const COMMON_SCRIPTS = [
    "Trouble Brewing",
    "Bad Moon Rising",
    "Sects & Violets",
    "Trouble in Violets",
    "No Greater Joy",
    "Over the River",
    "Laissez un Faire",
    "Trouble in Legion",
    "Hide & Seek",
    "Trouble Brewing on Expert Mode",
    "Trained Killer",
    "Irrational Behavior",
    "Binary Supernovae",
    "A Leech of Distrust",
    "Everybody Can Play",
];

// Mapping of normalized character names to their role types
export const CHARACTER_ROLE_TYPES = {
    // Demons
    "al-hadikhia": "Demons",
    "fang_gu": "Demons",
    "imp": "Demons",
    "kazali": "Demons",
    "legion": "Demons",
    "leviathan": "Demons",
    "lil'_monsta": "Demons",
    "lleech": "Demons",
    "lord_of_typhon": "Demons",
    "no_dashii": "Demons",
    "ojo": "Demons",
    "po": "Demons",
    "pukka": "Demons",
    "riot": "Demons",
    "shabaloth": "Demons",
    "vigormortis": "Demons",
    "vortox": "Demons",
    "yaggababble": "Demons",
    "zombuul": "Demons",
    // Minions
    "assassin": "Minions",
    "baron": "Minions",
    "boffin": "Minions",
    "boomdandy": "Minions",
    "cerenovus": "Minions",
    "devil's_advocate": "Minions",
    "evil_twin": "Minions",
    "fearmonger": "Minions",
    "goblin": "Minions",
    "godfather": "Minions",
    "harpy": "Minions",
    "marionette": "Minions",
    "mastermind": "Minions",
    "mezepheles": "Minions",
    "organ_grinder": "Minions",
    "pit-hag": "Minions",
    "poisoner": "Minions",
    "psychopath": "Minions",
    "scarlet_woman": "Minions",
    "spy": "Minions",
    "summoner": "Minions",
    "vizier": "Minions",
    "widow": "Minions",
    "witch": "Minions",
    "wizard": "Minions",
    "wraith": "Minions",
    "xaan": "Minions",
    // Outsiders
    "barber": "Outsiders",
    "butler": "Outsiders",
    "damsel": "Outsiders",
    "drunk": "Outsiders",
    "golem": "Outsiders",
    "goon": "Outsiders",
    "hatter": "Outsiders",
    "heretic": "Outsiders",
    "hermit": "Outsiders",
    "klutz": "Outsiders",
    "lunatic": "Outsiders",
    "moonchild": "Outsiders",
    "mutant": "Outsiders",
    "ogre": "Outsiders",
    "plague_doctor": "Outsiders",
    "politician": "Outsiders",
    "puzzlemaster": "Outsiders",
    "recluse": "Outsiders",
    "saint": "Outsiders",
    "snitch": "Outsiders",
    "sweetheart": "Outsiders",
    "tinker": "Outsiders",
    "zealot": "Outsiders",
    // Townsfolk
    "acrobat": "Townsfolk",
    "alchemist": "Townsfolk",
    "alsaahir": "Townsfolk",
    "amnesiac": "Townsfolk",
    "artist": "Townsfolk",
    "atheist": "Townsfolk",
    "balloonist": "Townsfolk",
    "banshee": "Townsfolk",
    "bounty_hunter": "Townsfolk",
    "cannibal": "Townsfolk",
    "chambermaid": "Townsfolk",
    "chef": "Townsfolk",
    "choirboy": "Townsfolk",
    "clockmaker": "Townsfolk",
    "courtier": "Townsfolk",
    "cult_leader": "Townsfolk",
    "dreamer": "Townsfolk",
    "empath": "Townsfolk",
    "engineer": "Townsfolk",
    "exorcist": "Townsfolk",
    "farmer": "Townsfolk",
    "fisherman": "Townsfolk",
    "flowergirl": "Townsfolk",
    "fool": "Townsfolk",
    "fortune_teller": "Townsfolk",
    "gambler": "Townsfolk",
    "general": "Townsfolk",
    "gossip": "Townsfolk",
    "grandmother": "Townsfolk",
    "high_priestess": "Townsfolk",
    "huntsman": "Townsfolk",
    "innkeeper": "Townsfolk",
    "investigator": "Townsfolk",
    "juggler": "Townsfolk",
    "king": "Townsfolk",
    "knight": "Townsfolk",
    "librarian": "Townsfolk",
    "lycanthrope": "Townsfolk",
    "magician": "Townsfolk",
    "mathematician": "Townsfolk",
    "mayor": "Townsfolk",
    "minstrel": "Townsfolk",
    "monk": "Townsfolk",
    "nightwatchman": "Townsfolk",
    "noble": "Townsfolk",
    "oracle": "Townsfolk",
    "pacifist": "Townsfolk",
    "philosopher": "Townsfolk",
    "pixie": "Townsfolk",
    "poppy_grower": "Townsfolk",
    "preacher": "Townsfolk",
    "princess": "Townsfolk",
    "professor": "Townsfolk",
    "ravenkeeper": "Townsfolk",
    "sage": "Townsfolk",
    "sailor": "Townsfolk",
    "savant": "Townsfolk",
    "seamstress": "Townsfolk",
    "shugenja": "Townsfolk",
    "slayer": "Townsfolk",
    "snake_charmer": "Townsfolk",
    "soldier": "Townsfolk",
    "steward": "Townsfolk",
    "tea_lady": "Townsfolk",
    "town_crier": "Townsfolk",
    "undertaker": "Townsfolk",
    "village_idiot": "Townsfolk",
    "virgin": "Townsfolk",
    "washerwoman": "Townsfolk",
    // Travellers
    "apprentice": "Travellers",
    "barista": "Travellers",
    "beggar": "Travellers",
    "bishop": "Travellers",
    "bone_collector": "Travellers",
    "bureaucrat": "Travellers",
    "butcher": "Travellers",
    "cacklejack": "Travellers",
    "deviant": "Travellers",
    "gangster": "Travellers",
    "gnome": "Travellers",
    "gunslinger": "Travellers",
    "harlot": "Travellers",
    "judge": "Travellers",
    "matron": "Travellers",
    "scapegoat": "Travellers",
    "thief": "Travellers",
    "voudon": "Travellers",
};

// Fabled characters (game-level modifiers, not player roles)
export const FABLED = [
    "Angel",
    "Buddhist",
    "Deus_Ex_Fiasco",
    "Djinn",
    "Doomsayer",
    "Duchess",
    "Ferryman",
    "Fiddler",
    "Fibbin",
    "Hell's_Librarian",
    "Revolutionary",
    "Sentinel",
    "Spirit_Of_Ivory",
    "Toymaker",
];

// Loric characters (game-level modifiers, not player roles)
export const LORICS = [
    "Big_Wig",
    "Bootlegger",
    "Gardener",
    "God_Of_Ug",
    "Hindu",
    "Knaves",
    "Pope",
    "Storm_Catcher",
    "Tor",
    "Ventriloquist",
    "Zenomancer",
];

/**
 * Return a lowercase stripped version of a script name for comparison.
 */
export function normalizeScriptName(name) {
    return (name || "").trim().toLowerCase();
}

/**
 * Categorize a script as 'Normal' or 'Teensyville'.
 */
export function categorizeScript(name) {
    return NORMAL_SCRIPTS.has(normalizeScriptName(name)) ? "Normal" : "Teensyville";
}

/**
 * Normalize a character name for consistent lookups.
 * Converts spaces to underscores, handles apostrophes and hyphens,
 * and makes it lowercase for case-insensitive matching.
 */
export function normalizeCharacterName(name) {
    if (!name) return "";
    return name.replace(/ /g, "_").toLowerCase().trim();
}

/**
 * Get the role type for a character.
 * Returns: "Townsfolk", "Outsiders", "Minions", "Demons", or "Travellers"
 */
export function getCharacterRoleType(characterName) {
    const normalized = normalizeCharacterName(characterName);

    // Try exact match first
    if (CHARACTER_ROLE_TYPES[normalized]) {
        return CHARACTER_ROLE_TYPES[normalized];
    }

    // Try with hyphen replaced by underscore
    if (normalized.includes("-")) {
        const altNormalized = normalized.replace(/-/g, "_");
        if (CHARACTER_ROLE_TYPES[altNormalized]) {
            return CHARACTER_ROLE_TYPES[altNormalized];
        }
    }

    // Try with underscore replaced by hyphen
    if (normalized.includes("_")) {
        const altNormalized = normalized.replace(/_/g, "-");
        if (CHARACTER_ROLE_TYPES[altNormalized]) {
            return CHARACTER_ROLE_TYPES[altNormalized];
        }
    }

    return "Unknown";
}
