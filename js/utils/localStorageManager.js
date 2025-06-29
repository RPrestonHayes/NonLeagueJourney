// js/utils/localStorageManager.js

/**
 * Manages saving and loading game state to/from Local Storage.
 * Utilizes LZ-String for data compression to minimize storage footprint.
 */

const SAVE_KEY = 'nonLeagueJourneySave'; // Key under which game data is stored in localStorage

/**
 * Saves the current game state object to Local Storage.
 * The game state is first converted to a JSON string, then compressed using LZ-String,
 * and finally stored.
 * @param {object} gameState - The entire game state object to save.
 */
export function saveGame(gameState) {
    try {
        const jsonString = JSON.stringify(gameState);
        // Compress the JSON string using LZ-String
        const compressedData = LZString.compressToBase64(jsonString);

        localStorage.setItem(SAVE_KEY, compressedData);
        console.log("Game state saved (compressed size:", compressedData.length, "bytes)");
        // Optional: Log original size vs compressed size for debugging compression efficiency
        // console.log("Original size:", jsonString.length, "bytes");

    } catch (e) {
        console.error("Error saving game to local storage:", e);
        alert("Error saving game. Your browser's local storage might be full or blocked.");
    }
}

/**
 * Loads the game state from Local Storage.
 * Retrieves the compressed string, decompresses it, and then parses it back into an object.
 * @returns {object|null} The loaded game state object, or null if no save found or an error occurred.
 */
export function loadGame() {
    try {
        const compressedData = localStorage.getItem(SAVE_KEY);
        if (compressedData) {
            // Decompress the data using LZ-String
            const jsonString = LZString.decompressFromBase64(compressedData);
            if (jsonString === null) { // LZ-String returns null on decompression failure
                console.error("Decompression failed. Data might be corrupted.");
                return null;
            }
            const gameState = JSON.parse(jsonString);
            console.log("Game state loaded successfully.");
            return gameState;
        }
    } catch (e) {
        console.error("Error loading game from local storage:", e);
        alert("Error loading game. Your save file might be corrupted.");
    }
    return null; // No save found or error
}

/**
 * Clears the game save from Local Storage.
 */
export function clearSave() {
    try {
        localStorage.removeItem(SAVE_KEY);
        console.log("Game save cleared from local storage.");
    } catch (e) {
        console.error("Error clearing save from local storage:", e);
        alert("Error clearing game save.");
    }
}

