const { formatRupiah, toRawNumber } = require("../utils/utils");

class IncomeController {
    static async handle(bot, msg, database, userStates) {
        const chatId = msg.chat.id;    // Object message from user 

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(chatId);

            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Get income categories
            const categories = await database.getCategoriesByUser(user.id, 'INCOME');

            if (categories.length === 0) {
                await bot.sendMessage(chatId, '❌ No income categories found. Please contact support.');
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
                    callback_data: `income_category_${categories[i].id}`
                });

                if (i + 1 < categories.length) {
                    row.push({
                        text: categories[i + 1].name,
                        callback_data: `income_category_${categories[i + 1].id}`
                    });
                }

                keyboard.inline_keyboard.push(row);
            }

            const incomeMessage = `
💰 *Adding New Income*

Please select a category for your income:

Use /cancel to stop this operation.
            `;

            await bot.sendMessage(chatId, incomeMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in income controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
        }
    }

    static async handleCategorySelection(bot, query, database, userStates) {
        const chatId = query.message.chat.id;
        const userId = query.from.id;
        const categoryId = parseInt(query.data.replace('income_category_', ''));

        try {
            // Get category details
            const category = await database.getCategoryById(categoryId);
            if (!category) {
                await bot.answerCallbackQuery(query.id, { text: 'Category not found' });
                return;
            }

            // Set user state
            userStates.set(userId, {
                action: 'adding_income',
                categoryId: categoryId,
                categoryName: category.name
            });

            const amountMessage = `
💰 *Adding Income - ${category.name}*

Please enter the amount for this income:
(Example: 10.000)

Use /cancel to stop this operation.
            `;

            await bot.editMessageText(amountMessage, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error('Error in income category selection:', error);
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

        if (!userState || userState.action !== 'adding_income') {
            return;
        }

        const amountText = msg.text.trim(); // string
        const amountWithoutChar = toRawNumber(amountText);

        const amount = parseFloat(amountWithoutChar);  // number

        // Validate amount
        if (isNaN(amount) || amount <= 0) {
            await bot.sendMessage(chatId, '❌ Please enter a valid positive number for the amount. (Example: 10.000)');
            return;
        }

        let formattedAmount = this._isFormatted(amount) ? `Rp${amountText}` : formatRupiah(amount);

        // Update user state
        userState.amount = amount;
        userState.action = 'income_description';
        userState.formattedAmount = formattedAmount;
        userStates.set(userId, userState);

        const descriptionMessage = `
💰 *Adding Income - ${userState.categoryName}*
Amount: ${formattedAmount}

Please enter a description for this income (optional):
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

        if (!userState || userState.action !== 'income_description') {
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
                'INCOME',
                description,
                new Date().toISOString().split('T')[0]
            );

            // Clear user state
            userStates.delete(userId);

            const successMessage = `
✅ *Income Added Successfully!*

💰 **Category:** ${userState.categoryName}
💵 **Amount:** ${userState.formattedAmount}
📅 **Date:** ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
${description ? `📝 **Description:** ${description}` : ''}

Your income has been recorded!
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💰 Add Another Income', callback_data: 'quick_income' },
                        { text: '💸 Add Expense', callback_data: 'quick_expense' }
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
            console.error('Error saving income:', error);
            userStates.delete(userId);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong while saving your income. Please try again.');
        }
    }
}

module.exports = IncomeController;

