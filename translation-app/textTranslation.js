// Text translation features
/**
 * Text Translation Module
 *
 * Handles the core functionality for the text translation tab.
 */

import { getSupportedLanguages } from './languageUtils.js';

/**
 * Submit a text translation request
 *
 * @param {string} sourceText - Text to translate
 * @param {string} sourceLang - Source language code or "auto"
 * @param {string} targetLang - Target language code
 * @param {string} model - AI model to use
 * @returns {Promise<void>}
 */
async function submitTextTranslation(sourceText, sourceLang, targetLang, model) {
    if (!sourceText.trim()) {
        throw new Error('Please enter text to translate.');
    }

    // Show loading state
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('result-container').classList.add('hidden');

    // Format source language string
    const sourceLanguageStr = sourceLang === 'auto' ? 'auto-detected language' : sourceLang;

    // Construct the prompt
    const prompt = `@${model} Translate the following text from ${sourceLanguageStr} to ${targetLang}. Return only the translated text without explanations, additional text, or formatting:

${sourceText}`;

    try {
        await window.Poe.sendUserMessage(prompt, {
            handler: "translation-handler",
            stream: true,
            openChat: false,
            handlerContext: {
                sourceText: sourceText,
                sourceLang: sourceLang === 'auto' ? 'Auto' : sourceLang,
                targetLang: targetLang,
                model: model
            }
        });
    } catch (err) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('result-container').classList.remove('hidden');
        document.getElementById('translation-result').innerHTML = `<span class="text-red-500">Error: ${err.message || 'Failed to send translation request.'}</span>`;
        throw err;
    }
}

/**
 * Copy translation to clipboard
 *
 * @param {HTMLElement} buttonElement - The button that was clicked
 * @returns {Promise<void>}
 */
async function copyTranslation(buttonElement) {
    const text = document.getElementById('translation-result').textContent;

    try {
        await navigator.clipboard.writeText(text);

        // Show success state
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        setTimeout(() => {
            buttonElement.textContent = originalText;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

/**
 * Add translation result to chat history
 *
 * @param {Function} addToHistoryCallback - Function to add to history
 * @returns {void}
 */
function saveTranslationToHistory(addToHistoryCallback) {
    const resultElement = document.getElementById('translation-result');
    const translatedText = resultElement.textContent;
    const sourceText = resultElement.dataset.sourceText;
    const sourceLang = resultElement.dataset.sourceLang;
    const targetLang = resultElement.dataset.targetLang;
    const model = resultElement.dataset.model;

    addToHistoryCallback(sourceText, translatedText, sourceLang, targetLang, model, 'text');

    // Show confirmation
    const btn = document.getElementById('add-to-chat-btn');
    btn.textContent = 'Saved!';
    setTimeout(() => {
        btn.textContent = 'Save to Chat';
    }, 2000);

    // Switch to chat tab
    document.getElementById('tab-chat').click();
}

/**
 * Initialize the text translation form
 *
 * @param {Function} addToHistoryCallback - Function to add to history
 * @returns {void}
 */
function initTextTranslationForm(addToHistoryCallback) {
    // Setup languages
    const languages = getSupportedLanguages();
    populateLanguageDropdowns(languages);

    // Form submission
    document.getElementById('translation-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const sourceText = document.getElementById('source-text').value.trim();
        const sourceLanguage = document.getElementById('source-language').value;
        const targetLanguage = document.getElementById('target-language').value;
        const model = document.querySelector('input[name="model"]:checked').value;

        try {
            await submitTextTranslation(sourceText, sourceLanguage, targetLanguage, model);
        } catch (err) {
            console.error('Translation error:', err);
        }
    });

    // Copy button
    document.getElementById('copy-btn').addEventListener('click', function() {
        copyTranslation(this);
    });

    // Save to chat button
    document.getElementById('add-to-chat-btn').addEventListener('click', () => {
        saveTranslationToHistory(addToHistoryCallback);
    });
}

/**
 * Populate language dropdowns with supported languages
 *
 * @param {Array<Object>} languages - List of language objects
 * @returns {void}
 */
function populateLanguageDropdowns(languages) {
    const sourceDropdown = document.getElementById('source-language');
    const targetDropdown = document.getElementById('target-language');

    // Keep the "Detect Language" option for source language
    sourceDropdown.innerHTML = '<option value="auto">Detect Language</option>';
    targetDropdown.innerHTML = '';

    languages.forEach(lang => {
        const sourceOption = document.createElement('option');
        sourceOption.value = lang.name;
        sourceOption.textContent = lang.name;
        sourceDropdown.appendChild(sourceOption);

        const targetOption = document.createElement('option');
        targetOption.value = lang.name;
        targetOption.textContent = lang.name;
        targetDropdown.appendChild(targetOption);
    });

    // Default target language to English if available
    const englishOption = targetDropdown.querySelector('option[value="English"]');
    if (englishOption) {
        englishOption.selected = true;
    }
}

export {
    submitTextTranslation,
    copyTranslation,
    saveTranslationToHistory,
    initTextTranslationForm
};