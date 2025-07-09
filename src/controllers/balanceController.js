const { formatRupiah } = require("../utils/utils");

class BalanceController {
    static async handle(bot, msg, database) {
        const chatId = msg.chat.id;

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(chatId);
            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Get balance information
            const balance = await database.getBalance(user.id);
            
            const totalIncome = parseFloat(balance.totalIncome || 0);
            const totalExpense = parseFloat(balance.totalExpense || 0);
            const currentBalance = parseFloat(balance.balance || 0);

            // Format balance message
            let statusEmoji = '📊';
            let statusText = 'Neutral';
            let statusMessage = '';

            if (currentBalance > 0) {
                statusEmoji = '✅';
                statusText = 'Positive';
                statusMessage = 'Great job! You are saving money.';
            } else if (currentBalance < 0) {
                statusEmoji = '⚠️';
                statusText = 'Negative';
                statusMessage = 'Consider reviewing your expenses.';
            } else {
                statusMessage = 'You are breaking even.';
            }

            const balanceMessage = `
${statusEmoji} *Your Financial Summary*

💰 *Current Balance:* ${formatRupiah(currentBalance)}
Status: ${statusEmoji} ${statusText}

💰 *Total Income:* ${formatRupiah(totalIncome)}
💸 *Total Expenses:* ${formatRupiah(totalExpense)}

📅 *As of:* ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}

${statusMessage}
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💸 Add Expense', callback_data: 'quick_expense' },
                        { text: '💰 Add Income', callback_data: 'quick_income' }
                    ],
                    [
                        { text: '📝 View Transactions', callback_data: 'quick_list' }
                    ]
                ]
            };

            await bot.sendMessage(chatId, balanceMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in balance controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong while fetching your balance. Please try again.');
        }
    }
}

module.exports = BalanceController;

