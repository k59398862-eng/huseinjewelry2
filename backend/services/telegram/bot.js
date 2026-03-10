'use strict';

const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN } = require('./config');

let bot = null;
let webhookResetInterval = null;

// دالة لتجديد الـ Webhook
const resetWebhook = async () => {
  if (!bot) return;
  
  const useWebhook = process.env.NODE_ENV === 'production' && process.env.BACKEND_URL;
  if (!useWebhook) return;
  
  const webhookUrl = `${process.env.BACKEND_URL}/api/telegram/webhook`;
  
  try {
    // حذف الـ webhook القديم
    await bot.deleteWebHook();
    console.log('[Telegram] Webhook reset: deleted old webhook');
    
    // تعيين الـ webhook الجديد
    await bot.setWebHook(webhookUrl);
    console.log('[Telegram] Webhook reset: set to', webhookUrl);
  } catch (err) {
    console.error('[Telegram] Webhook reset error:', err.message);
  }
};

// بدء interval لتجديد الـ Webhook كل ساعة
const startWebhookResetInterval = () => {
  const useWebhook = process.env.NODE_ENV === 'production' && process.env.BACKEND_URL;
  
  if (!useWebhook) {
    console.log('[Telegram] Webhook reset interval: skipped (not in production)');
    return;
  }
  
  // مسح أي interval قديم
  if (webhookResetInterval) {
    clearInterval(webhookResetInterval);
  }
  
  // تشغيل interval كل ساعة (3600000 مللي ثانية)
  webhookResetInterval = setInterval(resetWebhook, 3600000);
  console.log('[Telegram] Webhook reset interval started (every 60 minutes)');
};

// إيقاف الـ interval
const stopWebhookResetInterval = () => {
  if (webhookResetInterval) {
    clearInterval(webhookResetInterval);
    webhookResetInterval = null;
    console.log('[Telegram] Webhook reset interval stopped');
  }
};

const initBot = () => {
  if (!BOT_TOKEN) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN not set – bot disabled');
    return null;
  }

  try {
    const useWebhook = process.env.NODE_ENV === 'production' && process.env.BACKEND_URL;

    if (useWebhook) {
      bot = new TelegramBot(BOT_TOKEN, { webHook: true });
      const webhookUrl = `${process.env.BACKEND_URL}/api/telegram/webhook`;
      bot
        .deleteWebHook()
        .then(() => {
          console.log('[Telegram] Deleted existing webhook');
          return bot.setWebHook(webhookUrl);
        })
        .then(() => {
          console.log('[Telegram] Webhook set to', webhookUrl);
          // بدء interval لتجديد الـ webhook
          startWebhookResetInterval();
        })
        .catch(err => {
          console.error('[Telegram] Webhook setup error:', err.message);
        });
    } else {
      bot = new TelegramBot(BOT_TOKEN, { polling: true });
      console.log('[Telegram] Polling mode enabled');
    }

    return bot;
  } catch (err) {
    console.error('[Telegram] Init error:', err.message);
    return null;
  }
};

const stopBot = async () => {
  if (!bot) {
    console.log('[Telegram] Bot not initialized, nothing to stop');
    return;
  }

  // إيقاف الـ webhook reset interval
  stopWebhookResetInterval();

  try {
    const useWebhook = process.env.NODE_ENV === 'production' && process.env.BACKEND_URL;

    if (useWebhook) {
      await bot.deleteWebHook();
      console.log('[Telegram] Webhook deleted for graceful shutdown');
    } else {
      bot.stopPolling();
      console.log('[Telegram] Polling stopped for graceful shutdown');
    }
  } catch (err) {
    console.error('[Telegram] Stop error:', err.message);
  }
};

const getBot = () => bot;

module.exports = { initBot, stopBot, getBot };
