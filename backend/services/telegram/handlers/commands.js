'use strict';

const prisma = require('../../../lib/prisma');
const { getBot } = require('../bot');
const approvalStore = require('../../../lib/checkoutApprovalStore');
const { sendVerifyCodeConfirmation } = require('../notifications');
const {
  isOwner,
  mainKeyboard,
  statusEmoji,
  translateStatus,
  formatDate,
  sendOrderDetails,
  updateOrderStatus,
  sendStats,
} = require('./helpers');

const setupCommands = () => {
  const bot = getBot();
  if (!bot) return;

  bot.onText(/\/start/, msg => {
    if (!isOwner(msg.chat.id)) return;
    bot.sendMessage(
      msg.chat.id,
      `🌟 أهلاً بك في بوت إدارة مؤسسة حسين إبراهيم للمجوهرات\n\n` +
        `الأوامر المتاحة:\n` +
        `/orders - قائمة آخر 10 طلبات\n` +
        `/orders pending - طلبات معلقة\n` +
        `/orders approved - طلبات موافق عليها\n` +
        `/orders rejected - طلبات مرفوضة\n` +
        `/order <id> - تفاصيل طلب\n` +
        `/approve <id> - الموافقة على طلب\n` +
        `/reject <id> - رفض طلب\n` +
        `/stats - الإحصائيات العامة\n` +
        `/stats today - إحصائيات اليوم\n` +
        `/stats month - إحصائيات الشهر\n` +
        `/verifycode <sessionId> <code> - حفظ كود OTP للتحقق\n` +
        `/help - المساعدة`,
      mainKeyboard
    );
  });

  bot.onText(/\/help/, msg => {
    if (!isOwner(msg.chat.id)) return;
    bot.sendMessage(
      msg.chat.id,
      `📖 قائمة الأوامر:\n\n` +
        `• /start - الرئيسية\n` +
        `• /orders [status] - عرض الطلبات\n` +
        `• /order <id> - تفاصيل طلب محدد\n` +
        `• /approve <id> - الموافقة على طلب\n` +
        `• /reject <id> - رفض طلب\n` +
        `• /stats [today|month] - الإحصائيات\n` +
        `• /verifycode <sessionId> <code> - حفظ كود OTP`,
      mainKeyboard
    );
  });

  bot.onText(/\/orders ?(.*)/, async (msg, match) => {
    if (!isOwner(msg.chat.id)) return;
    const status = match[1].trim();
    try {
      const where = status ? { status } : {};
      const orders = await prisma.order.findMany({
        where,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: true, product: true },
      });

      if (!orders.length) {
        return bot.sendMessage(msg.chat.id, '📭 لا توجد طلبات');
      }

      const text = orders
        .map(
          (order, index) =>
            `${index + 1}. #${order.id} | ${order.user.name} | ${order.product.name}\n` +
            `   💰 ${order.amount.toLocaleString('en-US')} ر.س | ${statusEmoji(order.status)} ${translateStatus(order.status)}\n` +
            `   📅 ${formatDate(order.createdAt)}`
        )
        .join('\n\n');

      bot.sendMessage(msg.chat.id, `📋 الطلبات${status ? ` (${status})` : ''}:\n\n${text}`, mainKeyboard);
    } catch (err) {
      bot.sendMessage(msg.chat.id, `❌ خطأ: ${err.message}`);
    }
  });

  bot.onText(/\/order (\d+)/, async (msg, match) => {
    if (!isOwner(msg.chat.id)) return;
    const id = parseInt(match[1]);
    await sendOrderDetails(msg.chat.id, id);
  });

  bot.onText(/\/approve (\d+)/, async (msg, match) => {
    if (!isOwner(msg.chat.id)) return;
    const id = parseInt(match[1]);
    await updateOrderStatus(msg.chat.id, id, 'approved');
  });

  bot.onText(/\/reject (\d+)/, async (msg, match) => {
    if (!isOwner(msg.chat.id)) return;
    const id = parseInt(match[1]);
    await updateOrderStatus(msg.chat.id, id, 'rejected');
  });

  bot.onText(/\/stats ?(.*)/, async (msg, match) => {
    if (!isOwner(msg.chat.id)) return;
    const period = match[1].trim();
    await sendStats(msg.chat.id, period);
  });

  bot.onText(/\/verifycode (\S+) (\S+)/, async (msg, match) => {
    if (!isOwner(msg.chat.id)) return;
    const sessionId = match[1].trim();
    const code = match[2].trim();

    const record = approvalStore.getRecord(sessionId);
    if (!record) {
      bot.sendMessage(msg.chat.id, `❌ الجلسة غير موجودة أو منتهية الصلاحية\nSession: ${sessionId}`);
      return;
    }

    approvalStore.setVerificationCode(sessionId, code);

    bot.sendMessage(msg.chat.id, `✅ تم حفظ الكود بنجاح\n🔑 الكود: ${code}\n🆔 Session: ${sessionId.substring(0, 8)}...`);

    sendVerifyCodeConfirmation(sessionId, code).catch(err => {
      console.error('[verifycode] Failed to send confirmation:', err.message);
    });
  });

  bot.onText(/\/verifycode$/, msg => {
    if (!isOwner(msg.chat.id)) return;
    bot.sendMessage(msg.chat.id, `⚠️ الاستخدام الصحيح:\n/verifycode <sessionId> <code>\n\nمثال:\n/verifycode abc123 4521`);
  });
};

module.exports = { setupCommands };
