/**
 * Translation Module Index
 *
 * This is the main entry point for the translation functionality.
 * It exports all public members from the translation submodules.
 */

// Re-export all public members from submodules
export * from './translationCache.js';
export * from './handlers.js';
export * from './textTranslation.js';
export * from './videoTranslation.js';
export * from './languageUtils.js';

/**
 * Initialize all translation functionality
 *
 * @param {Function} addToHistoryCallback - Callback function to add translations to history
 */
export function initializeTranslationModule(addToHistoryCallback) {
    // Import from submodules to avoid circular dependencies
    const { registerTranslationHandlers } = require('./handlers.js');
    const { initTextTranslationForm } = require('./textTranslation.js');
    const { initVideoTranslationForm } = require('./videoTranslation.js');

    // Register all API handlers
    registerTranslationHandlers();

    // Initialize form handling
    initTextTranslationForm(addToHistoryCallback);
    initVideoTranslationForm(addToHistoryCallback);

    // Initialize chat message translation
    const translationToggle = document.getElementById('enable-chat-translation');
    if (translationToggle) {
        translationToggle.addEventListener('change', function() {
            const translationOptions = document.querySelectorAll('.translation-options');
            translationOptions.forEach(el => {
                el.style.display = this.checked ? 'flex' : 'none';
            });

            // Reload messages with new translation settings when the toggle changes
            if (typeof window.loadMessages === 'function') {
                window.loadMessages();
            }
        });
    }

    // Update translations when settings change
    const targetLangSelect = document.getElementById('chat-target-language');
    const modelSelect = document.getElementById('chat-translation-model');

    if (targetLangSelect) {
        targetLangSelect.addEventListener('change', () => {
            if (translationToggle && translationToggle.checked && typeof window.loadMessages === 'function') {
                window.loadMessages();
            }
        });
    }

    if (modelSelect) {
        modelSelect.addEventListener('change', () => {
            if (translationToggle && translationToggle.checked && typeof window.loadMessages === 'function') {
                window.loadMessages();
            }
        });
    }
}