/**
 * Language Utilities
 *
 * Provides utility functions and data related to supported languages
 * for translation throughout the application.
 */

/**
 * Get complete list of supported languages
 *
 * @returns {Array<Object>} Array of language objects with name and code
 */
function getSupportedLanguages() {
    return [
        { name: "English", code: "en" },
        { name: "Spanish", code: "es" },
        { name: "French", code: "fr" },
        { name: "German", code: "de" },
        { name: "Italian", code: "it" },
        { name: "Portuguese", code: "pt" },
        { name: "Russian", code: "ru" },
        { name: "Japanese", code: "ja" },
        { name: "Chinese", code: "zh" },
        { name: "Korean", code: "ko" },
        { name: "Arabic", code: "ar" },
        { name: "Hindi", code: "hi" },
        { name: "Turkish", code: "tr" },
        { name: "Dutch", code: "nl" },
        { name: "Polish", code: "pl" },
        { name: "Swedish", code: "sv" },
        { name: "Danish", code: "da" },
        { name: "Finnish", code: "fi" },
        { name: "Greek", code: "el" },
        { name: "Czech", code: "cs" },
        { name: "Thai", code: "th" },
        { name: "Vietnamese", code: "vi" },
        { name: "Indonesian", code: "id" },
        { name: "Hebrew", code: "he" },
        { name: "Romanian", code: "ro" }
    ];
}

/**
 * Get language code from language name
 *
 * @param {string} languageName - Full language name
 * @returns {string} ISO language code or empty string if not found
 */
function getLanguageCode(languageName) {
    const languages = getSupportedLanguages();
    const language = languages.find(lang => lang.name === languageName);
    return language ? language.code : '';
}

/**
 * Get language name from language code
 *
 * @param {string} languageCode - ISO language code
 * @returns {string} Full language name or empty string if not found
 */
function getLanguageName(languageCode) {
    const languages = getSupportedLanguages();
    const language = languages.find(lang => lang.code === languageCode);
    return language ? language.name : '';
}

/**
 * Check if a language is supported
 *
 * @param {string} languageName - Language name to check
 * @returns {boolean} Whether the language is supported
 */
function isLanguageSupported(languageName) {
    const languages = getSupportedLanguages();
    return languages.some(lang => lang.name === languageName);
}

/**
 * Get the default source language (Auto)
 *
 * @returns {string} Default source language
 */
function getDefaultSourceLanguage() {
    return "auto";
}

/**
 * Get the default target language (English)
 *
 * @returns {string} Default target language
 */
function getDefaultTargetLanguage() {
    return "English";
}

export {
    getSupportedLanguages,
    getLanguageCode,
    getLanguageName,
    isLanguageSupported,
    getDefaultSourceLanguage,
    getDefaultTargetLanguage
};