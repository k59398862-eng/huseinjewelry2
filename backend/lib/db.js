'use strict';

const MAX_RETRIES = parseInt(process.env.DB_RETRY_MAX_ATTEMPTS, 10) || 10;
const BASE_DELAY_MS = parseInt(process.env.DB_RETRY_BASE_DELAY_MS, 10) || 1000;
const MAX_DELAY_MS = parseInt(process.env.DB_RETRY_MAX_DELAY_MS, 10) || 30000;

function getDelay(attempt) {
  const exponential = BASE_DELAY_MS * Math.pow(2, attempt);
  const capped = Math.min(exponential, MAX_DELAY_MS);
  const jitter = Math.floor(Math.random() * 500);
  return capped + jitter;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDatabase(prisma) {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[DB] Database connection established');
      return true;
    } catch (err) {
      lastError = err;
      const delay = getDelay(attempt);
      console.warn(
        `[DB] Waiting for database connection... (attempt ${attempt + 1}/${MAX_RETRIES}) - retrying in ${delay}ms`
      );
      await sleep(delay);
    }
  }

  console.error(`[DB] Database connection failed after ${MAX_RETRIES} attempts: ${lastError.message}`);
  return false;
}

async function checkDatabaseConnection(prisma) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (_err) {
    return false;
  }
}

module.exports = { waitForDatabase, checkDatabaseConnection, MAX_RETRIES };
