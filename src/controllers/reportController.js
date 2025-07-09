const { formatRupiah } = require("../utils/utils");

class ReportController {
    static async handle(bot, msg, database) {
        const chatId = msg.chat.id;

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(chatId);
            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Get current month and year
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            // Get monthly report
            const report = await database.getMonthlyReport(user.id, currentYear, currentMonth);

            const monthName = now.toLocaleDateString('en-US', { month: 'long' });
            const totalIncome = parseFloat(report.monthlyIncome || 0);
            const totalExpenses = parseFloat(report.monthlyExpenses || 0);
            const monthlyBalance = parseFloat(report.monthlyBalance || 0);

            // Format expenses by category
            let expensesByCategory = [];
            if (Object.keys(report.expensesByCategory).length > 0) {
                Object.entries(report.expensesByCategory).forEach(([category, amount]) => {
                    expensesByCategory.push(`• ${category}: ${formatRupiah(amount)}`);
                });
            } else {
                expensesByCategory = '• No expenses recorded';
            }

            // Format income by category
            let incomeByCategory = [];
            if (Object.keys(report.incomeByCategory).length > 0) {
                Object.entries(report.incomeByCategory).forEach(([category, amount]) => {
                    incomeByCategory.push(`• ${category}: ${formatRupiah(amount)}`);
                });
            } else {
                incomeByCategory = '• No income recorded';
            }

            // Status message
            let statusMessage = '';
            if (monthlyBalance > 0) {
                statusMessage = '🎉 *Great!* You saved money this month.';
            } else if (monthlyBalance < 0) {
                statusMessage = '⚠️ *Attention:* You spent more than you earned this month.';
            } else {
                statusMessage = '📊 You broke even this month.';
            }

            const reportMessage = `
📈 *Monthly Report - ${monthName} ${currentYear}*

💰 *Total Income:* ${formatRupiah(totalIncome)}
💸 *Total Expenses:* ${formatRupiah(totalExpenses)}
${monthlyBalance >= 0 ? '✅' : '❌'} *Monthly Balance:* ${formatRupiah(monthlyBalance)}

💵 *Income by Category:*
${incomeByCategory.map((item) => item).join('\n')}

📊 *Expenses by Category:*
${expensesByCategory.map((item) => item).join('\n')}


📅 *Period:* ${monthName.slice(0, 3)} 01 - ${monthName.slice(0, 3)} ${new Date(currentYear, currentMonth, 0).getDate()}, ${currentYear}
📝 *Total Transactions:* ${report.transactions.length}

${statusMessage}
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
                    ]
                ]
            };

            await bot.sendMessage(chatId, reportMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in report controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong while generating your report. Please try again.');
        }
    }
}

module.exports = ReportController;

