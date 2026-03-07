'use strict';

const express = require('express');
const router = express.Router();
const { getBot } = require('../services/telegram');

// POST /api/telegram/webhook
router.post('/webhook', (req, res) => {
  const bot = getBot();
  if (bot) {
    bot.processUpdate(req.body);
  }
  res.sendStatus(200);
});

module.exports = router;
