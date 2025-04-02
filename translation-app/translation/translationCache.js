/**
 * Translation Cache System
 *
 * This module provides caching functionality for translations to improve
 * performance and reduce redundant API calls.
 */

// In-memory cache for storing translated content
const translationCache = new Map();

/**
 * Generate a cache key for a specific message and language combination
 *
 * @param {string} messageId - Unique identifier for the message
 * @param {string} targetLang - Target language code
 * @returns {string} Unique cache key
 */
function createCacheKey(messageId, targetLang) {
    return `${messageId}:${targetLang}`;
}

/**
 * Check if a translation exists in the cache
 *
 * @param {string} messageId - Unique identifier for the message
 * @param {string} targetLang - Target language code
 * @returns {boolean} Whether the translation is cached
 */
function hasTranslation(messageId, targetLang) {
    const cacheKey = createCacheKey(messageId, targetLang);
    return translationCache.has(cacheKey);
}

/**
 * Get a translation from the cache
 *
 * @param {string} messageId - Unique identifier for the message
 * @param {string} targetLang - Target language code
 * @returns {string|null} The cached translation or null if not found
 */
function getTranslation(messageId, targetLang) {
    const cacheKey = createCacheKey(messageId, targetLang);
    return translationCache.get(cacheKey) || null;
}

/**
 * Store a translation in the cache
 *
 * @param {string} messageId - Unique identifier for the message
 * @param {string} targetLang - Target language code
 * @param {string} translatedText - The translated content
 */
function cacheTranslation(messageId, targetLang, translatedText) {
    const cacheKey = createCacheKey(messageId, targetLang);
    translationCache.set(cacheKey, translatedText);
}

/**
 * Remove a specific translation from the cache
 *
 * @param {string} messageId - Unique identifier for the message
 * @param {string} targetLang - Target language code
 * @returns {boolean} True if the entry was found and removed
 */
function removeFromCache(messageId, targetLang) {
    const cacheKey = createCacheKey(messageId, targetLang);
    return translationCache.delete(cacheKey);
}

/**
 * Clear all translations from the cache
 */
function clearCache() {
    translationCache.clear();
}

/**
 * Get cache statistics
 *
 * @returns {Object} Statistics about the cache
 */
function getCacheStats() {
    return {
        size: translationCache.size,
        keys: Array.from(translationCache.keys())
    };
}

/**
 * Translate a chat message using cache or API
 *
 * @param {string} messageId - Unique identifier for the message
 * @param {string} content - Text content to translate
 * @param {string} targetLang - Target language
 * @param {string} model - AI model to use for translation
 * @returns {Promise<string>} Translated text or loading indicator
 */
async function translateChatMessage(messageId, content, targetLang, model) {
    // Check if we already have a cached translation
    if (hasTranslation(messageId, targetLang)) {
        return getTranslation(messageId, targetLang);
    }

    // Create a prompt for translation
    const prompt = `@${model} Translate the following text to ${targetLang}. Return only the translated text without explanations, additional text, or formatting:

${content}`;

    try {
        await window.Poe.sendUserMessage(prompt, {
            handler: "chat-translation-handler",
            stream: false,
            openChat: false,
            handlerContext: {
                messageId,
                targetLang
            }
        });

        // Return a loading indicator - the actual translation will be handled by the response handler
        return `<span class="animate-pulse">Translating...</span>`;
    } catch (err) {
        console.error('Error translating message:', err);
        return `<span class="text-red-500">Translation failed</span>`;
    }
}

export {
    translationCache,
    createCacheKey,
    hasTranslation,
    getTranslation,
    cacheTranslation,
    removeFromCache,
    clearCache,
    getCacheStats,
    translateChatMessage
};