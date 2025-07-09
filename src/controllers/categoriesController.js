const { isAlphabetOnly, getCategoryColor } = require("../utils/utils");

class CategoriesController {
    static async handle(bot, msg, database) {
        const chatId = msg.chat.id;

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(chatId);
            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Get categories
            const expenseCategories = await database.getCategoriesByUser(user.id, 'EXPENSE');
            const incomeCategories = await database.getCategoriesByUser(user.id, 'INCOME');

            // Format expense categories
            let expenseCategoriesList = [];
            expenseCategories.forEach((category, index) => {
                expenseCategoriesList.push(`${category.name}`);
            });

            // Format income categories
            let incomeCategoriesList = [];
            incomeCategories.forEach((category, index) => {
                incomeCategoriesList.push(`${category.name}`);
            });

            const categoriesMessage = `
🏷️ *Your Categories*

*💸 Expense Categories (${expenseCategories.length}):*
${expenseCategoriesList.map((cat, index) => `${index + 1}. ${cat}`).join('\n')}

*💰 Income Categories (${incomeCategories.length}):*
${incomeCategoriesList.map((cat, index) => `${index + 1}. ${cat}`).join('\n')}

These categories help organize your transactions for better tracking and reporting.
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: 'Add New Category', callback_data: 'add_new_category' },
                    ],
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

            await bot.sendMessage(chatId, categoriesMessage, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in categories controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong while fetching your categories. Please try again.');
        }
    }

    static async handleAddingNewCategory(bot, query, database) {
        const chatId = query.message.chat.id;

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(chatId);

            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            // Create inline keyboard with categories
            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💸 Expense', callback_data: `add_category_expense` },
                        { text: '💰 Income', callback_data: `add_category_income` },
                    ]
                ]
            };

            const message = `
💰 *Adding New Category*

Please select a category type:

Use /cancel to stop this operation.
            `;

            await bot.sendMessage(chatId, message, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });

        } catch (error) {
            console.error('Error in income controller:', error);
            await bot.sendMessage(chatId, '❌ Sorry, something went wrong. Please try again.');
        }
    }

    static async handleCategoryTypeSelection(bot, query, database, userStates) {
        const userId = query.from.id;
        const chatId = query.message.chat.id;
        const categoryType = query.data.replace('add_category_', '');

        try {
            userStates.set(userId, {
                action: 'new_category',
                newCategoryType: categoryType,
            });

            const message = `
💰 *Adding new ${categoryType} category*

Please write new category for ${categoryType} category:
(Example: Gasoline)

Use /cancel to stop this operation.
            `;

            await bot.editMessageText(message, {
                chat_id: chatId,
                message_id: query.message.message_id,
                parse_mode: 'Markdown'
            });

        } catch (error) {
            console.error('Error in new type category selection:', error);
            await bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
        }
    }

    static async handleNewCategoryInput(bot, msg, database, userStates) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const userState = userStates.get(userId);

        if (!userState || userState.action !== 'new_category') {
            return;
        }

        const categoryName = msg.text.trim().toLowerCase() === 'skip' ? null : msg.text.trim();

        try {
            // Get user from database
            const user = await database.getUserByTelegramId(userId);
            if (!user) {
                await bot.sendMessage(chatId, '❌ User not found. Please use /start to initialize your account.');
                return;
            }

            if (!isAlphabetOnly(categoryName)) {
                await bot.sendMessage(chatId, '❌ Please enter a valid category. (Alphabet only)');
                return;
            }

            const category = await database.createCategory(
                user.id,
                categoryName,
                userState.newCategoryType.toUpperCase(),
                getCategoryColor(categoryName, userState.newCategoryType),
            );

            // Clear user state
            userStates.delete(userId);

            const successMessage = `
✅ *New Category Added Successfully!*

💰 **Category:** ${categoryName}
📅 **Date:** ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}
            `;

            const keyboard = {
                inline_keyboard: [
                    [
                        { text: '💰 Add Another Category', callback_data: 'add_new_category' },
                    ],
                    [
                        { text: '💰 Add Income', callback_data: 'quick_income' },
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

module.exports = CategoriesController;

