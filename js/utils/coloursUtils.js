// js/utils/coloursUtils.js

/**
 * Provides utility functions for color manipulation and analysis.
 * Uses British English spelling "colours".
 */

/**
 * Converts a HEX color string to an RGB object.
 * @param {string} hex - The HEX color string (e.g., "#RRGGBB").
 * @returns {object} An object { r: number, g: number, b: number }.
 */
function hexToRgb(hex) {
    if (!hex || !hex.startsWith('#')) {
        console.warn('Invalid hex color provided:', hex);
        return { r: 0, g: 0, b: 0 }; // Default to black for invalid input
    }
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

/**
 * Calculates the luminance of an RGB color.
 * Formula based on perceived brightness.
 * @param {object} rgb - An object { r: number, g: number, b: number }.
 * @returns {number} Luminance value (0-255).
 */
function getLuminance(rgb) {
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
}

/**
 * Determines if a HEX color is light or dark based on its luminance.
 * @param {string} hexColor - The HEX color string.
 * @returns {boolean} True if the color is light (suitable for dark text), false if dark (suitable for light text).
 */
export function isColorLight(hexColor) {
    const rgb = hexToRgb(hexColor);
    // Standard threshold for perceived lightness. 186 is often used.
    return getLuminance(rgb) > 186;
}

/**
 * Returns a contrasting text color (black or white) for a given background color.
 * @param {string} backgroundColor - The background HEX color.
 * @returns {string} "#000000" (black) or "#FFFFFF" (white).
 */
export function getContrastingTextColor(backgroundColor) {
    return isColorLight(backgroundColor) ? '#000000' : '#FFFFFF';
}
