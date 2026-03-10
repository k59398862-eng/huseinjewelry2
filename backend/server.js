'use strict';

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));

app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const uploadsDir = path.join(__dirname, "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Uploads directory created on startup");
  }
} catch (err) {
  console.error("Failed to create uploads directory on startup:", err);
}
app.use("/uploads", express.static(uploadsDir));

const prisma = require("./lib/prisma");
const { waitForDatabase, checkDatabaseConnection } = require("./lib/db");

let startupComplete = false;
let isStarting = true;

app.get("/api/health", async (_req, res) => {
  const services = {
    server: { status: 'ok' },
    database: { status: 'unknown' },
    telegram: { status: 'unknown' }
  };

  let overallStatus = 'ok';

  if (isStarting) {
    services.database.status = 'starting';
    services.database.message = 'Database connection is being established';
    overallStatus = 'starting';
  } else {
    const dbOk = await checkDatabaseConnection(prisma);
    if (dbOk) {
      services.database.status = 'ok';
      require("./lib/prisma").setConnected(true);
    } else {
      services.database.status = 'error';
      services.database.error = 'Database unreachable';
      overallStatus = 'degraded';
      require("./lib/prisma").setConnected(false);
      console.error('[Health Check] Database connection failed');
    }
  }

  try {
    const { getBot } = require('./services/telegram');
    const bot = getBot();

    if (!bot) {
      services.telegram.status = 'not_initialized';
      services.telegram.error = 'Telegram bot not initialized';
      if (overallStatus === 'ok') overallStatus = 'degraded';
    } else {
      const useWebhook = process.env.NODE_ENV === 'production' && process.env.BACKEND_URL;

      if (useWebhook) {
        const webhookInfo = await bot.getWebHookInfo();
        services.telegram = {
          status: 'ok',
          mode: 'webhook',
          webhookUrl: webhookInfo.url,
          pendingUpdates: webhookInfo.pending_update_count,
          hasPendingUpdates: webhookInfo.pending_update_count > 0,
          lastErrorDate: webhookInfo.last_error_date,
          lastErrorMessage: webhookInfo.last_error_message
        };

        if (webhookInfo.pending_update_count > 50) {
          if (overallStatus === 'ok') overallStatus = 'degraded';
          services.telegram.warning = 'High number of pending updates';
        }
        if (webhookInfo.last_error_date) {
          if (overallStatus === 'ok') overallStatus = 'degraded';
          services.telegram.warning = 'Webhook has last error';
        }
      } else {
        services.telegram = {
          status: 'ok',
          mode: 'polling'
        };
      }
    }
  } catch (error) {
    services.telegram.status = 'error';
    services.telegram.error = error.message;
    if (overallStatus === 'ok') overallStatus = 'degraded';
    console.error('[Health Check] Telegram error:', error.message);
  }

  const statusCode = overallStatus === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    status: overallStatus,
    isStarting,
    startupComplete,
    time: new Date().toISOString(),
    services
  });
});

app.get("/api/ready", (_req, res) => {
  if (startupComplete) {
    return res.status(200).json({ ready: true });
  }
  return res.status(503).json({ ready: false, isStarting });
});

const pollingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: { error: "طلبات كثيرة جداً، يرجى المحاولة لاحقاً" },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  message: { error: "طلبات كثيرة جداً، يرجى المحاولة لاحقاً" },
});

const adminRouter = require("./routes/admin");
const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const paymentsRouter = require("./routes/payments");
const telegramRouter = require("./routes/telegram");
const checkoutRouter = require("./routes/checkout");

app.use("/api/checkout/approval", pollingLimiter);
app.use("/api/checkout/verification-result", pollingLimiter);
app.use("/api/", apiLimiter);

app.use("/api/admin", adminRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/telegram", telegramRouter);
app.use("/api/checkout", checkoutRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "خطأ داخلي في الخادم" });
});

async function seedDefaultProducts() {
  try {
    const products = [
      { name: "سبيكة 36 جرام", price: 100000, weight: 36, karat: 24, description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 36 جرام", isDefault: true, order: 0 },
      { name: "سبيكة 8 جرام", price: 10000, weight: 8, karat: 24, description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 8 جرام", isDefault: true, order: 1 },
      { name: "سبيكة 14 جرام", price: 22000, weight: 14, karat: 24, description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 14 جرام", isDefault: true, order: 2 },
      { name: "سبيكة 4 جرام", price: 12420, weight: 4, karat: 24, description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 4 جرام", isDefault: true, order: 3 },
    ];

    for (const p of products) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: p.name, isDefault: true },
      });

      if (!existingProduct) {
        await prisma.product.create({ data: p });
      }
    }
    console.log("Default products seeded successfully");
  } catch (error) {
    console.error("Error seeding products:", error.message);
  }
}

async function ensureAdminExists() {
  try {
    const bcrypt = require("bcryptjs");
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await prisma.admin.findUnique({
      where: { username: adminUsername },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await prisma.admin.create({
        data: { username: adminUsername, password: hashedPassword },
      });
      console.log("Default admin created");
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.error("Error creating admin:", error.message);
  }
}

const server = app.listen(PORT, () => {
  console.log("Backend server running on port " + PORT);
  require("./services/telegram").init();
  startDatabaseInitialization();
});

async function startDatabaseInitialization() {
  isStarting = true;
  startupComplete = false;

  console.log('[DB] Starting database initialization...');
  const connected = await waitForDatabase(prisma);

  if (connected) {
    require("./lib/prisma").setConnected(true);
    await seedDefaultProducts();
    await ensureAdminExists();
    startupComplete = true;
  } else {
    require("./lib/prisma").setConnected(false);
    console.error('[DB] Continuing in degraded mode - database unavailable after all retries');
    startupComplete = true;
  }

  isStarting = false;
}

const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  isStarting = false;

  const { stopBot } = require('./services/telegram');
  await stopBot();

  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
