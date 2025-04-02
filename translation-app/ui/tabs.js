// Tab navigation functionality
/**
 * Tab Navigation Module
 *
 * Provides functionality for the tabbed interface throughout the application.
 * Handles tab switching, state persistence, and animated transitions.
 */

// Store active tab state
let activeTabId = null;

/**
 * Initialize tab navigation functionality
 *
 * @param {string} defaultTabId - ID of the default tab to show if none is active
 * @param {boolean} useUrlParams - Whether to read/write tab state from URL params
 * @param {Function} [onTabChange] - Optional callback when tabs change
 * @returns {void}
 */
function initTabNavigation(defaultTabId = 'text-tab', useUrlParams = true, onTabChange = null) {
    // Get active tab from URL params if enabled
    if (useUrlParams) {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
            const tabButton = document.getElementById(`tab-${tabParam}`);
            if (tabButton) {
                defaultTabId = tabParam + '-tab';
            }
        }
    }

    // Select all tab buttons
    const tabButtons = document.querySelectorAll('[data-tab]');

    // Add click handlers to all tab buttons
    tabButtons.forEach(tab => {
        tab.addEventListener('click', (event) => {
            // Prevent default link behavior if it's an anchor
            event.preventDefault();

            // Get the tab content ID from the data attribute
            const tabId = tab.getAttribute('data-tab');

            // Switch to the tab
            switchToTab(tabId, useUrlParams);

            // Call the callback if provided
            if (onTabChange && typeof onTabChange === 'function') {
                onTabChange(tabId);
            }
        });
    });

    // Initialize with default tab if no tab is active
    if (!activeTabId)