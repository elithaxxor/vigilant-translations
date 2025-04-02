// Video translation features
/**
 * Video Translation Module
 *
 * Handles the core functionality for the video translation tab,
 * including YouTube video processing and translation.
 */

import { getSupportedLanguages } from './languageUtils.js';

/**
 * Extract YouTube video ID from URL
 *
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
function getYouTubeVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Update the video preview iframe
 *
 * @param {string} videoUrl - YouTube URL
 * @returns {boolean} Whether the video ID was valid and preview was updated
 */
function updateVideoPreview(videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    const videoContainer = document.querySelector('.video-container');

    if (videoId) {
        document.getElementById('youtube-embed').src = `https://www.youtube.com/embed/${videoId}`;
        videoContainer.classList.remove('hidden');
        return true;
    } else {
        videoContainer.classList.add('hidden');
        return false;
    }
}

/**
 * Submit a video translation request
 *
 * @param {string} videoUrl - YouTube URL
 * @param {string} sourceLang - Source language code or "auto"
 * @param {string} targetLang - Target language code
 * @param {string} model - AI model to use
 * @returns {Promise<void>}
 */
async function submitVideoTranslation(videoUrl, sourceLang, targetLang, model) {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
        throw new Error('Invalid YouTube URL. Please enter a valid YouTube video URL.');
    }

    // Show loading state
    document.getElementById('video-loading').classList.remove('hidden');
    document.getElementById('video-result-container').classList.add('hidden');

    // Format source language string
    const sourceLanguageStr = sourceLang === 'auto' ? 'auto-detected language' : sourceLang;

    // Construct the prompt
    const prompt = `@${model} Please transcribe and translate the content from the YouTube video at ${videoUrl} from ${sourceLanguageStr} to ${targetLang}. Only provide the translated transcript without additional explanations or formatting.`;

    try {
        await window.Poe.sendUserMessage(prompt, {
            handler: "video-translation-handler",
            stream: true,
            openChat: false,
            handlerContext: {
                videoUrl: videoUrl,
                sourceLang: sourceLang === 'auto' ? 'Auto' : sourceLang,
                targetLang: targetLang,
                model: model
            }
        });
    } catch (err) {
        document.getElementById('video-loading').classList.add('hidden');
        document.getElementById('video-result-container').classList.remove('hidden');
        document.getElementById('video-translation-result').innerHTML = `<span class="text-red-500">Error: ${err.message || 'Failed to send video translation request.'}</span>`;
        throw err;
    }
}

/**
 * Copy video translation to clipboard
 *
 * @param {HTMLElement} buttonElement - The button that was clicked
 * @returns {Promise<void>}
 */
async function copyVideoTranslation(buttonElement) {
    const text = document.getElementById('video-translation-result').textContent;

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
 * Add video translation result to chat history
 *
 * @param {Function} addToHistoryCallback - Function to add to history
 * @returns {void}
 */
function saveVideoTranslationToHistory(addToHistoryCallback) {
    const resultElement = document.getElementById('video-translation-result');
    const translatedText = resultElement.textContent;
    const videoUrl = resultElement.dataset.videoUrl;
    const sourceLang = resultElement.dataset.sourceLang;
    const targetLang = resultElement.dataset.targetLang;
    const model = resultElement.dataset.model;

    addToHistoryCallback(videoUrl, translatedText, sourceLang, targetLang, model, 'video');

    // Show confirmation
    const btn = document.getElementById('video-add-to-chat-btn');
    btn.textContent = 'Saved!';
    setTimeout(() => {
        btn.textContent = 'Save to Chat';
    }, 2000);

    // Switch to chat tab
    document.getElementById('tab-chat').click();
}

/**
 * Initialize the video translation form
 *
 * @param {Function} addToHistoryCallback - Function to add to history
 * @returns {void}
 */
function initVideoTranslationForm(addToHistoryCallback) {
    // Setup languages
    const languages = getSupportedLanguages();
    populateVideoLanguageDropdowns(languages);

    // Video URL input handling
    document.getElementById('video-url').addEventListener('input', function() {
        updateVideoPreview(this.value.trim());
    });

    // Form submission
    document.getElementById('video-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const videoUrl = document.getElementById('video-url').value.trim();
        const sourceLanguage = document.getElementById('video-source-language').value;
        const targetLanguage = document.getElementById('video-target-language').value;
        const model = document.querySelector('input[name="video-model"]:checked').value;

        try {
            await submitVideoTranslation(videoUrl, sourceLanguage, targetLanguage, model);
        } catch (err) {
            console.error('Video translation error:', err);
        }
    });

    // Copy button
    document.getElementById('video-copy-btn').addEventListener('click', function() {
        copyVideoTranslation(this);
    });

    // Save to chat button
    document.getElementById('video-add-to-chat-btn').addEventListener('click', () => {
        saveVideoTranslationToHistory(addToHistoryCallback);
    });
}

/**
 * Populate video language dropdowns with supported languages
 *
 * @param {Array<Object>} languages - List of language objects
 * @returns {void}
 */
function populateVideoLanguageDropdowns(languages) {
    const sourceDropdown = document.getElementById('video-source-language');
    const targetDropdown = document.getElementById('video-target-language');

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
    getYouTubeVideoId,
    updateVideoPreview,
    submitVideoTranslation,
    copyVideoTranslation,
    saveVideoTranslationToHistory,
    initVideoTranslationForm
};