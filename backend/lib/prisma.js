'use strict';

const { PrismaClient } = require('@prisma/client');

const prisma = global.__prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma;

let _isConnected = false;

function setConnected(value) {
  _isConnected = value;
}

function isConnected() {
  return _isConnected;
}

module.exports = prisma;
module.exports.setConnected = setConnected;
module.exports.isConnected = isConnected;
