/**
 * Name Generator Utility
 *
 * Provides functions for generating random, fun usernames
 * composed of an adjective, a noun, and a random number.
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

// Collections of themed name components
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
 * Generate a random funny name
 *
 * @returns {string} A randomly generated funny name
 */
export function generateFunnyName() {
    const adjective = funnyAdjectives[Math.floor(Math.random() * funnyAdjectives.length)];
    const noun = funnyNouns[Math.floor(Math.random() * funnyNouns.length)];
    const number = Math.floor(Math.random() * 100);
    return `${adjective}${noun}${number}`;
}

/**
 * Generate a themed name based on the provided theme
 *
 * @param {string} theme - The theme to use for generation (space, ocean, fantasy)
 * @returns {string} A themed name
 */
export function generateThemedName(theme) {
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
 * Generate a unique name that doesn't exist in the provided list
 *
 * @param {Array<string>} existingNames - Array of names that are already in use
 * @param {string} [theme] - Optional theme for name generation
 * @returns {string} A unique generated name
 */
export function generateUniqueName(existingNames = [], theme = null) {
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
 * Generate multiple random names
 *
 * @param {number} count - Number of names to generate
 * @param {string} [theme] - Optional theme for name generation
 * @returns {Array<string>} Array of generated names
 */
export function generateNameBatch(count, theme = null) {
    const names = [];
    const generatorFn = theme ? () => generateThemedName(theme) : generateFunnyName;

    for (let i = 0; i < count; i++) {
        names.push(generatorFn());
    }

    return names;
}

// Export collections for direct access if needed
export { funnyAdjectives, funnyNouns, themesCollections };