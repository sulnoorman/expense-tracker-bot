# Telegram Expense Tracker Bot (Express.js + Prisma + MariaDB)

A comprehensive Telegram bot for tracking personal expenses and income, built with Express.js and Prisma ORM using MariaDB database. This bot provides an intuitive interface for managing your finances directly through Telegram, featuring real-time balance monitoring, categorized transactions, and detailed monthly reporting with enterprise-grade database reliability.

## 🌟 Features

### Core Functionality

- **User Management**: Automatic user registration and profile management
- **Expense Tracking**: Add expenses with categories, amounts, and descriptions
- **Income Recording**: Track income from various sources with categorization
- **Balance Monitoring**: Real-time calculation of total income, expenses, and current balance
- **Transaction History**: View recent transactions with detailed information
- **Category Management**: Pre-configured categories for expenses and income
- **Monthly Reporting**: Comprehensive monthly financial summaries with category breakdowns

### User Experience

- **Interactive Interface**: Inline keyboards for easy navigation
- **Conversation Flow**: Guided step-by-step process for adding transactions
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Input Validation**: Robust validation for amounts and transaction data
- **Cancellation Support**: Ability to cancel operations at any time
- **Quick Actions**: Fast access to common functions via inline buttons

### Technical Features

- **Express.js Backend**: RESTful API with webhook support
- **Prisma ORM**: Type-safe database operations with migrations
- **SQLite Database**: Lightweight database with easy deployment
- **Environment Configuration**: Secure configuration management
- **Webhook Support**: Production-ready webhook handling
- **Health Monitoring**: Built-in health check endpoints

## 🛠 Technology Stack

| Component     | Technology            | Version |
| ------------- | --------------------- | ------- |
| Runtime       | Node.js               | 18.x+   |
| Framework     | Express.js            | 4.21.2  |
| Database ORM  | Prisma                | 6.1.0   |
| Database      | MariaDB               | 10.6+   |
| Bot Framework | node-telegram-bot-api | 0.66.0  |
| Environment   | dotenv                | 16.4.7  |
| Security      | Helmet.js             | 8.0.0   |
| CORS          | cors                  | 2.8.5   |
| Logging       | Morgan                | 1.10.0  |

## 📋 Prerequisites

### System Requirements

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **MariaDB**: Version 10.6 or higher
- **Memory**: Minimum 1GB RAM (2GB+ recommended for MariaDB)
- **Storage**: Minimum 1GB free space
- **Network**: Internet connectivity for Telegram API

### Required Accounts

1. **Telegram Bot Token**:
   - Message @BotFather on Telegram
   - Create a new bot using `/newbot`
   - Save the provided token securely

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd telegram-expense-bot-express

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Configure your `.env` file:

```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/expense_tracker"

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Server Configuration
PORT=3000
NODE_ENV=development

# Timezone (optional)
TIMEZONE=UTC
```

### 3. Database Setup

```bash
# Install and start MariaDB (Ubuntu/Debian)
sudo apt update
sudo apt install mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Create database
mysql -u root -p -e "CREATE DATABASE expense_tracker;"

# Run database migrations
npm run db:migrate

# Seed the database with default categories
npm run db:seed
```

### 4. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 5. Set Up Webhook (Production)

For production deployment, you'll need to set up a webhook:

```bash
# Set webhook URL (replace with your domain)
curl -X POST http://localhost:3000/webhook/telegram/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://yourdomain.com/webhook/telegram"}'
```

## 📖 Usage Guide

### Bot Commands

| Command       | Description                       | Example       |
| ------------- | --------------------------------- | ------------- |
| `/start`      | Initialize bot and create account | `/start`      |
| `/help`       | Show help and command list        | `/help`       |
| `/expense`    | Add a new expense                 | `/expense`    |
| `/income`     | Add new income                    | `/income`     |
| `/balance`    | View current balance              | `/balance`    |
| `/list`       | View recent transactions          | `/list`       |
| `/categories` | View all categories               | `/categories` |
| `/report`     | Generate monthly report           | `/report`     |
| `/cancel`     | Cancel current operation          | `/cancel`     |

### Adding Expenses

1. Send `/expense` to the bot
2. Select a category from the inline keyboard
3. Enter the amount (e.g., `25.50`)
4. Add a description (optional) or type `skip`
5. Confirm the transaction

### Adding Income

1. Send `/income` to the bot
2. Select a category from the inline keyboard
3. Enter the amount (e.g., `1500.00`)
4. Add a description (optional) or type `skip`
5. Confirm the transaction

### Viewing Reports

- **Balance**: Use `/balance` to see current financial summary
- **Transactions**: Use `/list` to view recent transactions
- **Monthly Report**: Use `/report` for detailed monthly breakdown

## 🗄 Database Schema (MariaDB)

### Tables

#### Users

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Categories

```sql
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('EXPENSE', 'INCOME') NOT NULL,
    color VARCHAR(7) DEFAULT '#007bff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, name, type)
);
```

#### Transactions

```sql
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('EXPENSE', 'INCOME') NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_user_type (user_id, type)
);
```

### Default Categories

#### Expense Categories

- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Other

#### Income Categories

- Salary
- Freelance
- Investment
- Gift
- Other

## 🔧 API Endpoints

### Health Check

```
GET /health
```

Returns server status and uptime information.

### Webhook Management

```
POST /webhook/telegram/set-webhook
DELETE /webhook/telegram/webhook
GET /webhook/telegram/webhook-info
GET /webhook/telegram/status
```

### Telegram Webhook

```
POST /webhook/telegram
```

Receives updates from Telegram Bot API.

## 🧪 Testing

### Run Tests

```bash
# Run comprehensive bot functionality test
node test-bot-complete.js

# Run database service test
node test-database.js
```

### Test Coverage

The test suite covers:

- Database connection and Prisma integration
- User registration and management
- Category creation and retrieval
- Expense and income tracking workflows
- Balance calculations
- Transaction listing
- Monthly reporting
- Error handling
- Data integrity

## 📦 Available Scripts

| Script                | Description                                |
| --------------------- | ------------------------------------------ |
| `npm start`           | Start production server                    |
| `npm run dev`         | Start development server with auto-restart |
| `npm run db:generate` | Generate Prisma client                     |
| `npm run db:migrate`  | Run database migrations                    |
| `npm run db:seed`     | Seed database with default data            |
| `npm run db:studio`   | Open Prisma Studio (database GUI)          |
| `npm run db:reset`    | Reset database (⚠️ destructive)            |

## 🚀 Deployment

### Development Deployment

1. Follow the Quick Start guide above
2. Use `npm run dev` for development
3. Bot will run in polling mode for testing

### Production Deployment

#### Option 1: Traditional Server

1. **Server Setup**:

   ```bash
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Clone and setup application
   git clone <repository-url>
   cd telegram-expense-bot-express
   npm install --production
   ```

2. **Environment Configuration**:

   ```bash
   # Create production environment file
   cp .env.example .env
   # Edit with production values
   ```

3. **Database Setup**:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Process Management with PM2**:

   ```bash
   # Install PM2
   npm install -g pm2

   # Start application
   pm2 start src/server.js --name expense-tracker-bot
   pm2 save
   pm2 startup
   ```

5. **Set Up Webhook**:
   ```bash
   curl -X POST http://localhost:3000/webhook/telegram/set-webhook \
     -H "Content-Type: application/json" \
     -d '{"url": "https://yourdomain.com/webhook/telegram"}'
   ```

#### Option 2: Docker Deployment

1. **Create Dockerfile**:

   ```dockerfile
   FROM node:18-alpine
   WORKDIR /usr/src/app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npx prisma generate
   EXPOSE 3000
   CMD ["node", "src/server.js"]
   ```

2. **Build and Run**:
   ```bash
   docker build -t expense-tracker-bot .
   docker run -d -p 3000:3000 --env-file .env expense-tracker-bot
   ```

#### Option 3: Cloud Platforms

**Heroku**:

```bash
# Add Procfile
echo "web: node src/server.js" > Procfile

# Deploy
heroku create your-expense-bot
heroku config:set TELEGRAM_BOT_TOKEN=your_token
git push heroku main
```

**Railway/Render**: Follow platform-specific deployment guides.

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique bot tokens
- Rotate tokens periodically

### Database Security

- Use proper file permissions for SQLite database
- Consider encryption for sensitive data
- Regular backups

### Server Security

- Use HTTPS in production
- Implement rate limiting
- Keep dependencies updated
- Use security headers (Helmet.js included)

## 🔍 Monitoring and Maintenance

### Health Checks

```bash
# Check server health
curl http://localhost:3000/health

# Check bot status
curl http://localhost:3000/webhook/telegram/status
```

### Logs

```bash
# View PM2 logs
pm2 logs expense-tracker-bot

# View application logs
tail -f logs/app.log
```

### Database Maintenance

```bash
# View database with Prisma Studio
npm run db:studio

# Backup database
cp dev.db backup-$(date +%Y%m%d).db
```

## 🐛 Troubleshooting

### Common Issues

#### Bot Not Responding

1. Check bot token in `.env` file
2. Verify webhook is set correctly
3. Check server logs for errors
4. Ensure server is accessible from internet

#### Database Errors

1. Check database file permissions
2. Run migrations: `npm run db:migrate`
3. Verify Prisma client is generated: `npm run db:generate`

#### Webhook Issues

1. Verify webhook URL is accessible
2. Check SSL certificate (HTTPS required)
3. Review webhook info: `GET /webhook/telegram/webhook-info`

### Debug Mode

Set `NODE_ENV=development` to enable detailed logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Telegram Bot API](https://core.telegram.org/bots/api) for the bot platform
- [Prisma](https://www.prisma.io/) for the excellent ORM
- [Express.js](https://expressjs.com/) for the web framework
- [Node.js](https://nodejs.org/) for the runtime environment

## 📞 Support

For support, please:

1. Check the troubleshooting section
2. Review the documentation
3. Open an issue on GitHub
4. Contact the development team

---

---

### Notes

1. Flow Expense, View Balance, dan Help

- Flow Expense perlu dicek dan disesuaikan dengan kebutuhan (Done)
- Flow View balance perlu dicek dan disesuaikan dengan kebutuhan (Done)
- Flow View Transaction perlu dicek dan disesuaikan dengan kebutuhan (Done)
- Flow Report perlu dicek dan disesuaikan dengan kebutuhan (Done)
- Flow Help perlu dicek dan disesuaikan dengan kebutuhan (Done)

2. Database categories dibuat menjadi master table, dan dibuat many to many dengan table users. (Done)
3. Add add custom categories function. (Done)

---

### Request Feature

💰🎉🚀💸❓📊🏠❌📋🏷️📈🗓️💵

fitur masukan bot:

1. Fitur tabung dari mas azis. Flow:
   - Masukkan Target jumlah tabungan dan tanggal kebutuhan tabungan.
   - Masukkan penghasilan per bulan.
   - Outputnya adalah bisa mengetahui berapa besar uang yang harus ditabung untuk mencapai target tersebut dalam harian, mingguan, dan bulanan.

**Built with ❤️ by Manus AI**

_Version 1.0.0 - Express.js + Prisma Edition Vibe Coding bruhhh!!!_
