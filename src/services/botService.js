const TelegramBot = require('node-telegram-bot-api');
const databaseService = require('./databaseService');

// Import controllers
const startController = require('../controllers/startController');
const helpController = require('../controllers/helpController');
const expenseController = require('../controllers/expenseController');
const incomeController = require('../controllers/incomeController');
const balanceController = require('../controllers/balanceController');
const listController = require('../controllers/listController');
const categoriesController = require('../controllers/categoriesController');
const reportController = require('../controllers/reportController');

class BotService {
    constructor() {
        this.bot = null;
        this.database = null;
        this.userStates = new Map(); // Store user conversation states
        this.isInitialized = false;
    }

    async initialize(prismaClient) {
        try {
            if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'test_token_placeholder') {
                console.log('⚠️ Warning: Using placeholder bot token. Bot will not work until you set a real token.');
                return false;
            }

            // Initialize bot with polling disabled (we'll use webhooks)
            this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
            this.database = databaseService;

            // Set up event handlers
            this.setupEventHandlers();
            this.setupCommands();

            this.isInitialized = true;
            console.log('✅ Telegram bot service initialized');

            // Get bot info
            try {
                const botInfo = await this.bot.getMe();
                console.log(`👋 Bot username: @${botInfo.username}`);
            } catch (error) {
                console.log('⚠️ Could not get bot info (likely due to placeholder token)');
            }

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize bot service:', error);
            return false;
        }
    }

    setupEventHandlers() {
        if (!this.bot) return;

        // Handle bot errors
        this.bot.on('error', (error) => {
            console.error('Bot error:', error);
        });

        console.log('✅ Bot event handlers set up');
    }

    setupCommands() {
        if (!this.bot) return;

        // Basic commands
        this.bot.onText(/\/start/, (msg) => this.handleStart(msg));
        this.bot.onText(/\/help/, (msg) => this.handleHelp(msg));
        this.bot.onText(/\/cancel/, (msg) => this.handleCancel(msg));

        // Financial tracking commands
        this.bot.onText(/\/expense/, (msg) => this.handleExpense(msg));
        this.bot.onText(/\/income/, (msg) => this.handleIncome(msg));
        this.bot.onText(/\/balance/, (msg) => this.handleBalance(msg));
        this.bot.onText(/\/list/, (msg) => this.handleList(msg));
        this.bot.onText(/\/categories/, (msg) => this.handleCategories(msg));
        this.bot.onText(/\/report/, (msg) => this.handleReport(msg));

        // Handle callback queries (inline keyboard responses)
        this.bot.on('callback_query', (query) => this.handleCallbackQuery(query));

        // Handle text messages (for conversation flows)
        this.bot.on('message', (msg) => this.handleMessage(msg));

        console.log('✅ Bot commands set up');
    }

    // Command handlers
    async handleStart(msg) {
        try {
            await startController.handle(this.bot, msg, this.database);
        } catch (error) {
            console.error('Error in start command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleHelp(msg) {
        try {
            await helpController.handle(this.bot, msg);
        } catch (error) {
            console.error('Error in help command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleCancel(msg) {
        const userId = msg.from.id;
        this.userStates.delete(userId);
        await this.bot.sendMessage(msg.chat.id, '❌ Operation cancelled.');
    }

    async handleExpense(msg) {
        try {
            await expenseController.handle(this.bot, msg, this.database, this.userStates);
        } catch (error) {
            console.error('Error in expense command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleIncome(msg) {
        try {
            await incomeController.handle(this.bot, msg, this.database, this.userStates);
        } catch (error) {
            console.error('Error in income command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleBalance(msg) {
        try {
            await balanceController.handle(this.bot, msg, this.database);
        } catch (error) {
            console.error('Error in balance command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleList(msg) {
        try {
            await listController.handle(this.bot, msg, this.database);
        } catch (error) {
            console.error('Error in list command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleCategories(msg) {
        try {
            await categoriesController.handle(this.bot, msg, this.database);
        } catch (error) {
            console.error('Error in categories command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleReport(msg) {
        try {
            await reportController.handle(this.bot, msg, this.database);
        } catch (error) {
            console.error('Error in report command:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    async handleCallbackQuery(query) {
        try {
            const data = query.data;
            const msg = query.message;

            if (data.startsWith('expense_category_')) {
                await expenseController.handleCategorySelection(this.bot, query, this.database, this.userStates);
            } else if (data.startsWith('income_category_')) {
                await incomeController.handleCategorySelection(this.bot, query, this.database, this.userStates);
            } else if (data === 'add_new_category') {
                await categoriesController.handleAddingNewCategory(this.bot, query, this.database, this.userStates);
            } else if (data.startsWith('add_category_')) {
                await categoriesController.handleCategoryTypeSelection(this.bot, query, this.database, this.userStates);
            }
            else if (data === 'quick_expense') {
                await this.handleExpense(msg);
            } else if (data === 'quick_income') {
                await this.handleIncome(msg);
            } else if (data === 'quick_balance') {
                await this.handleBalance(msg);
            } else if (data === 'quick_list') {
                await this.handleList(msg);
            } else if (data === 'quick_help') {
                await this.handleHelp(msg);
            } else if (data === 'quick_categories') {
                await this.handleCategories(msg);
            } else if (data === 'quick_report') {
                await this.handleReport(msg);
            }

            // Answer the callback query to remove loading state
            await this.bot.answerCallbackQuery(query.id);
        } catch (error) {
            console.error('Error in callback query:', error);
            await this.bot.answerCallbackQuery(query.id, { text: 'An error occurred' });
        }
    }

    async handleMessage(msg) {
        // Skip if message is a command
        if (msg.text && msg.text.startsWith('/')) {
            return;
        }

        const userId = msg.from.id;
        const userState = this.userStates.get(userId);

        if (!userState) {
            return; // No active conversation
        }

        try {
            if (userState.action === 'adding_expense') {
                await expenseController.handleAmountInput(this.bot, msg, this.database, this.userStates);
            } else if (userState.action === 'adding_income') {
                await incomeController.handleAmountInput(this.bot, msg, this.database, this.userStates);
            } else if (userState.action === 'expense_description') {
                await expenseController.handleDescriptionInput(this.bot, msg, this.database, this.userStates);
            } else if (userState.action === 'income_description') {
                await incomeController.handleDescriptionInput(this.bot, msg, this.database, this.userStates);
            } else if (userState.action === 'new_category') {
                await categoriesController.handleNewCategoryInput(this.bot, msg, this.database, this.userStates);
            }
        } catch (error) {
            console.error('Error handling message:', error);
            await this.sendErrorMessage(msg.chat.id);
        }
    }

    // Webhook handler for Express.js
    async processUpdate(update) {
        try {
            if (!this.isInitialized) {
                console.log('Bot not initialized, skipping update');
                return;
            }

            // Process the update using the bot's internal handler
            await this.bot.processUpdate(update);
        } catch (error) {
            console.error('Error processing webhook update:', error);
        }
    }

    // Utility methods
    async sendErrorMessage(chatId) {
        try {
            await this.bot.sendMessage(chatId, '❌ An error occurred. Please try again or use /help for assistance.');
        } catch (error) {
            console.error('Error sending error message:', error);
        }
    }

    async sendMessage(chatId, text, options = {}) {
        try {
            if (!this.bot) {
                console.log('Bot not initialized');
                return null;
            }
            return await this.bot.sendMessage(chatId, text, options);
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async editMessage(chatId, messageId, text, options = {}) {
        try {
            if (!this.bot) {
                console.log('Bot not initialized');
                return null;
            }
            return await this.bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                ...options
            });
        } catch (error) {
            console.error('Error editing message:', error);
            throw error;
        }
    }

    async answerCallbackQuery(queryId, options = {}) {
        try {
            if (!this.bot) {
                console.log('Bot not initialized');
                return null;
            }
            return await this.bot.answerCallbackQuery(queryId, options);
        } catch (error) {
            console.error('Error answering callback query:', error);
            throw error;
        }
    }

    // Webhook management
    async setWebhook(url) {
        try {
            if (!this.bot) {
                console.log('Bot not initialized');
                return false;
            }
            await this.bot.setWebHook(url);
            console.log(`✅ Webhook set to: ${url}`);
            return true;
        } catch (error) {
            console.error('Error setting webhook:', error);
            return false;
        }
    }

    async deleteWebhook() {
        try {
            if (!this.bot) {
                console.log('Bot not initialized');
                return false;
            }
            await this.bot.deleteWebHook();
            console.log('✅ Webhook deleted');
            return true;
        } catch (error) {
            console.error('Error deleting webhook:', error);
            return false;
        }
    }

    async getWebhookInfo() {
        try {
            if (!this.bot) {
                console.log('Bot not initialized');
                return null;
            }
            return await this.bot.getWebHookInfo();
        } catch (error) {
            console.error('Error getting webhook info:', error);
            return null;
        }
    }

    async stop() {
        try {
            if (this.bot) {
                await this.deleteWebhook();
                this.bot = null;
            }
            this.userStates.clear();
            this.isInitialized = false;
            console.log('🛑 Bot service stopped');
        } catch (error) {
            console.error('Error stopping bot service:', error);
        }
    }

    // Health check
    getStatus() {
        return {
            initialized: this.isInitialized,
            activeConversations: this.userStates.size,
            botToken: process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Not set'
        };
    }
}

// Create singleton instance
const botService = new BotService();

module.exports = botService;

