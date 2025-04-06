/**
 * API Utility Functions
 *
 * Provides utilities for interacting with the Poe API and
 * other external services.
 */

/**
 * Send a message to a bot through the Poe API
 *
 * @param {string} botName - Name of the bot to use
 * @param {string} message - Message to send
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.stream=true] - Whether to stream the response
 * @param {boolean} [options.openChat=false] - Whether to open the chat UI
 * @param {string} [options.handler] - Handler function name
 * @param {Object} [options.handlerContext] - Context data for the handler
 * @returns {Promise<Object>} Promise resolving to the API response
 */
export async function sendBotMessage(botName, message, options = {}) {
    const defaultOptions = {
        stream: true,
        openChat: false,
        handler: null,
        handlerContext: {}
    };

    const settings = { ...defaultOptions, ...options };
    const prompt = `@${botName} ${message}`;

    try {
        const apiOptions = {
            stream: settings.stream,
            openChat: settings.openChat
        };

        if (settings.handler) {
            apiOptions.handler = settings.handler;
            apiOptions.handlerContext = settings.handlerContext;
        }

        return await window.Poe.sendUserMessage(prompt, apiOptions);
    } catch (error) {
        console.error(`Error sending message to ${botName}:`, error);
        throw new Error(`Failed to send message to ${botName}: ${error.message}`);
    }
}

/**
 * Register a handler for bot responses
 *
 * @param {string} handlerName - Name of the handler
 * @param {Function} callback - Callback function
 * @returns {void}
 */
export function registerResponseHandler(handlerName, callback) {
    if (typeof window.Poe?.registerHandler !== 'function') {
        console.error('Poe API not available');
        return;
    }

    window.Poe.registerHandler(handlerName, callback);
}

/**
 * Create a text translation prompt
 *
 * @param {string} text - Text to translate
 * @param {string} sourceLang - Source language
 * @param {string} targetLang - Target language
 * @returns {string} Translation prompt
 */
export function createTranslationPrompt(text, sourceLang, targetLang) {
    const sourceLanguageStr = sourceLang === 'auto' ? 'auto-detected language' : sourceLang;

    return `Translate the following text from ${sourceLanguageStr} to ${targetLang}. Return only the translated text without explanations, additional text, or formatting:

${text}`;
}

/**
 * Create a video transcript translation prompt
 *
 * @param {string} videoUrl - YouTube video URL
 * @param {string} sourceLang - Source language
 * @param {string} targetLang - Target language
 * @returns {string} Video translation prompt
 */
export function createVideoTranslationPrompt(videoUrl, sourceLang, targetLang) {
    const sourceLanguageStr = sourceLang === 'auto' ? 'auto-detected language' : sourceLang;

    return `Please transcribe and translate the content from the YouTube video at ${videoUrl} from ${sourceLanguageStr} to ${targetLang}. Only provide the translated transcript without additional explanations or formatting.`;
}

/**
 * Parse a structured response from a bot
 *
 * @param {string} responseText - Response text
 * @param {string} [format='json'] - Expected format ('json' or 'yaml')
 * @returns {Object|null} Parsed object or null if parsing failed
 */
export function parseStructuredResponse(responseText, format = 'json') {
    try {
        if (format === 'json') {
            // Extract JSON from markdown code blocks if present
            const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            const jsonString = jsonMatch ? jsonMatch[1] : responseText;

            return JSON.parse(jsonString);
        } else if (format === 'yaml') {
            // YAML parsing would require a library like js-yaml
            console.warn('YAML parsing not implemented');
            return null;
        }

        return null;
    } catch (error) {
        console.error('Error parsing structured response:', error);
        return null;
    }
}

/**
 * Handle common errors from the Poe API
 *
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function handlePoeApiError(error) {
    if (!error) return 'Unknown error occurred';

    // Check for specific error types from Poe API
    if (error.errorType) {
        switch (error.errorType) {
            case 'INVALID_INPUT':
                return 'Invalid input: The message format is incorrect';
            case 'USER_REJECTED_CONFIRMATION':
                return 'Request was cancelled';
            case 'ANOTHER_CONFIRMATION_IS_OPEN':
                return 'Another confirmation dialog is already open';
            default:
                return `API error: ${error.errorType}`;
        }
    }

    // Generic error handling
    return error.message || 'An error occurred while communicating with the bot';
}