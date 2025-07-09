class HelpController {
    static async handle(bot, msg) {
        const chatId = msg.chat.id;

        const helpMessage = `
📚 *Expense Tracker Bot - Help Guide*

*Basic Commands:*
🏠 /start - Initialize the bot and create your account
❓ /help - Show this help message
❌ /cancel - Cancel current operation

*Financial Tracking:*
💸 /expense - Add a new expense
💰 /income - Add new income
📊 /balance - View your current balance
📝 /list - View recent transactions
🏷️ /categories - View all available categories
📈 /report - Generate monthly financial report

*How to Use:*

*Adding Expenses:*
1. Type /expense
2. Select a category from the menu
3. Enter the amount (e.g., 10.000/10000)
4. Add a description (optional)

*Adding Income:*
1. Type /income
2. Select a category from the menu
3. Enter the amount (e.g., 10.000/10000)
4. Add a description (optional)

*Viewing Data:*
• /balance - See total income, expenses, and current balance
• /list - View your last 10 transactions
• /report - Get detailed monthly breakdown with categories

*Tips:*
• Use clear descriptions for better tracking
• Check your balance regularly
• Review monthly reports to understand spending patterns
• All amounts should be in decimal format (e.g., 12.50)

*Categories:*
The bot comes with pre-configured categories for both expenses and income. Use /categories to see all available options.

*Need Help?*
If you encounter any issues, try /cancel to reset and start over.

Happy tracking! 💪💰
        `;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '💸 Add Expense', callback_data: 'quick_expense' },
                    { text: '💰 Add Income', callback_data: 'quick_income' }
                ],
                [
                    { text: '📊 View Balance', callback_data: 'quick_balance' },
                    { text: '📝 View Transactions', callback_data: 'quick_list' }
                ],
                [
                    { text: '🏷️ Categories', callback_data: 'quick_categories' },
                    { text: '📈 Monthly Report', callback_data: 'quick_report' }
                ]
            ]
        };

        try {
            await bot.sendMessage(chatId, helpMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (error) {
            console.error('Error in help controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
        }
    }
}

module.exports = HelpController;

