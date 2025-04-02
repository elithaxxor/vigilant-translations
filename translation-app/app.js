// Core application logic
import { registerTranslationHandlers } from './translation/handlers.js';
import { db, getAllUsers, getAllMessages, addUser, deleteUser, addMessage, exportChatLogs } from './chat/storage.js';
import { loadMessages } from './chat/messageDisplay.js';
import { uuidv4 } from './utils/uuid.js';
import { generateFunnyName } from './utils/nameGenerator.js';
import { generateRandomColor } from './utils/colorGenerator.js';

// Global state
let activeUsers = [];
let chatHistory = [];

// Initialize the application
async function initApp() {
    // Register API handlers
    registerTranslationHandlers();

    // Initialize chatroom
    await initChatRoom();

    // Set up event listeners
    setupEventListeners();
}

// Initialize chat room - create admin if not exists
async function initChatRoom() {
    try {
        const adminUser = await db.users.where({isAdmin: true}).first();

        if (!adminUser) {
            const adminUuid = uuidv4();
            await db.users.add({
                uuid: adminUuid,
                name: 'Admin',
                color: 'bg-red-500',
                isAdmin: true,
                createdAt: new Date()
            });

            // Add welcome message from admin
            await db.messages.add({
                uuid: uuidv4(),
                userId: adminUuid,
                content: 'Welcome to the Translation Chat Room! Use the "Add User" button to add more participants.',
                timestamp: new Date()
            });
        }

        // Load users and messages
        await loadChatRoom();
    } catch (error) {
        console.error('Error initializing chat room:', error);
    }
}

// Load chat room data
async function loadChatRoom() {
    try {
        // Load all users
        activeUsers = await getAllUsers();

        // Update the sender select dropdown
        updateSenderSelect();

        // Update participants list
        updateParticipantsList();

        // Load messages
        const messages = await getAllMessages();
        const enableTranslation = document.getElementById('enable-chat-translation').checked;
        const targetLang = document.getElementById('chat-target-language').value;
        const translationModel = document.getElementById('chat-translation-model').value;

        await loadMessages(activeUsers, messages, enableTranslation, targetLang, translationModel);
    } catch (error) {
        console.error('Error loading chat room data:', error);
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });

            // Reset tab styles
            document.querySelectorAll('[data-tab]').forEach(t => {
                t.classList.remove('text-primary', 'border-b-2', 'border-primary', '-mb-px');
                t.classList.add('text-gray-500', 'dark:text-gray-400');
            });

            // Show selected tab content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.remove('hidden');

            // Style active tab
            tab.classList.remove('text-gray-500', 'dark:text-gray-400');
            tab.classList.add('text-primary', 'border-b-2', 'border-primary', '-mb-px');
        });
    });

    // Add more event listeners for buttons, forms, etc...
    // ...
}

// Wait for DOM to load, then initialize
document.addEventListener('DOMContentLoaded', initApp);