'use strict';

const prisma = require('../../../lib/prisma');
const { OWNER_CHAT_ID } = require('../config');
const { getBot } = require('../bot');

const mainKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '📦 الطلبات الجديدة', callback_data: 'orders_pending' },
        { text: '📋 جميع الطلبات', callback_data: 'orders_all' },
      ],
      [
        { text: '📊 الإحصائيات', callback_data: 'stats' },
        { text: '🔄 تحديث', callback_data: 'refresh' },
      ],
    ],
  },
};

const isOwner = chatId => {
  if (!OWNER_CHAT_ID) return true;
  return String(chatId) === String(OWNER_CHAT_ID);
};

const statusEmoji = status => {
  const map = { pending: '⏳', approved: '✅', rejected: '❌', completed: '🏆', cancelled: '🚫' };
  return map[status] || '❓';
};

const translateStatus = status => {
  const map = { pending: 'معلق', approved: 'موافق عليه', rejected: 'مرفوض', completed: 'مكتمل', cancelled: 'ملغي' };
  return map[status] || status;
};

const formatDate = date => new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Riyadh' });

const sendOrderDetails = async (chatId, id) => {
  const bot = getBot();
  if (!bot) return;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true, product: true },
    });
    if (!order) return bot.sendMessage(chatId, '❌ الطلب غير موجود');

    const text =
      `📦 تفاصيل الطلب #${order.id}\n\n` +
      `👤 العميل: ${order.user.name}\n` +
      `📧 الإيميل: ${order.user.email}\n` +
      `📱 الهاتف: ${order.user.phone || 'غير محدد'}\n\n` +
      `🛍️ المنتج: ${order.product.name}\n` +
      `💰 المبلغ: ${order.amount.toLocaleString('en-US')} ر.س\n` +
      `💳 طريقة الدفع: تمارا\n` +
      `📊 الأقساط: ${order.installments === 1 ? 'دفعة كاملة' : `${order.installments} أقساط`}\n` +
      `💵 كل دفعة: ${order.perInstallment.toLocaleString('en-US')} ر.س\n` +
      `🏦 العمولة: ${order.commission.toLocaleString('en-US')} ر.س\n` +
      `💼 صافي التحويل: ${order.netTransfer.toLocaleString('en-US')} ر.س\n\n` +
      `${statusEmoji(order.status)} الحالة: ${translateStatus(order.status)}\n` +
      `💳 حالة الدفع: ${order.paymentStatus === 'paid' ? '✅ مدفوع' : order.paymentStatus === 'failed' ? '❌ فاشل' : '⏳ معلق'}\n` +
      `📅 التاريخ: ${formatDate(order.createdAt)}`;

    const keyboard = order.status === 'pending'
      ? {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ موافقة', callback_data: `approve_${order.id}` },
                { text: '❌ رفض', callback_data: `reject_${order.id}` },
              ],
            ],
          },
        }
      : {};

    bot.sendMessage(chatId, text, keyboard);
  } catch (err) {
    bot.sendMessage(chatId, `❌ خطأ: ${err.message}`);
  }
};

const updateOrderStatus = async (chatId, id, status) => {
  const bot = getBot();
  if (!bot) return;

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: true, product: true },
    });
    const emoji = status === 'approved' ? '✅' : '❌';
    const label = status === 'approved' ? 'تمت الموافقة' : 'تم الرفض';
    bot.sendMessage(chatId, `${emoji} ${label} على الطلب #${id}\nالعميل: ${order.user.name}\nالمنتج: ${order.product.name}`);
  } catch (err) {
    bot.sendMessage(chatId, `❌ خطأ: ${err.message}`);
  }
};

const sendStats = async (chatId, period) => {
  const bot = getBot();
  if (!bot) return;

  try {
    let where = {};
    const now = new Date();
    if (period === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      where = { createdAt: { gte: start } };
    } else if (period === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      where = { createdAt: { gte: start } };
    }

    const [total, pending, approved, rejected, completed, revenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: 'pending' } }),
      prisma.order.count({ where: { ...where, status: 'approved' } }),
      prisma.order.count({ where: { ...where, status: 'rejected' } }),
      prisma.order.count({ where: { ...where, status: 'completed' } }),
      prisma.order.aggregate({
        where: { ...where, status: { in: ['approved', 'completed'] } },
        _sum: { netTransfer: true },
      }),
    ]);

    const label = period === 'today' ? 'اليوم' : period === 'month' ? 'الشهر' : 'الكل';
    const text =
      `📊 إحصائيات ${label}:\n\n` +
      `📦 إجمالي الطلبات: ${total}\n` +
      `⏳ معلقة: ${pending}\n` +
      `✅ موافق عليها: ${approved}\n` +
      `❌ مرفوضة: ${rejected}\n` +
      `🏆 مكتملة: ${completed}\n\n` +
      `💰 إجمالي الإيرادات: ${(revenue._sum.netTransfer || 0).toLocaleString('en-US')} ر.س`;

    bot.sendMessage(chatId, text, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📅 اليوم', callback_data: 'stats_today' },
            { text: '📆 الشهر', callback_data: 'stats_month' },
          ],
        ],
      },
    });
  } catch (err) {
    bot.sendMessage(chatId, `❌ خطأ: ${err.message}`);
  }
};

module.exports = {
  mainKeyboard,
  isOwner,
  statusEmoji,
  translateStatus,
  formatDate,
  sendOrderDetails,
  updateOrderStatus,
  sendStats,
};
