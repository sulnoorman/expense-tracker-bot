const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isProd = process.env.IS_PRODUCTION === 0 ? false : true;

// Default categories data
const defaultCategories = {
  expense: [
    { name: 'Food & Dining', color: '#ff6b6b' },
    { name: 'Transportation', color: '#4ecdc4' },
    { name: 'Shopping', color: '#45b7d1' },
    { name: 'Entertainment', color: '#96ceb4' },
    { name: 'Bills & Utilities', color: '#feca57' },
    { name: 'Healthcare', color: '#ff9ff3' },
    { name: 'Education', color: '#54a0ff' },
    { name: 'Other', color: '#5f27cd' }
  ],
  income: [
    { name: 'Salary', color: '#00d2d3' },
    { name: 'Freelance', color: '#ff9f43' },
    { name: 'Investment', color: '#10ac84' },
    { name: 'Gift', color: '#ee5a6f' },
    { name: 'Other', color: '#0984e3' }
  ]
};

async function createDefaultCategoriesForUser(userId) {
  try {
    console.log(`Creating default categories for user ${userId}...`);

    // Create expense categories
    for (const category of defaultCategories.expense) {
      // Check if category already exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: null,
          name: category.name,
          type: 'EXPENSE'
        }
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            userId: null,
            name: category.name,
            type: 'EXPENSE',
            color: category.color
          }
        });
      }
    }

    // Create income categories
    for (const category of defaultCategories.income) {
      // Check if category already exists
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: null,
          name: category.name,
          type: 'INCOME'
        }
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            userId: null,
            name: category.name,
            type: 'INCOME',
            color: category.color
          }
        });
      }
    }

    console.log(`✅ Default categories created for user ${userId}`);
  } catch (error) {
    console.error(`❌ Failed to create default categories for user ${userId}:`, error);
    throw error;
  }
};

async function createDefaultCategories() {
  try {
    console.log(`Creating default categories`);

    // Create expense categories
    for (const category of defaultCategories.expense) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: null,
          name: category.name,
          type: 'EXPENSE'
        }
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            userId: null,
            name: category.name,
            type: 'EXPENSE',
            color: category.color
          }
        });
      }
    }

    // Create income categories
    for (const category of defaultCategories.income) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          userId: null,
          name: category.name,
          type: 'INCOME'
        }
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: {
            userId: null,
            name: category.name,
            type: 'INCOME',
            color: category.color
          }
        });
      }
    }

    console.log(`✅ Default categories created`);
  } catch (error) {
    console.error(`❌ Failed to create default categories:`, error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting database seeding...');
  try {
    // Create a test user for demonstration
    const testUser = await prisma.user.upsert({
      where: { telegramId: BigInt(123456789) },
      update: {},
      create: {
        telegramId: BigInt(123456789),
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
      }
    });

    console.log('✅ Test user created:', testUser.username);

    // Create default categories for the test user
    await createDefaultCategories();

    // // Create some sample transactions
    // const expenseCategory = await prisma.category.findFirst({
    //   where: {
    //     userId: testUser.id,
    //     type: 'EXPENSE',
    //     name: 'Food & Dining'
    //   }
    // });

    // const incomeCategory = await prisma.category.findFirst({
    //   where: {
    //     userId: testUser.id,
    //     type: 'INCOME',
    //     name: 'Salary'
    //   }
    // });

    // if (expenseCategory && incomeCategory) {
    //   // Create sample expense
    //   await prisma.transaction.upsert({
    //     where: { id: 1 },
    //     update: {},
    //     create: {
    //       userId: testUser.id,
    //       categoryId: expenseCategory.id,
    //       amount: 25.50,
    //       type: 'EXPENSE',
    //       description: 'Coffee and breakfast',
    //       transactionDate: new Date()
    //     }
    //   });

    //   // Create sample income
    //   await prisma.transaction.upsert({
    //     where: { id: 2 },
    //     update: {},
    //     create: {
    //       userId: testUser.id,
    //       categoryId: incomeCategory.id,
    //       amount: 3000.00,
    //       type: 'INCOME',
    //       description: 'Monthly salary',
    //       transactionDate: new Date()
    //     }
    //   });

    //   console.log('✅ Sample transactions created');
    // }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

if (isProd) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

// Export function for use in bot service
module.exports = { createDefaultCategoriesForUser, defaultCategories };

