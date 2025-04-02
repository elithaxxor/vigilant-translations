// Poe API handlers for translations
import { cacheTranslation } from './translationCache.js';

// Register handlers for API responses
function registerTranslationHandlers() {
    // Handler for chat message translation
    window.Poe.registerHandler("chat-translation-handler", (result, context) => {
        if (!result.responses || result.responses.length === 0) return;

        const response = result.responses[0];

        if (response.status === "complete") {
            // Store in cache
            cacheTranslation(context.messageId, context.targetLang, response.content);

            // Find the message element and update it
            const translationElement = document.getElementById(`translation-${context.messageId}`);
            if (translationElement) {
                // Remove loading indicator
                translationElement.classList.remove('animate-pulse');
                translationElement.innerHTML = response.content;
            }
        }
    });

    // Handler for text translation tab
    window.Poe.registerHandler("translation-handler", (result, context) => {
        const loadingElement = document.getElementById('loading');
        const resultContainer = document.getElementById('result-container');
        const translationResult = document.getElementById('translation-result');

        // Get the first response (we only expect one bot to respond)
        const response = result.responses[0];

        if (response.status === "error") {
            loadingElement.classList.add('hidden');
            resultContainer.classList.remove('hidden');
            translationResult.innerHTML = `<span class="text-red-500">Error: ${response.statusText || 'An error occurred during translation.'}</span>`;
        } else if (response.status === "incomplete") {
            // Show partial response while streaming
            resultContainer.classList.remove('hidden');
            translationResult.textContent = response.content;
        } else if (response.status === "complete") {
            // Update with final content
            loadingElement.classList.add('hidden');
            resultContainer.classList.remove('hidden');
            translationResult.textContent = response.content;

            // Save context for Add to Chat button
            translationResult.dataset.sourceText = context.sourceText;
            translationResult.dataset.sourceLang = context.sourceLang;
            translationResult.dataset.targetLang = context.targetLang;
            translationResult.dataset.model = context.model;
        }
    });

    // Handler for video translation
    window.Poe.registerHandler("video-translation-handler", (result, context) => {
        // Implementation details...
    });
}

export { registerTranslationHandlers };