// Date/time formatting
/**
 * Formatting Utilities
 *
 * Provides functions for formatting dates, times, numbers, and text
 * for consistent display throughout the application.
 */

/**
 * Format a date object to a readable string
 *
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Invalid date';
    }

    return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Format a date to show only the time
 *
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
export function formatShortTime(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Invalid time';
    }

    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format a date as a relative time (e.g., "2 hours ago")
 *
 * @param {Date} date - Date object to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Invalid date';
    }

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) {
        return diffSec <= 0 ? 'just now' : `${diffSec} second${diffSec === 1 ? '' : 's'} ago`;
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    } else if (diffDay < 30) {
        return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    } else {
        return formatDate(date);
    }
}

/**
 * Format a number with thousands separators
 *
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
    if (typeof num !== 'number') {
        return 'Invalid number';
    }

    return num.toLocaleString('en-US');
}

/**
 * Format a file size in bytes to a human-readable string
 *
 * @param {number} bytes - Size in bytes
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Truncate a string to a maximum length with ellipsis
 *
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=100] - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength) + '...';
}

/**
 * Clean a string for use as an ID (remove special chars, spaces, etc.)
 *
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text suitable for use as an ID
 */
export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/&/g, '-and-')    // Replace & with 'and'
        .replace(/[^\w\-]+/g, '')  // Remove all non-word chars
        .replace(/\-\-+/g, '-');   // Replace multiple - with single -
}

/**
 * Format a duration in seconds to mm:ss or hh:mm:ss format
 *
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}