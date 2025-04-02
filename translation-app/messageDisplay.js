// Message rendering logic
import { formatDate, formatShortTime } from '../utils/formatters.js';
import { translateChatMessage } from '../translation/translationCache.js';

// Load and display messages
async function loadMessages(users, messages, enableTranslation, targetLang, translationModel) {
    const chatMessagesContainer = document.getElementById('chat-messages');

    if (messages.length === 0) {
        chatMessagesContainer.innerHTML = `
            <div class="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }

    chatMessagesContainer.innerHTML = '';

    // Sort messages by timestamp
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Display messages
    for (const message of messages) {
        const user = users.find(u => u.uuid === message.userId);
        if (!user) continue;

        const messageDate = new Date(message.timestamp);
        const formattedTime = formatShortTime(messageDate);

        const messageEl = document.createElement('div');
        messageEl.className = `chat-message ${message.isSystem ? 'bg-gray-100 dark:bg-gray-600 italic' : 'bg-white dark:bg-gray-800'} rounded-lg p-3 mb-3`;

        // Create the base message content
        let messageHTML = `
            <div class="flex items-start">
                <div class="w-8 h-8 ${user.color} rounded-full flex items-center justify-center mr-2">
                    <span class="text-white text-xs font-bold">${user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">${user.name}</span>
                        <span class="text-xs text-gray-500" title="${formatDate(messageDate)}">${formattedTime}</span>
                    </div>
                    <p class="text-sm">${message.content}</p>
        `;

        // Add translation if enabled and not a system message
        if (enableTranslation && !message.isSystem) {
            // Get or request translation
            const translation = await translateChatMessage(
                message.uuid,
                message.content,
                targetLang,
                translationModel
            );

            messageHTML += `
                    <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Translation (${targetLang}):</p>
                        <p id="translation-${message.uuid}" class="text-sm text-gray-600 dark:text-gray-300">${translation}</p>
                    </div>
            `;
        }

        messageHTML += `
                </div>
            </div>
        `;

        messageEl.innerHTML = messageHTML;
        chatMessagesContainer.appendChild(messageEl);
    }

    // Scroll to bottom
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

export { loadMessages };