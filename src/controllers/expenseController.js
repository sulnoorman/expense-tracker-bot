const { formatRupiah, toRawNumber } = require("../utils/utils");
const { _isFormatted } = require("./incomeController");

class ExpenseController {
    static async handle(bot, msg, database, userStates) {
        const chatId = msg.chat.id;

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(chatId);
            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Get expense categories
            const categories = await database.getCategoriesByUser(user.id, 'EXPENSE');

            if (categories.length === 0) {
                await bot.sendMessage(chatId, '❌ No expense categories found. Please contact support.');
                return;
            }

            // Create inline keyboard with categories
            const keyboard = {
                inline_keyboard: []
            };

            // Add categories in rows of 2
            for (let i = 0; i < categories.length; i += 2) {
                const row = [];
                row.push({
                    text: categories[i].name,
                    callback_data: `expense_category_${categories[i].id}`
                });

                if (i + 1 < categories.length) {
                    row.push({
                        text: categories[i + 1].name,
                        callback_data: `expense_category_${categories[i + 1].id}`
                    });
                }

                keyboard.inline_keyboard.push(row);
            }

            const expenseMessage = `
💸 *Adding New Expense*

Please select a category for your expense:

Use /cancel to stop this operation.
            `;

            await bot.sendMessage(chatId, expenseMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in expense controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
        }
    }

    static async handleCategorySelection(bot, query, database, userStates) {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const categoryId = parseInt(query.data.replace('expense_category_', ''));

        try {
            // Get category details
            const category = await database.getCategoryById(categoryId);
            if (!category) {
                await bot.answerCallbackQuery(query.id, { text: 'Category not found' });
                return;
            }

            // Set user state
            userStates.set(userId, {
                action: 'adding_expense',
                categoryId: categoryId,
                categoryName: category.name
            });

            const amountMessage = `
💸 *Adding Expense - ${category.name}*

Please enter the amount for this expense:
(Example: 10.000 / 10000)

Use /cancel to stop this operation.
            `;

            await bot.editMessageText(amountMessage, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error('Error in expense category selection:', error);
            await bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
        }
    }

    // Private Check Format Function
    static _isFormatted(value) {
        // Check if it contains thousand separators
        return /\d+\.\d{3}/.test(value);
    }

    static async handleAmountInput(bot, msg, database, userStates) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userState = userStates.get(userId);

        if (!userState || userState.action !== 'adding_expense') {
            return;
        }

        const amountText = msg.text.trim();
        const amountWithoutChar = toRawNumber(amountText);

        const amount = parseFloat(amountWithoutChar);

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            await bot.sendMessage(chatId, '❌ Please enter a valid positive number for the amount. (Example: 25.50)');
            return;
        }

        let formattedAmount = this._isFormatted(amountText) ? `Rp${amountText}` : formatRupiah(amount);

        // Update user state
        userState.amount = amount;
        userState.action = 'expense_description';
        userState.formattedAmount = formattedAmount;
        userStates.set(userId, userState);

        const descriptionMessage = `
💸 *Adding Expense - ${userState.categoryName}*
Amount: ${formattedAmount}

Please enter a description for this expense (optional):
You can also type "skip" to add without description.

Use /cancel to stop this operation.
        `;

        await bot.sendMessage(chatId, descriptionMessage, {
            parse_mode: 'Markdown'
        });
    }

    static async handleDescriptionInput(bot, msg, database, userStates) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userState = userStates.get(userId);

        if (!userState || userState.action !== 'expense_description') {
            return;
        }

        const description = msg.text.trim().toLowerCase() === 'skip' ? null : msg.text.trim();

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(userId);
            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Create transaction
            const transaction = await database.createTransaction(
                user.id,
                userState.categoryId,
                userState.amount,
                'EXPENSE',
                description,
                new Date().toISOString().split('T')[0]
            );

            // Clear user state
            userStates.delete(userId);

            const successMessage = `
✅ *Expense Added Successfully!*

💸 **Category:** ${userState.categoryName}
💵 **Amount:** ${userState.formattedAmount}
📅 **Date:** ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
${description ? `📝 **Description:** ${description}` : ''}

Your expense has been recorded!
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💸 Add Another Expense', callback_data: 'quick_expense' },
                        { text: '💰 Add Income', callback_data: 'quick_income' }
                    ],
                    [
                        { text: '📊 View Balance', callback_data: 'quick_balance' }
                    ]
                ]
            };

            await bot.sendMessage(chatId, successMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error saving expense:', error);
            userStates.delete(userId);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong while saving your expense. Please try again.');
        }
    }
}

module.exports = ExpenseController;

