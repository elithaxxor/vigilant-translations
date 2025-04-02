// Modal dialog utilities
/**
 * Modal Dialog Module
 *
 * Provides utilities for creating, showing, and managing modal dialogs
 * throughout the application. Supports different types of modals, animations,
 * and accessibility features.
 */

// Track active modals
const activeModals = new Set();

// Z-index counter for stacked modals
let zIndexCounter = 1000;

// CSS classes for animations
const ANIMATION_CLASSES = {
    fadeIn: 'animate-fadeIn',
    fadeOut: 'animate-fadeOut',
    slideIn: 'animate-slideIn',
    slideOut: 'animate-slideOut',
    zoomIn: 'animate-zoomIn',
    zoomOut: 'animate-zoomOut'
};

/**
 * Create a modal element with the given content and options
 *
 * @param {string|HTMLElement} content - HTML content or element for modal body
 * @param {Object} options - Modal configuration options
 * @param {string} [options.id] - Modal ID (auto-generated if not provided)
 * @param {string} [options.title] - Modal title (no header if not provided)
 * @param {string} [options.size] - Modal size (sm, md, lg, xl, full)
 * @param {boolean} [options.closeOnEscape=true] - Whether to close on escape key
 * @param {boolean} [options.closeOnBackdropClick=true] - Whether to close when clicking backdrop
 * @param {boolean} [options.showCloseButton=true] - Whether to show the close button
 * @param {Array<Object>} [options.buttons] - Array of button configurations
 * @param {string} [options.animation='fade'] - Animation type (fade, slide, zoom)
 * @returns {HTMLElement} The created modal element (not yet added to DOM)
 */
function createModal(content, options = {}) {
    // Generate unique ID if not provided
    const modalId = options.id || `modal-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Set default options
    const settings = {
        title: '',
        size: 'md',
        closeOnEscape: true,
        closeOnBackdropClick: true,
        showCloseButton: true,
        buttons: [],
        animation: 'fade',
        ...options
    };

    // Create modal container
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', `${modalId}-title`);

    // Add animation class
    if (settings.animation) {
        const animationClass = ANIMATION_CLASSES[`${settings.animation}In`];
        if (animationClass) {
            modal.classList.add(animationClass);
        }
    }

    // Determine modal size classes
    let sizeClasses = 'max-w-md'; // Default medium size
    switch (settings.size) {
        case 'sm': sizeClasses = 'max-w-sm'; break;
        case 'lg': sizeClasses = 'max-w-lg'; break;
        case 'xl': sizeClasses = 'max-w-xl'; break;
        case '2xl': sizeClasses = 'max-w-2xl'; break;
        case 'full': sizeClasses = 'max-w-full mx-4'; break;
    }

    // Create modal dialog element
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClasses} w-full max-h-[90vh] flex flex-col overflow-hidden">
            ${settings.title ? `
                <div class="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 id="${modalId}-title" class="text-lg font-medium">${settings.title}</h3>
                    ${settings.showCloseButton ? `
                        <button type="button" class="modal-close text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <span class="sr-only">Close</span>
                            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            ` : ''}
            <div class="px-6 py-4 flex-1 overflow-y-auto">
                <div class="modal-content"></div>
            </div>
            ${settings.buttons.length > 0 ? `
                <div class="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                    ${settings.buttons.map(btn => `
                        <button type="button" class="modal-btn px-4 py-2 rounded-md ${btn.primary ?
                            'bg-primary hover:bg-opacity-90 text-white' :
                            'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                        }" data-action="${btn.action || ''}">${btn.text}</button>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    // Add content to the modal
    const contentContainer = modal.querySelector('.modal-content');
    if (typeof content === 'string') {
        contentContainer.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        contentContainer.appendChild(content);
    }

    // Set up close button event handler
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal);
        });
    }

    // Set up action buttons
    modal.querySelectorAll('.modal-btn').forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const buttonConfig = settings.buttons[index];
            if (buttonConfig && buttonConfig.onClick && typeof buttonConfig.onClick === 'function') {
                buttonConfig.onClick(modal);
            }

            // Auto-close if not explicitly set to false
            if (buttonConfig.closeOnClick !== false) {
                closeModal(modal);
            }
        });
    });

    // Set up backdrop click handler
    if (settings.closeOnBackdropClick) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    }

    return modal;
}

/**
 * Show a modal dialog
 *
 * @param {HTMLElement|string} modalOrContent - Modal element or content to show
 * @param {Object} [options] - Configuration options if creating new modal
 * @returns {HTMLElement} The displayed modal element
 */
function showModal(modalOrContent, options = {}) {
    let modal;

    // Check if first argument is a modal element or content
    if (modalOrContent instanceof HTMLElement && modalOrContent.hasAttribute('role') && modalOrContent.getAttribute('role') === 'dialog') {
        // It's a modal element
        modal = modalOrContent;
    } else {
        // Create new modal with content
        modal = createModal(modalOrContent, options);
    }

    // Set unique z-index if multiple modals are open
    modal.style.zIndex = (zIndexCounter++).toString();

    // Add to document
    document.body.appendChild(modal);

    // Track active modal
    activeModals.add(modal);

    // Set up escape key handler
    if (options.closeOnEscape !== false) {
        const keyHandler = (event) => {
            if (event.key === 'Escape') {
                closeModal(modal);
                document.removeEventListener('keydown', keyHandler);
            }
        };
        document.addEventListener('keydown', keyHandler);
    }

    // Prevent scrolling of body
    if (activeModals.size === 1) {
        document.body.classList.add('overflow-hidden');
    }

    // Dispatch modal open event
    modal.dispatchEvent(new CustomEvent('modalopen'));

    return modal;
}

/**
 * Close a modal dialog
 *
 * @param {HTMLElement} modal - The modal element to close
 * @returns {Promise<void>} Promise that resolves when the modal is closed
 */
async function closeModal(modal) {
    return new Promise((resolve) => {
        // Apply closing animation
        const animationClass = modal.classList.contains(ANIMATION_CLASSES.fadeIn) ? ANIMATION_CLASSES.fadeOut :
            modal.classList.contains(ANIMATION_CLASSES.slideIn) ? ANIMATION_CLASSES.slideOut :
            modal.classList.contains(ANIMATION_CLASSES.zoomIn) ? ANIMATION_CLASSES.zoomOut :
            null;

        if (animationClass) {
            // Remove the opening animation class
            Object.values(ANIMATION_CLASSES).forEach(cls => {
                if (cls.includes('In')) {
                    modal.classList.remove(cls);
                }
            });

            // Add the closing animation class
            modal.classList.add(animationClass);

            // Wait for animation to complete
            setTimeout(() => {
                removeModal(modal);
                resolve();
            }, 300); // Animation duration in milliseconds
        } else {
            // No animation, remove immediately
            removeModal(modal);
            resolve();
        }
    });
}

/**
 * Remove a modal from the DOM and clean up
 *
 * @param {HTMLElement} modal - The modal element to remove
 * @returns {void}
 */
function removeModal(modal) {
    // Dispatch event before removal
    modal.dispatchEvent(new CustomEvent('modalclose'));

    // Remove from tracking
    activeModals.delete(modal);

    // Remove from DOM
    if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }

    // Restore body scrolling if no more modals
    if (activeModals.size === 0) {
        document.body.classList.remove('overflow-hidden');
    }
}

/**
 * Show a confirmation dialog
 *
 * @param {string} message - Confirmation message
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} Promise resolving to true (confirm) or false (cancel)
 */
function showConfirmationDialog(message, options = {}) {
    return new Promise((resolve) => {
        const defaults = {
            title: 'Confirmation',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            confirmButtonClass: 'bg-primary text-white',
            size: 'sm'
        };

        const settings = { ...defaults, ...options };

        const modal = createModal(`<p>${message}</p>`, {
            title: settings.title,
            size: settings.size,
            buttons: [
                {
                    text: settings.cancelText,
                    onClick: () => resolve(false)
                },
                {
                    text: settings.confirmText,
                    primary: true,
                    onClick: () => resolve(true)
                }
            ]
        });

        showModal(modal);
    });
}

/**
 * Show an alert dialog
 *
 * @param {string} message - Alert message
 * @param {Object} options - Configuration options
 * @returns {Promise<void>} Promise resolving when dialog is closed
 */
function showAlertDialog(message, options = {}) {
    return new Promise((resolve) => {
        const defaults = {
            title: 'Alert',
            buttonText: 'OK',
            size: 'sm'
        };

        const settings = { ...defaults, ...options };

        const modal = createModal(`<p>${message}</p>`, {
            title: settings.title,
            size: settings.size,
            buttons: [
                {
                    text: settings.buttonText,
                    primary: true,
                    onClick: () => resolve()
                }
            ]
        });

        showModal(modal);
    });
}

/**
 * Show a prompt dialog
 *
 * @param {string} message - Prompt message
 * @param {Object} options - Configuration options
 * @returns {Promise<string|null>} Promise resolving to entered value or null if canceled
 */
function showPromptDialog(message, options = {}) {
    return new Promise((resolve) => {
        const defaults = {
            title: 'Prompt',
            defaultValue: '',
            placeholder: '',
            confirmText: 'OK',
            cancelText: 'Cancel',
            inputType: 'text',
            size: 'sm'
        };

        const settings = { ...defaults, ...options };

        const inputId = `prompt-input-${Date.now()}`;
        const content = `
            <p class="mb-3">${message}</p>
            <input
                type="${settings.inputType}"
                id="${inputId}"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700"
                value="${settings.defaultValue}"
                placeholder="${settings.placeholder}"
            >
        `;

        const modal = createModal(content, {
            title: settings.title,
            size: settings.size,
            buttons: [
                {
                    text: settings.cancelText,
                    onClick: () => resolve(null)
                },
                {
                    text: settings.confirmText,
                    primary: true,
                    onClick: () => {
                        const input = document.getElementById(inputId);
                        resolve(input ? input.value : null);
                    }
                }
            ]
        });

        showModal(modal).then(() => {
            // Focus the input after modal is shown
            const input = document.getElementById(inputId);
            if (input) {
                input.focus();
                input.select();
            }
        });
    });
}

/**
 * Create and show a custom dialog with specified fields
 *
 * @param {Array<Object>} fields - Array of field configurations
 * @param {Object} options - Dialog options
 * @returns {Promise<Object|null>} Promise resolving to object with field values or null if canceled
 */
function showFormDialog(fields, options = {}) {
    return new Promise((resolve) => {
        const defaults = {
            title: 'Form',
            submitText: 'Submit',
            cancelText: 'Cancel',
            size: 'md'
        };

        const settings = { ...defaults, ...options };
        const formId = `form-${Date.now()}`;

        // Generate form HTML
        let formHtml = `<form id="${formId}" class="space-y-4">`;

        fields.forEach((field, index) => {
            const fieldId = `field-${formId}-${index}`;

            formHtml += `<div class="form-group">`;

            // Label
            if (field.label) {
                formHtml += `<label for="${fieldId}" class="block text-sm font-medium mb-1">${field.label}</label>`;
            }

            // Field
            switch (field.type) {
                case 'text':
                case 'email':
                case 'password':
                case 'number':
                case 'tel':
                case 'url':
                case 'date':
                    formHtml += `
                        <input
                            type="${field.type}"
                            id="${fieldId}"
                            name="${field.name || ''}"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark