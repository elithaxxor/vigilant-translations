import { getActiveUsers, getUserById, addUser, deleteUser } from './users.js';
import { addMessage, getMessages, exportChatData } from './storage.js';
import { renderMessage, clearMessageContainer, updateParticipantsList } from './messageDisplay.js';
import { uuidv4 } from '../utils/uuid.js';
import { formatDate } from '../utils/formatters.js';
import { translateChatMessage } from '../translation/translationCache.js';
import { showSuccess, showError } from '../ui/notifications.js';

// Store chat room state
let isInitialized = false;
let translationEnabled = false;
let targetLanguage = 'English';
let translationModel = 'Claude-3.7-Sonnet';

export async function initChatRoom() {
    if (isInitialized) return;

    try {
        // Check if admin user exists, create if not
        const adminUser = await getUserById('admin', true);

        if (!adminUser) {
            const adminUuid = uuidv4();
            await addUser({
                uuid: adminUuid,
                name: 'Admin',
                color: 'bg-red-500',
                isAdmin: true,
                createdAt: new Date()
            });

            // Add welcome message from admin
            await addMessage({
                uuid: uuidv4(),
                userId: adminUuid,
                content: 'Welcome to the Translation Chat Room! Use the "Add User" button to add more participants.',
                timestamp: new Date(),
                isSystem: true
            });
        }

        // Initialize translation settings from DOM
        updateTranslationSettings();

        // Load chat room data
        await refreshChatRoom();

        // Set up event listeners
        setupEventListeners();

        isInitialized = true;
    } catch (error) {
        console.error('Error initializing chat room:', error);
        showError('Failed to initialize chat room');
    }
}

export async function refreshChatRoom() {
    try {
        // Get users and messages
        const users = await getActiveUsers();
        const messages = await getMessages();

        // Update participants list
        updateParticipantsList(users);

        // Update sender select dropdown
        updateSenderSelect(users);

        // Display messages
        await displayMessages(messages, users);
    } catch (error) {
        console.error('Error refreshing chat room:', error);
    }
}

function updateSenderSelect(users) {
    const senderSelect = document.getElementById('sender-select');
    if (!senderSelect) return;

    // Store selected value
    const currentValue = senderSelect.value;

    // Clear options
    senderSelect.innerHTML = '';

    // Add users as options
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.uuid;
        option.textContent = user.name;
        senderSelect.appendChild(option);
    });

    // Restore selected value if it still exists
    if (users.some(user => user.uuid === currentValue)) {
        senderSelect.value = currentValue;
    }
}

async function displayMessages(messages, users) {
    // Clear message container
    clearMessageContainer();

    // Early return if no messages
    if (!messages || messages.length === 0) return;

    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Process and render each message
    for (const message of messages) {
        const user = users.find(u => u.uuid === message.userId);
        if (!user) continue;

        // Handle translation if enabled and not a system message
        let translatedContent = null;
        if (translationEnabled && !message.isSystem) {
            translatedContent = await translateChatMessage(
                message.uuid,
                message.content,
                targetLanguage,
                translationModel
            );
        }

        // Render the message
        renderMessage(message, user, translatedContent, targetLanguage);
    }

    // Scroll to bottom
    scrollToBottom();
}

export async function sendMessage(content, userId) {
    if (!content || !userId) return false;

    try {
        const messageId = uuidv4();
        const newMessage = {
            uuid: messageId,
            userId,
            content,
            timestamp: new Date(),
            isSystem: false
        };

        // Add message to database
        await addMessage(newMessage);

        // Refresh chat display
        await refreshChatRoom();

        // Clear input
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.value = '';
        }

        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        showError('Failed to send message');
        return false;
    }
}

export async function addSystemMessage(content) {
    try {
        // Find admin user
        const users = await getActiveUsers();
        const adminUser = users.find(user => user.isAdmin);

        if (!adminUser) {
            console.error('Admin user not found');
            return false;
        }

        // Create system message
        const messageId = uuidv4();
        const systemMessage = {
            uuid: messageId,
            userId: adminUser.uuid,
            content,
            timestamp: new Date(),
            isSystem: true
        };

        // Add message to database
        await addMessage(systemMessage);

        // Refresh chat display
        await refreshChatRoom();

        return true;
    } catch (error) {
        console.error('Error adding system message:', error);
        return false;
    }
}

export async function createUser() {
    try {
        // Add new user
        const newUser = await addUser();

        // Add system message about new user
        await addSystemMessage(`${newUser.name} has joined the chat room. UUID: ${newUser.uuid}`);

        // Refresh chat display
        await refreshChatRoom();

        showSuccess(`Added new user: ${newUser.name}`);
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        showError('Failed to create user');
        return null;
    }
}

export async function removeUser(uuid) {
    try {
        if (!uuid) return false;

        // Find user to delete
        const users = await getActiveUsers();
        const userToDelete = users.find(u => u.uuid === uuid);

        if (!userToDelete) {
            console.error('User not found:', uuid);
            return false;
        }

        // Can't delete admin
        if (userToDelete.isAdmin) {
            showError('Cannot delete the admin user');
            return false;
        }

        // Add system message
        await addSystemMessage(`${userToDelete.name} has been removed from the chat room.`);

        // Delete the user
        await deleteUser(uuid);

        // Refresh chat room
        await refreshChatRoom();

        showSuccess(`Removed user: ${userToDelete.name}`);
        return true;
    } catch (error) {
        console.error('Error removing user:', error);
        showError('Failed to remove user');
        return false;
    }
}

export async function exportChatLogs() {
    try {
        // Get export data
        const exportData = await exportChatData();

        // Create log text representation
        let logText = `TRANSLATION APP CHAT ROOM LOGS\n`;
        logText += `Exported on: ${formatDate(new Date())}\n\n`;

        logText += `USERS:\n`;
        exportData.users.forEach(user => {
            logText += `- ${user.name} (${user.isAdmin ? 'Admin' : 'User'}) - UUID: ${user.uuid} - Created: ${user.createdAt}\n`;
        });

        logText += `\nMESSAGES:\n`;
        exportData.messages.forEach(msg => {
            logText += `[${msg.timestamp}] ${msg.userName}: ${msg.content}\n`;
        });

        return logText;
    } catch (error) {
        console.error('Error exporting chat logs:', error);
        showError('Failed to export chat logs');
        return null;
    }
}

export function updateTranslationSettings() {
    // Get settings from DOM elements
    const translationToggle = document.getElementById('enable-chat-translation');
    const langSelect = document.getElementById('chat-target-language');
    const modelSelect = document.getElementById('chat-translation-model');

    // Update module variables
    translationEnabled = translationToggle ? translationToggle.checked : false;
    targetLanguage = langSelect ? langSelect.value : 'English';
    translationModel = modelSelect ? modelSelect.value : 'Claude-3.7-Sonnet';

    // Return current settings
    return {
        enabled: translationEnabled,
        targetLang: targetLanguage,
        model: translationModel
    };
}

function setupEventListeners() {
    // Add user button
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', async () => {
            await createUser();
        });
    }

    // Export logs button
    const exportBtn = document.getElementById('export-chat-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            const logText = await exportChatLogs();
            if (logText) {
                displayExportedLogs(logText);
            }
        });
    }

    // Send message button
    const sendBtn = document.getElementById('send-message-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', async () => {
            const messageInput = document.getElementById('message-input');
            const senderSelect = document.getElementById('sender-select');

            if (messageInput && senderSelect) {
                const content = messageInput.value.trim();
                const userId = senderSelect.value;

                if (content && userId) {
                    await sendMessage(content, userId);
                }
            }
        });
    }

    // Send on Enter key
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();

                const senderSelect = document.getElementById('sender-select');
                if (senderSelect) {
                    const content = messageInput.value.trim();
                    const userId = senderSelect.value;

                    if (content && userId) {
                        await sendMessage(content, userId);
                    }
                }
            }
        });
    }

    // Translation settings
    const translationToggle = document.getElementById('enable-chat-translation');
    if (translationToggle) {
        translationToggle.addEventListener('change', async function() {
            // Update translation options visibility
            const translationOptions = document.querySelectorAll('.translation-options');
            translationOptions.forEach(el => {
                el.style.display = this.checked ? 'flex' : 'none';
            });

            // Update settings and refresh
            updateTranslationSettings();
            await refreshChatRoom();
        });
    }

    // Update when translation language or model changes
    const langSelect = document.getElementById('chat-target-language');
    if (langSelect) {
        langSelect.addEventListener('change', async () => {
            if (translationEnabled) {
                updateTranslationSettings();
                await refreshChatRoom();
            }
        });
    }

    const modelSelect = document.getElementById('chat-translation-model');
    if (modelSelect) {
        modelSelect.addEventListener('change', async () => {
            if (translationEnabled) {
                updateTranslationSettings();
                await refreshChatRoom();
            }
        });
    }
}

function displayExportedLogs(logText) {
    // Create modal for displaying logs
    const modalContainer = document.createElement('div');
    modalContainer.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
    modalContainer.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold">Chat Room Logs</h3>
                <button class="close-logs-modal text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded overflow-y-auto flex-1 mb-4">
                <pre class="text-xs whitespace-pre-wrap">${logText}</pre>
            </div>
            <p class="text-sm mb-2">Copy the logs or save them to your device.</p>
            <div class="flex justify-end space-x-2">
                <button class="copy-logs-btn px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm">
                    Copy Logs
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modalContainer);

    // Close modal button
    modalContainer.querySelector('.close-logs-modal').addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Copy logs button
    modalContainer.querySelector('.copy-logs-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(logText)
            .then(() => {
                const btn = modalContainer.querySelector('.copy-logs-btn');
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = 'Copy Logs';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy logs:', err);
            });
    });

    // Close when clicking backdrop
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}