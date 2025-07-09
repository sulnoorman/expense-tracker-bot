const { formatRupiah } = require("../utils/utils");

class ListController {
    static async handle(bot, msg, database) {
        const chatId = msg.chat.id;

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(chatId);
            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Get recent transactions
            const transactions = await database.getTransactionsByUser(user.id, 10);

            if (transactions.length === 0) {
                const noTransactionsMessage = `
📝 *No Transactions Found*

You haven't recorded any transactions yet.

🚀 *Get started:*
• Use /expense to add your first expense
• Use /income to add your first income

Start tracking your finances today! 💪
                `;

                const keyboard = {
                    inline_keyboard: [
                        [
                            { text: '💸 Add Expense', callback_data: 'quick_expense' },
                            { text: '💰 Add Income', callback_data: 'quick_income' }
                        ]
                    ]
                };

                await bot.sendMessage(chatId, noTransactionsMessage, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                });
                return;
            }

            // Format transactions
            let transactionsList = [];
            transactions.forEach((transaction) => {
                const amount = parseFloat(transaction.amount);
                const type = transaction.type;
                const emoji = type === 'INCOME' ? '💰' : '💸';
                const sign = type === 'INCOME' ? '+' : '-';
                const categoryName = transaction.category?.name || 'No Category';
                const date = new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit'
                });
                const description = transaction.description || '';

                transactionsList.push(`${emoji} *${sign}${formatRupiah(amount)}* | ${categoryName}`);
                transactionsList.push(`📅 ${date}${description ? ` - ${description}` : ''}`);
            });

            const listMessage = `
📝 *Recent Transactions* (Last ${transactions.length})

${transactionsList.map((item) => item).join('\n')}

Use /balance to see your current financial summary.
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💸 Add Expense', callback_data: 'quick_expense' },
                        { text: '💰 Add Income', callback_data: 'quick_income' }
                    ],
                    [
                        { text: '📊 View Balance', callback_data: 'quick_balance' }
                    ]
                ]
            };

            await bot.sendMessage(chatId, listMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in list controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong while fetching your transactions. Please try again.');
        }
    }
}

module.exports = ListController;

