/**
 * Name Generator Utility
 *
 * This module provides functions for generating random, fun usernames
 * composed of an adjective, a noun, and a random number.
 *
 * Used primarily for chat user creation to provide friendly, memorable names.
 */

// Array of fun adjectives for name generation
const funnyAdjectives = [
    'Silly', 'Jumpy', 'Wobbly', 'Squeaky', 'Fluffy',
    'Bubbly', 'Giggly', 'Wiggly', 'Fuzzy', 'Sparkly',
    'Bouncy', 'Zippy', 'Wacky', 'Zany', 'Quirky',
    'Goofy', 'Loopy', 'Nutty', 'Dizzy', 'Bonkers',
    'Perky', 'Jolly', 'Giddy', 'Snazzy', 'Peppy',
    'Dorky', 'Zoomy', 'Jazzy', 'Spiffy', 'Dazzling'
];

// Array of fun nouns for name generation
const funnyNouns = [
    'Penguin', 'Noodle', 'Pickle', 'Muffin', 'Banana',
    'Unicorn', 'Llama', 'Panda', 'Waffle', 'Potato',
    'Marshmallow', 'Cupcake', 'Flamingo', 'Pancake', 'Donut',
    'Snorkel', 'Wombat', 'Raccoon', 'Taco', 'Kazoo',
    'Dumpling', 'Kiwi', 'Jellybean', 'Coconut', 'Sprinkle',
    'Bagel', 'Burrito', 'Biscuit', 'Nugget', 'Pretzel'
];

/**
 * Additional themed name collections that can be used for special events
 * or specific contexts.
 */
const themesCollections = {
    space: {
        adjectives: ['Cosmic', 'Stellar', 'Lunar', 'Solar', 'Astral', 'Galactic', 'Orbital'],
        nouns: ['Comet', 'Meteor', 'Planet', 'Nebula', 'Quasar', 'Rocket', 'Starship']
    },
    ocean: {
        adjectives: ['Bubbly', 'Wavy', 'Splashy', 'Briny', 'Coral', 'Pearly', 'Foamy'],
        nouns: ['Dolphin', 'Whale', 'Turtle', 'Octopus', 'Seahorse', 'Lobster', 'Clam']
    },
    fantasy: {
        adjectives: ['Mystic', 'Enchanted', 'Magic', 'Arcane', 'Spectral', 'Mythic', 'Fabled'],
        nouns: ['Wizard', 'Dragon', 'Elf', 'Fairy', 'Gnome', 'Phoenix', 'Griffin']
    }
};

/**
 * Generates a random funny name by combining an adjective, a noun, and a number.
 * @returns {string} A randomly generated funny name, e.g. "SillyPenguin42"
 */
function generateFunnyName() {
    const adjective = funnyAdjectives[Math.floor(Math.random() * funnyAdjectives.length)];
    const noun = funnyNouns[Math.floor(Math.random() * funnyNouns.length)];
    const number = Math.floor(Math.random() * 100);
    return `${adjective}${noun}${number}`;
}

/**
 * Generates a themed name based on the provided theme.
 * @param {string} theme - The theme to use for name generation (space, ocean, fantasy)
 * @returns {string} A themed name, e.g. "CosmicNebula42" for theme "space"
 */
function generateThemedName(theme) {
    const collection = themesCollections[theme];

    if (!collection) {
        // Fall back to standard funny name if theme not found
        return generateFunnyName();
    }

    const adjective = collection.adjectives[Math.floor(Math.random() * collection.adjectives.length)];
    const noun = collection.nouns[Math.floor(Math.random() * collection.nouns.length)];
    const number = Math.floor(Math.random() * 100);

    return `${adjective}${noun}${number}`;
}

/**
 * Generates a unique name that doesn't exist in the provided list of existing names.
 * Useful when you need to ensure no duplicate names in a group.
 *
 * @param {Array<string>} existingNames - Array of names that are already in use
 * @param {string} [theme] - Optional theme for name generation
 * @returns {string} A unique generated name
 */
function generateUniqueName(existingNames = [], theme = null) {
    let name;
    let attempts = 0;
    const maxAttempts = 30; // Prevent infinite loops

    do {
        name = theme ? generateThemedName(theme) : generateFunnyName();
        attempts++;

        // If we've tried too many times, add the attempt number to ensure uniqueness
        if (attempts >= maxAttempts) {
            name = `${name}${Date.now().toString().substr(-4)}`;
            break;
        }
    } while (existingNames.includes(name));

    return name;
}

/**
 * Generates a list of random names.
 *
 * @param {number} count - Number of names to generate
 * @param {string} [theme] - Optional theme for name generation
 * @returns {Array<string>} An array of generated names
 */
function generateNameBatch(count, theme = null) {
    const names = [];
    const generatorFn = theme ? () => generateThemedName(theme) : generateFunnyName;

    for (let i = 0; i < count; i++) {
        names.push(generatorFn());
    }

    return names;
}

// Export the name generation functions and collections
export {
    generateFunnyName,
    generateThemedName,
    generateUniqueName,
    generateNameBatch,
    funnyAdjectives,
    funnyNouns,
    themesCollections
};