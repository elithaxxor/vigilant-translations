/**
 * Color Generation Utility
 *
 * Provides functions for generating colors for UI elements,
 * particularly for user avatars in the chat interface.
 */

/**
 * Predefined Tailwind CSS color classes for user avatars
 * Each class should be used with "bg-" prefix
 */
const tailwindColors = [
    'red-500', 'blue-500', 'green-500', 'yellow-500', 'purple-500',
    'pink-500', 'indigo-500', 'teal-500', 'orange-500', 'cyan-500',
    'lime-500', 'emerald-500', 'violet-500', 'fuchsia-500', 'rose-500',
    'amber-500', 'sky-500', 'blue-600', 'green-600', 'red-600'
];

/**
 * Generate a random Tailwind CSS color class
 *
 * @returns {string} A Tailwind CSS color class (e.g., "bg-red-500")
 */
export function generateRandomColor() {
    const colorIndex = Math.floor(Math.random() * tailwindColors.length);
    return `bg-${tailwindColors[colorIndex]}`;
}

/**
 * Generate a color class based on a string (e.g., username)
 * This ensures the same string always gets the same color
 *
 * @param {string} str - String to generate color from
 * @returns {string} A Tailwind CSS color class
 */
export function generateConsistentColor(str) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Get positive value and modulo to get color index
    const positiveHash = Math.abs(hash);
    const colorIndex = positiveHash % tailwindColors.length;

    return `bg-${tailwindColors[colorIndex]}`;
}

/**
 * Generate an HSL color with specified saturation and lightness
 *
 * @param {number} [saturation=80] - Color saturation (0-100)
 * @param {number} [lightness=60] - Color lightness (0-100)
 * @returns {string} CSS HSL color string
 */
export function generateHslColor(saturation = 80, lightness = 60) {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a CSS gradient background
 *
 * @param {string} [direction='to right'] - Gradient direction
 * @returns {string} CSS gradient string
 */
export function generateGradient(direction = 'to right') {
    const hue1 = Math.floor(Math.random() * 360);
    const hue2 = (hue1 + 40 + Math.floor(Math.random() * 30)) % 360;

    return `linear-gradient(${direction}, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 80%, 60%))`;
}

/**
 * Generate a set of complementary colors
 *
 * @param {number} count - Number of colors to generate
 * @returns {Array<string>} Array of Tailwind CSS color classes
 */
export function generateComplementaryColors(count) {
    // Ensure we don't exceed the available colors
    const finalCount = Math.min(count, tailwindColors.length);

    // Create array of indices
    const indices = Array.from({ length: tailwindColors.length }, (_, i) => i);

    // Shuffle the indices
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Take the first 'count' colors
    const selectedIndices = indices.slice(0, finalCount);

    // Convert to color classes
    return selectedIndices.map(index => `bg-${tailwindColors[index]}`);
}

/**
 * Check if a color is considered 'light' (for determining text color)
 *
 * @param {string} color - Hex color string (e.g., "#RRGGBB")
 * @returns {boolean} True if the color is considered light
 */
export function isLightColor(color) {
    // Remove hash if present
    const hex = color.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate perceived brightness using YIQ formula
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // YIQ < 128 is considered dark, >= 128 is light
    return yiq >= 128;
}

/**
 * Get appropriate text color for a background color
 *
 * @param {string} bgColor - Background hex color string
 * @returns {string} 'text-white' or 'text-gray-900' Tailwind class
 */
export function getTextColorForBackground(bgColor) {
    return isLightColor(bgColor) ? 'text-gray-900' : 'text-white';
}

export { tailwindColors };