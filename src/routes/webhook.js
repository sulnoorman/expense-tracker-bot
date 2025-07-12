const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const botService = require('../services/botService');

const router = express.Router();

// Webhook for github webhook
router.post('/github', async (req, res) => {
    console.log('📦 GitHub Webhook received!')
    let shellFilePath = path.resolve((__dirname, './deploy.sh'));
    console.log('shell path', shellFilePath);
    exec(shellFilePath, (err, stdout, stderr) => {
        if (err) {
            console.error('❌ Deploy failed:', stderr);
            return res.status(500).json({
                status: 500,
                filePath: shellFilePath,
                message: 'Deploy failed with this error:' + '\n' + stderr,
            })
        }
        console.log('✅ Deploy successful:', stdout);
        res.send('Deployed!');
    })
})

// Telegram webhook endpoint
router.post('/telegram', async (req, res) => {
    try {
        const update = req.body;

        // Log incoming update (remove in production)
        if (process.env.NODE_ENV === 'development') {
            // console.log('📨 Received Telegram update:', JSON.stringify(update, null, 2));
        }

        // Process the update
        await botService.processUpdate(update);

        // Respond with 200 OK
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook management endpoints
router.post('/telegram/set-webhook', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const success = await botService.setWebhook(url);

        if (success) {
            res.json({ status: 'success', message: 'Webhook set successfully', url });
        } else {
            res.status(500).json({ error: 'Failed to set webhook' });
        }
    } catch (error) {
        console.error('Error setting webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/telegram/webhook', async (req, res) => {
    try {
        const success = await botService.deleteWebhook();

        if (success) {
            res.json({ status: 'success', message: 'Webhook deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete webhook' });
        }
    } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/telegram/webhook-info', async (req, res) => {
    try {
        const info = await botService.getWebhookInfo();

        if (info) {
            res.json({ status: 'success', webhookInfo: info });
        } else {
            res.status(500).json({ error: 'Failed to get webhook info' });
        }
    } catch (error) {
        console.error('Error getting webhook info:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Bot status endpoint
router.get('/telegram/status', (req, res) => {
    try {
        const status = botService.getStatus();
        res.json({ status: 'success', botStatus: status });
    } catch (error) {
        console.error('Error getting bot status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

