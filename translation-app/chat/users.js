/**
 * Chat Users Module
 * 
 * Manages user-related functionality for the chat room including
 * user creation, retrieval, updating, and deletion.
 */

import { db } from './storage.js';
import { generateFunnyName, generateUniqueName } from '../utils/nameGenerator.js';
import { generateRandomColor, generateConsistentColor } from '../utils/colorGenerator.js';
import { uuidv4 } from '../utils/uuid.js';
import { showSuccess, showError } from '../ui/notifications.js';

/**
 * Get all active users from the database
 * 
 * @returns {Promise<Array>} Promise resolving to array of user objects
 */
export async function getActiveUsers() {
    try {
        return await db.users.toArray();
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

/**
 * Get a specific user by UUID
 * 
 * @param {string} uuid - The user's UUID
 * @param {boolean} [findAdmin=false] - Whether to find admin user when uuid is 'admin'
 * @returns {Promise<Object|null>} Promise resolving to user object or null if not found
 */
export async function getUserById(uuid, findAdmin = false) {
    try {
        if (uuid === 'admin' && findAdmin) {
            // Find the admin user
            return await db.users.where('isAdmin').equals(true).first();
        }
        
        return await db.users.where('uuid').equals(uuid).first();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

/**
 * Add a new user to the database
 * 
 * @param {Object} [userData] - Optional user data to override defaults
 * @returns {Promise<Object>} Promise resolving to the created user object
 */
export async function addUser(userData = {}) {
    try {
        // Get existing users to avoid name collisions
        const existingUsers = await getActiveUsers();
        const existingNames = existingUsers.map(user => user.name);
        
        // Generate a unique name if not provided
        const name = userData.name || generateUniqueName(existingNames);
        
        // Generate a UUID if not provided
        const uuid = userData.uuid || uuidv4();
        
        // Generate a random color if not provided
        const color = userData.color || generateRandomColor();
        
        // Create new user with defaults and overrides
        const newUser = {
            uuid,
            name,
            color,
            isAdmin: userData.isAdmin || false,
            status: userData.status || 'online',
            lastActive: new Date(),
            createdAt: new Date(),
            ...userData
        };
        
        // Add to database
        await db.users.add(newUser);
        
        return newUser;
    } catch (error) {
        console.error('Error adding user:', error);
        throw error;
    }
}

/**
 * Update a user's information
 * 
 * @param {string} uuid - User UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export async function updateUser(uuid, updates) {
    try {
        // Check if user exists
        const user = await getUserById(uuid);
        if (!user) {
            console.error('User not found:', uuid);
            return false;
        }
        
        // Update user
        await db.users.where('uuid').equals(uuid).modify(updates);
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
}

/**
 * Delete a user by UUID
 * 
 * @param {string} uuid - User UUID
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export async function deleteUser(uuid) {
    try {
        // Cannot delete admin user
        const user = await getUserById(uuid);
        if (!user) {
            console.error('User not found:', uuid);
            return false;
        }
        
        if (user.isAdmin) {
            console.error('Cannot delete admin user');
            showError('Admin user cannot be deleted');
            return false;
        }
        
        // Delete user
        await db.users.where('uuid').equals(uuid).delete();
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

/**
 * Update user's last active timestamp
 * 
 * @param {string} uuid - User UUID
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export async function updateUserActivity(uuid) {
    try {
        await db.users.where('uuid').equals(uuid).modify({ 
            lastActive: new Date() 
        });
        return true;
    } catch (error) {
        console.error('Error updating user activity:', error);
        return false;
    }
}

/**
 * Change a user's status
 * 
 * @param {string} uuid - User UUID
 * @param {string} status - New status ('online', 'offline', 'away', etc.)
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export async function updateUserStatus(uuid, status) {
    try {
        await db.users.where('uuid').equals(uuid).modify({ 
            status,
            lastActive: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error updating user status:', error);
        return false;
    }
}

/**
 * Change a user's name
 * 
 * @param {string} uuid - User UUID
 * @param {string} newName - New username
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export async function renameUser(uuid, newName) {
    try {
        // Check if name is already taken
        const existingUsers = await getActiveUsers();
        const existingNames = existingUsers.map(user => user.name);
        
        if (existingNames.includes(newName)) {
            showError('This username is already taken');
            return false;
        }
        
        // Update user name
        await db.users.where('uuid').equals(uuid).modify({ name: newName });
        showSuccess('Username updated successfully');
        return true;
    } catch (error) {
        console.error('Error renaming user:', error);
        showError('Failed to update username');
        return false;
    }
}

/**
 * Change a user's color
 * 
 * @param {string} uuid - User UUID
 * @param {string} [newColor] - New color class, or generate random if not provided
 * @returns {Promise<boolean>} Promise resolving to success status
 */
export async function changeUserColor(uuid, newColor = null) {
    try {
        const color = newColor || generateRandomColor();
        await db.users.where('uuid').equals(uuid).modify({ color });
        return true;
    } catch (error) {
        console.error('Error changing user color:', error);
        return false;
    }
}

/**
 * Get inactive users (not active for a specified time)
 * 
 * @param {number} inactiveMinutes - Minutes of inactivity to consider user inactive
 * @returns {Promise<Array>} Promise resolving to array of inactive user objects
 */
export async function getInactiveUsers(inactiveMinutes = 30) {
    try {
        const users = await getActiveUsers();
        const cutoffTime = new Date(Date.now() - (inactiveMinutes * 60 * 1000));
        
        return users.filter(user => 
            user.status === 'online' && 
            !user.isAdmin && 
            new Date(user.lastActive) < cutoffTime
        );
    } catch (error) {
        console.error('Error getting inactive users:', error);
        return [];
    }
}

/**
 * Auto-disconnect inactive users
 * 
 * @param {number} inactiveMinutes - Minutes of inactivity to consider user inactive
 * @returns {Promise<number>} Promise resolving to number of users disconnected
 */
export async function autoDisconnectInactiveUsers(inactiveMinutes = 30) {
    try {
        const inactiveUsers = await getInactiveUsers(inactiveMinutes);
        
        for (const user of inactiveUsers) {
            await updateUserStatus(user.uuid, 'offline');
        }
        
        return inactiveUsers.length;
    } catch (error) {
        console.error('Error auto-disconnecting users:', error);
        return 0;
    }
}

/**
 * Check if a user exists
 * 
 * @param {string} uuid - User UUID
 * @returns {Promise<boolean>} Promise resolving to whether user exists
 */
export async function userExists(uuid) {
    try {
        const user = await getUserById(uuid);
        return !!user;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
}

/**
 * Get the total count of users
 * 
 * @returns {Promise<number>} Promise resolving to user count
 */
export async function getUserCount() {
    try {
        return await db.users.count();
    } catch (error) {
        console.error('Error getting user count:', error);
        return 0;
    }
}

/**
 * Create the admin user if it doesn't exist
 * 
 * @returns {Promise<Object|null>} Promise resolving to admin user object or null if error
 */
export async function ensureAdminExists() {
    try {
        // Check if admin exists
        const admin = await db.users.where('isAdmin').equals(true).first();
        
        if (admin) {
            return admin;
        }
        
        // Create admin if it doesn't exist
        const adminUser = {
            uuid: uuidv4(),
            name: 'Admin',
            color: 'bg-red-500',
            isAdmin: true,
            status: 'online',
            lastActive: new Date(),
            createdAt: new Date()
        };
        
        await db.users.add(adminUser);
        return adminUser;
    } catch (error) {
        console.error('Error ensuring admin exists:', error);
        return null;
    }
}
