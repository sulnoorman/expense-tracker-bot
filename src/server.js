require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import services and routes
const { PrismaClient } = require('@prisma/client');
const botService = require('./services/botService');
const webhookRoutes = require('./routes/webhook');

// Initialize Prisma client
const prisma = new PrismaClient();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Webhook routes
app.use('/webhook', webhookRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Initialize bot service
async function startServer() {
    try {
        // Connect to database
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Initialize bot service
        await botService.initialize(prisma);
        console.log('✅ Telegram bot initialized successfully');

        // Start Express server
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Hello Guyss!`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Bot is ready to receive messages...`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\\n🛑 Received SIGINT, shutting down gracefully...');
    await botService.stop();
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\\n🛑 Received SIGTERM, shutting down gracefully...');
    await botService.stop();
    await prisma.$disconnect();
    process.exit(0);
});

// Start the server
startServer();

