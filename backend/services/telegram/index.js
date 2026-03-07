'use strict';

const { initBot, stopBot, getBot } = require('./bot');
const { setupCommands } = require('./handlers/commands');
const { setupCallbacks } = require('./handlers/callbacks');
const notifications = require('./notifications');

const init = () => {
  initBot();
  if (getBot()) {
    setupCommands();
    setupCallbacks();
  }
};

module.exports = {
  init,
  stopBot,
  getBot,
  ...notifications,
};
