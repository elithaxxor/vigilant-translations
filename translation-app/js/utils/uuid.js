/**
 * UUID Generation Utility
 *
 * Provides RFC4122 version 4 compliant UUID generation
 */

/**
 * Generate a UUID v4 (random-based)
 *
 * @returns {string} A randomly generated UUID
 */
export function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

/**
 * Generate a simple unique ID (not a true UUID)
 * Useful when a shorter ID is needed
 *
 * @param {number} [length=8] - Length of the ID
 * @returns {string} A unique ID string
 */
export function generateId(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const timestamp = Date.now().toString(36);

    // Add timestamp prefix for additional uniqueness
    result += timestamp.slice(-4);

    // Add random characters
    const randomLength = length - result.length;
    for (let i = 0; i < randomLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
}

/**
 * Check if a string is a valid UUID v4
 *
 * @param {string} uuid - The string to validate
 * @returns {boolean} Whether the string is a valid UUID v4
 */
export function isValidUuid(uuid) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}