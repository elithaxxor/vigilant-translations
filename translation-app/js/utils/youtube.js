// YouTube URL parsing
/**
 * YouTube Utilities
 *
 * Provides functions for working with YouTube URLs, embedding videos,
 * and extracting video information.
 */

/**
 * Extract the YouTube video ID from various URL formats
 *
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
export function getYouTubeVideoId(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    // Regular expression to match YouTube video IDs in various URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Generate a YouTube embed URL from a video ID
 *
 * @param {string} videoId - YouTube video ID
 * @param {Object} [options] - Embed options
 * @param {boolean} [options.autoplay=false] - Whether to autoplay the video
 * @param {boolean} [options.controls=true] - Whether to show video controls
 * @param {boolean} [options.showInfo=true] - Whether to show video info
 * @param {number} [options.start=0] - Start time in seconds
 * @returns {string} YouTube embed URL
 */
export function createYouTubeEmbedURL(videoId, options = {}) {
    if (!videoId) {
        return '';
    }

    const defaultOptions = {
        autoplay: false,
        controls: true,
        showInfo: true,
        start: 0
    };

    const settings = { ...defaultOptions, ...options };
    let embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

    if (settings.autoplay) embedUrl += '&autoplay=1';
    if (!settings.controls) embedUrl += '&controls=0';
    if (!settings.showInfo) embedUrl += '&showinfo=0';
    if (settings.start > 0) embedUrl += `&start=${settings.start}`;

    return embedUrl;
}

/**
 * Validate if a string is a valid YouTube URL
 *
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url) {
    return getYouTubeVideoId(url) !== null;
}

/**
 * Create an embedded iframe for a YouTube video
 *
 * @param {string} videoId - YouTube video ID
 * @param {Object} [options] - Embed options (same as createYouTubeEmbedURL)
 * @returns {HTMLIFrameElement} Iframe element
 */
export function createYouTubeEmbed(videoId, options = {}) {
    const iframe = document.createElement('iframe');
    iframe.src = createYouTubeEmbedURL(videoId, options);
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;

    return iframe;
}

/**
 * Extract the video timestamp from a YouTube URL (t parameter)
 *
 * @param {string} url - YouTube URL
 * @returns {number|null} Timestamp in seconds or null if not present
 */
export function getYouTubeTimestamp(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    try {
        const urlObj = new URL(url);

        // Handle both 't' and 'start' parameters
        const tParam = urlObj.searchParams.get('t') || urlObj.searchParams.get('start');

        if (!tParam) return null;

        // Handle formats like '1h2m3s' or just seconds
        if (tParam.includes('h') || tParam.includes('m') || tParam.includes('s')) {
            let seconds = 0;

            // Extract hours
            const hoursMatch = tParam.match(/(\d+)h/);
            if (hoursMatch) {
                seconds += parseInt(hoursMatch[1], 10) * 3600;
            }

            // Extract minutes
            const minutesMatch = tParam.match(/(\d+)m/);
            if (minutesMatch) {
                seconds += parseInt(minutesMatch[1], 10) * 60;
            }

            // Extract seconds
            const secondsMatch = tParam.match(/(\d+)s/);
            if (secondsMatch) {
                seconds += parseInt(secondsMatch[1], 10);
            }

            return seconds;
        } else {
            // If it's just a number
            return parseInt(tParam, 10);
        }
    } catch (error) {
        console.error('Error parsing YouTube URL timestamp:', error);
        return null;
    }
}