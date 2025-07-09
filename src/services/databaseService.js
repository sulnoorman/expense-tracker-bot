const { PrismaClient } = require('@prisma/client');
const { createDefaultCategoriesForUser } = require('../../prisma/seed');

class DatabaseService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async connect() {
        try {
            await this.prisma.$connect();
            console.log('✅ Database connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            return false;
        }
    }

    async disconnect() {
        try {
            await this.prisma.$disconnect();
            console.log('🔌 Database disconnected');
        } catch (error) {
            console.error('Error disconnecting from database:', error);
        }
    }

    // User operations
    async createUser(telegramId, username, firstName, lastName) {
        try {
            const user = await this.prisma.user.upsert({
                where: { telegramId: BigInt(telegramId) },
                update: {
                    username: username || null,
                    firstName: firstName || null,
                    lastName: lastName || null,
                    updatedAt: new Date()
                },
                create: {
                    telegramId: BigInt(telegramId),
                    username: username || null,
                    firstName: firstName || null,
                    lastName: lastName || null
                }
            });

            // Check if user has categories, if not create default ones
            const existingCategories = await this.getCategoriesByUser(user.id);
            if (existingCategories.length === 0) {
                await createDefaultCategoriesForUser(user.id);
            }

            return user;
        } catch (error) {
            console.error('Error creating/updating user:', error);
            throw error;
        }
    }

    async getUserByTelegramId(telegramId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { telegramId: BigInt(telegramId) },
                include: {
                    categories: true,
                    transactions: {
                        include: {
                            category: true
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 10
                    }
                }
            });
            return user;
        } catch (error) {
            console.error('Error getting user by telegram ID:', error);
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    categories: true,
                    transactions: {
                        include: {
                            category: true
                        }
                    }
                }
            });
            return user;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }

    // Category operations
    async createCategory(userId, name, type, color = '#007bff') {
        try {
            const category = await this.prisma.category.create({
                data: {
                    userId: userId,
                    name: name,
                    type: type,
                    color: color
                }
            });
            return category;
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    async getCategoriesByUser(userId, type = null) {
        try {
            const where = { OR: [{userId: null}, {userId: userId}]  };
            if (type) {
                where.type = type;
            }

            const categories = await this.prisma.category.findMany({
                where: where,
                orderBy: {
                    name: 'asc'
                }
            });
            return categories;
        } catch (error) {
            console.error('Error getting categories by user:', error);
            throw error;
        }
    }

    async getCategoryById(categoryId) {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
                include: {
                    user: true
                }
            });
            return category;
        } catch (error) {
            console.error('Error getting category by ID:', error);
            throw error;
        }
    }

    async updateCategory(categoryId, data) {
        try {
            const category = await this.prisma.category.update({
                where: { id: categoryId },
                data: data
            });
            return category;
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }

    async deleteCategory(categoryId) {
        try {
            const category = await this.prisma.category.delete({
                where: { id: categoryId }
            });
            return category;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }

    // Transaction operations
    async createTransaction(userId, categoryId, amount, type, description, transactionDate) {
        try {
            const transaction = await this.prisma.transaction.create({
                data: {
                    userId: userId,
                    categoryId: categoryId,
                    amount: parseFloat(amount),
                    type: type,
                    description: description || null,
                    transactionDate: new Date(transactionDate)
                },
                include: {
                    category: true,
                    user: true
                }
            });
            return transaction;
        } catch (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }
    }

    async getTransactionsByUser(userId, limit = 10, offset = 0) {
        try {
            const transactions = await this.prisma.transaction.findMany({
                where: { userId: userId },
                include: {
                    category: true
                },
                orderBy: [
                    { transactionDate: 'desc' },
                    { createdAt: 'desc' }
                ],
                take: limit,
                skip: offset
            });
            return transactions;
        } catch (error) {
            console.error('Error getting transactions by user:', error);
            throw error;
        }
    }

    async getTransactionsByDateRange(userId, startDate, endDate) {
        try {
            const transactions = await this.prisma.transaction.findMany({
                where: {
                    userId: userId,
                    transactionDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    }
                },
                include: {
                    category: true
                },
                orderBy: [
                    { transactionDate: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
            return transactions;
        } catch (error) {
            console.error('Error getting transactions by date range:', error);
            throw error;
        }
    }

    async getTransactionById(transactionId) {
        try {
            const transaction = await this.prisma.transaction.findUnique({
                where: { id: transactionId },
                include: {
                    category: true,
                    user: true
                }
            });
            return transaction;
        } catch (error) {
            console.error('Error getting transaction by ID:', error);
            throw error;
        }
    }

    async updateTransaction(transactionId, data) {
        try {
            const transaction = await this.prisma.transaction.update({
                where: { id: transactionId },
                data: data,
                include: {
                    category: true,
                    user: true
                }
            });
            return transaction;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    }

    async deleteTransaction(transactionId, userId) {
        try {
            const transaction = await this.prisma.transaction.delete({
                where: {
                    id: transactionId,
                    userId: userId
                }
            });
            return transaction;
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    }

    // Balance and analytics operations
    async getBalance(userId) {
        try {
            const result = await this.prisma.transaction.aggregate({
                where: { userId: userId },
                _sum: {
                    amount: true
                },
                _count: {
                    id: true
                }
            });

            const incomeResult = await this.prisma.transaction.aggregate({
                where: {
                    userId: userId,
                    type: 'INCOME'
                },
                _sum: {
                    amount: true
                }
            });

            const expenseResult = await this.prisma.transaction.aggregate({
                where: {
                    userId: userId,
                    type: 'EXPENSE'
                },
                _sum: {
                    amount: true
                }
            });

            const totalIncome = incomeResult._sum.amount || 0;
            const totalExpense = expenseResult._sum.amount || 0;
            const balance = totalIncome - totalExpense;

            return {
                totalIncome: totalIncome,
                totalExpense: totalExpense,
                balance: balance,
                transactionCount: result._count.id || 0
            };
        } catch (error) {
            console.error('Error calculating balance:', error);
            throw error;
        }
    }

    async getMonthlyReport(userId, year, month) {
        try {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0, 23, 59, 59);

            const transactions = await this.getTransactionsByDateRange(userId, startDate, endDate);

            // Group by category
            const expensesByCategory = {};
            const incomeByCategory = {};
            let monthlyIncome = 0;
            let monthlyExpenses = 0;

            transactions.forEach(transaction => {
                const amount = parseFloat(transaction.amount);
                const categoryName = transaction.category?.name || 'No Category';

                if (transaction.type === 'INCOME') {
                    monthlyIncome += amount;
                    incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
                } else {
                    monthlyExpenses += amount;
                    expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount;
                }
            });

            return {
                monthlyIncome,
                monthlyExpenses,
                monthlyBalance: monthlyIncome - monthlyExpenses,
                expensesByCategory,
                incomeByCategory,
                transactions,
                period: {
                    startDate,
                    endDate,
                    year,
                    month
                }
            };
        } catch (error) {
            console.error('Error generating monthly report:', error);
            throw error;
        }
    }

    // Utility operations
    async getStats(userId) {
        try {
            const totalTransactions = await this.prisma.transaction.count({
                where: { userId: userId }
            });

            const totalCategories = await this.prisma.category.count({
                where: { userId: userId }
            });

            const firstTransaction = await this.prisma.transaction.findFirst({
                where: { userId: userId },
                orderBy: { createdAt: 'asc' }
            });

            const lastTransaction = await this.prisma.transaction.findFirst({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' }
            });

            return {
                totalTransactions,
                totalCategories,
                firstTransactionDate: firstTransaction?.createdAt || null,
                lastTransactionDate: lastTransaction?.createdAt || null
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'healthy', timestamp: new Date() };
        } catch (error) {
            console.error('Database health check failed:', error);
            return { status: 'unhealthy', error: error.message, timestamp: new Date() };
        }
    }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;

