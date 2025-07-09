class StartController {
    static async handle(bot, msg, database) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const username = msg.from.username;
        const firstName = msg.from.first_name;
        const lastName = msg.from.last_name;

        try {
            // Create or update user in database
            const user = await database.createUser(userId, username, firstName, lastName);
            
            const welcomeMessage = `
🎉 *Welcome to Expense Tracker Bot!*

Hello ${firstName || 'there'}! I'm here to help you track your expenses and income easily.

💰 *What I can do for you:*
• Track your daily expenses and income
• Categorize your transactions
• Show your current balance
• Generate monthly reports
• Manage your spending categories

🚀 *Quick Start:*
• Use /expense to add a new expense
• Use /income to add new income
• Use /balance to see your current balance
• Use /list to see your recent transactions
• Use /categories to view all available categories
• Use /report to generate monthly financial report
• Use /help for all available commands

Let's start managing your finances! 💪
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💸 Add Expense', callback_data: 'quick_expense' },
                        { text: '💰 Add Income', callback_data: 'quick_income' }
                    ],
                    [
                        { text: '📊 View Balance', callback_data: 'quick_balance' },
                        { text: '❓ Help', callback_data: 'quick_help' }
                    ]
                ]
            };

            await bot.sendMessage(chatId, welcomeMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in start controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
        }
    }
}

module.exports = StartController;

