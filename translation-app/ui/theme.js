// Dark/light mode handling
/**
 * Theme Management Module
 *
 * Handles dark/light mode theme switching, user preferences,
 * and system preference detection.
 */

// Theme constants
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';
const THEME_STORAGE_KEY = 'translation-app-theme';

// CSS class applied to document element for dark mode
const DARK_MODE_CLASS = 'dark';

// Track current theme
let currentTheme = null;

// Custom event for theme changes
const THEME_CHANGE_EVENT = 'themechange';

/**
 * Initialize theme system
 *
 * @param {boolean} useSystemPreference - Whether to use system preference for initial theme
 * @param {boolean} persistTheme - Whether to store theme preference in localStorage
 * @returns {string} The active theme after initialization
 */
function initTheme(useSystemPreference = true, persistTheme = true) {
    // Check for stored preference if persistence is enabled
    if (persistTheme && typeof localStorage !== 'undefined') {
        const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
            setTheme(storedTheme);
            return currentTheme;
        }
    }

    // Use system preference if enabled
    if (useSystemPreference) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme(DARK_THEME);
        } else {
            setTheme(LIGHT_THEME);
        }

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                setTheme(DARK_THEME);
            } else {
                setTheme(LIGHT_THEME);
            }
        });
    } else {
        // Default to light theme if not using system preference and no stored preference
        setTheme(LIGHT_THEME);
    }

    return currentTheme;
}

/**
 * Set the current theme
 *
 * @param {string} theme - Theme to set ('light' or 'dark')
 * @param {boolean} persist - Whether to save the preference to localStorage
 * @returns {void}
 */
function setTheme(theme, persist = true) {
    // Validate theme value
    if (theme !== LIGHT_THEME && theme !== DARK_THEME) {
        console.error(`Invalid theme: ${theme}. Must be '${LIGHT_THEME}' or '${DARK_THEME}'.`);
        return;
    }

    // Update current theme
    currentTheme = theme;

    // Add/remove dark mode class on document element
    if (theme === DARK_THEME) {
        document.documentElement.classList.add(DARK_MODE_CLASS);
    } else {
        document.documentElement.classList.remove(DARK_MODE_CLASS);
    }

    // Save preference if requested
    if (persist && typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    // Dispatch custom event
    const event = new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme } });
    document.dispatchEvent(event);

    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme);
}

/**
 * Update the meta theme-color tag for mobile browsers
 *
 * @param {string} theme - Current theme
 * @returns {void}
 */
function updateMetaThemeColor(theme) {
    // Color values should match your UI theme colors
    const darkThemeColor = '#181824'; // Dark background color
    const lightThemeColor = '#FFFFFF'; // Light background color

    // Find existing theme-color meta tag or create one
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }

    // Update the content with appropriate color
    metaThemeColor.content = theme === DARK_THEME ? darkThemeColor : lightThemeColor;
}

/**
 * Get the current theme
 *
 * @returns {string} The current theme ('light' or 'dark')
 */
function getTheme() {
    return currentTheme;
}

/**
 * Check if dark mode is active
 *
 * @returns {boolean} Whether dark mode is active
 */
function isDarkMode() {
    return currentTheme === DARK_THEME;
}

/**
 * Toggle between light and dark themes
 *
 * @param {boolean} persist - Whether to save the preference to localStorage
 * @returns {string} The new active theme after toggling
 */
function toggleTheme(persist = true) {
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    setTheme(newTheme, persist);
    return newTheme;
}

/**
 * Initialize a theme toggle button
 *
 * @param {string} buttonId - ID of the toggle button element
 * @param {Function} [updateCallback] - Optional function to update button appearance
 * @returns {void}
 */
function initThemeToggle(buttonId, updateCallback = null) {
    const button = document.getElementById(buttonId);
    if (!button) {
        console.error(`Theme toggle button with ID '${buttonId}' not found.`);
        return;
    }

    // Update button appearance initially
    if (updateCallback && typeof updateCallback === 'function') {
        updateCallback(button, currentTheme);
    } else {
        // Default update behavior
        updateToggleButtonAppearance(button);
    }

    // Add click handler
    button.addEventListener('click', () => {
        toggleTheme(true);

        // Update button appearance after toggle
        if (updateCallback && typeof updateCallback === 'function') {
            updateCallback(button, currentTheme);
        } else {
            // Default update behavior
            updateToggleButtonAppearance(button);
        }
    });

    // Update button when theme changes from elsewhere
    document.addEventListener(THEME_CHANGE_EVENT, () => {
        if (updateCallback && typeof updateCallback === 'function') {
            updateCallback(button, currentTheme);
        } else {
            // Default update behavior
            updateToggleButtonAppearance(button);
        }
    });
}

/**
 * Default function to update toggle button appearance
 *
 * @param {HTMLElement} button - The toggle button element
 * @returns {void}
 */
function updateToggleButtonAppearance(button) {
    if (currentTheme === DARK_THEME) {
        button.innerHTML = '<i class="fas fa-sun"></i>';
        button.setAttribute('title', 'Switch to light mode');
    } else {
        button.innerHTML = '<i class="fas fa-moon"></i>';
        button.setAttribute('title', 'Switch to dark mode');
    }
}

/**
 * Register a callback for theme changes
 *
 * @param {Function} callback - Function to call when theme changes
 * @returns {Function} Function to remove the listener
 */
function onThemeChange(callback) {
    const handler = (e) => callback(e.detail.theme);
    document.addEventListener(THEME_CHANGE_EVENT, handler);

    // Return function to remove the event listener
    return () => {
        document.removeEventListener(THEME_CHANGE_EVENT, handler);
    };
}

export {
    LIGHT_THEME,
    DARK_THEME,
    initTheme,
    setTheme,
    getTheme,
    isDarkMode,
    toggleTheme,
    initThemeToggle,
    onThemeChange
};