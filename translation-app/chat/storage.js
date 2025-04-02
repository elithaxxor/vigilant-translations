// IndexedDB interactions
import { formatDate } from '../utils/formatters.js';

// Initialize IndexedDB database
const db = new Dexie('TranslationChatRoom');
db.version(1).stores({
    users: '++id, uuid, name, color, isAdmin, createdAt',
    messages: '++id, uuid, userId, content, timestamp'
});

// User functions
async function getAllUsers() {
    return await db.users.toArray();
}

async function getUserById(uuid) {
    return await db.users.where('uuid').equals(uuid).first();
}

async function addUser(userData) {
    return await db.users.add(userData);
}

async function deleteUser(uuid) {
    return await db.users.where('uuid').equals(uuid).delete();
}

// Message functions
async function getAllMessages() {
    return await db.messages.toArray();
}

async function addMessage(messageData) {
    return await db.messages.add(messageData);
}

async function getMessagesByUser(userId) {
    return await db.messages.where('userId').equals(userId).toArray();
}

// Export log data
async function exportChatLogs() {
    const users = await getAllUsers();
    const messages = await getAllMessages();

    // Format messages with user names
    const formattedMessages = messages.map(message => {
        const user = users.find(u => u.uuid === message.userId);
        const userName = user ? user.name : 'Unknown User';

        return {
            uuid: message.uuid,
            userName,
            userUuid: message.userId,
            content: message.content,
            timestamp: formatDate(new Date(message.timestamp)),
            isSystem: message.isSystem || false
        };
    });

    // Create a "download-friendly" object
    const exportData = {
        exportDate: formatDate(new Date()),
        users: users.map(user => ({
            uuid: user.uuid,
            name: user.name,
            isAdmin: user.isAdmin,
            createdAt: formatDate(new Date(user.createdAt))
        })),
        messages: formattedMessages
    };

    return exportData;
}

export {
    db,
    getAllUsers,
    getUserById,
    addUser,
    deleteUser,
    getAllMessages,
    addMessage,
    getMessagesByUser,
    exportChatLogs
};