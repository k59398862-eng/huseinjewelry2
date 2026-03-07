'use strict';

const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN } = require('./config');

let bot = null;

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
