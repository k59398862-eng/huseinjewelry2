import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getProducts, type Product } from '@/data/products';
import { useCheckout } from './useCheckout';
import PaymentMethodSelection from './steps/PaymentMethodSelection';
import ConfirmMethod from './steps/ConfirmMethod';
import VerifyPhone from './steps/VerifyPhone';
import SelectPlan from './steps/SelectPlan';
import CardInfo from './steps/CardInfo';
import CardApproval from './steps/CardApproval';
import ConfirmCode from './steps/ConfirmCode';
import VerifyingCode from './steps/VerifyingCode';
import Success from './steps/Success';
import Cancelled from './steps/Cancelled';
import type { User } from '@/context/AuthContext';

interface CheckoutContentProps {
  product: Product;
  user: User;
}

const CheckoutContent = ({ product, user }: CheckoutContentProps) => {
  const navigate = useNavigate();

  const {
    agreedTerms,
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
    activeInstallments,
    activePerInstallment,
    activeTotalAmount,
    sessionId,
    selectedPackage,
    applyCoupon,
  } = useCheckout(product, user);

  return (
    <div className="min-h-screen bg-white w-full max-w-[430px] mx-auto overflow-x-hidden">
      <AnimatePresence mode="wait">
        {step === 'payment-method-selection' && (
          <motion.div key="payment-method-selection" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <PaymentMethodSelection
              product={product}
              userName={user.name}
              coupon={coupon}
              couponApplied={couponApplied}
              discount={discount}
              finalPrice={finalPrice}
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              setCoupon={setCoupon}
              applyCoupon={applyCoupon}
              onBack={() => navigate(`/product/${product.id}`)}
              onContinue={() => setStep('confirm-method')}
              formatPrice={formatPrice}
            />
          </motion.div>
        )}

        {step === 'confirm-method' && (
          <motion.div key="confirm-method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ConfirmMethod
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onBack={() => navigate(`/product/${product.id}`)}
              onSubmit={handleSendActivationCode}
            />
          </motion.div>
        )}

        {step === 'verify-phone' && (
          <motion.div key="verify-phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <VerifyPhone
              phoneNumber={phoneNumber}
              activationCode={activationCode}
              setActivationCode={setActivationCode}
              agreedTerms={agreedTerms}
              setAgreedTerms={setAgreedTerms}
              codeError={codeError}
              resendTimer={resendTimer}
              formatTimer={formatTimer}
              isVerifyingCode={isVerifyingCode}
              onBack={() => setStep('confirm-method')}
              onSubmit={handleVerifyActivationCode}
              onClearError={() => setCodeError(null)}
            />
          </motion.div>
        )}

        {step === 'select-plan' && (
          <motion.div key="select-plan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <SelectPlan
              productPrice={product.price}
              productName={product.name}
              userName={user.name}
              userEmail={user.email}
              sessionId={sessionId}
              onContinue={(selectedPackage) => {
                setSelectedPackage(selectedPackage);
                setStep('card-info');
              }}
              onBack={() => setStep('verify-phone')}
            />
          </motion.div>
        )}

        {step === 'card-info' && (
          <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardInfo
              cardNumber={cardNumber}
              cardExpiry={cardExpiry}
              cardCvv={cardCvv}
              setCardNumber={setCardNumber}
              setCardExpiry={setCardExpiry}
              setCardCvv={setCardCvv}
              onBack={() => setStep('select-plan')}
              onSubmit={handleCardSubmit}
              isSubmitting={isSubmitting}
              selectedPlan={selectedPackage}
            />
          </motion.div>
        )}

        {step === 'card-approval' && (
          <motion.div key="approval" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <CardApproval 
              sessionId={sessionId} 
              orderId={orderId} 
              operationId={operationId} 
              onTimeout={() => setStep('card-info')}
            />
          </motion.div>
        )}

        {step === 'cancelled' && (
          <motion.div key="cancelled" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Cancelled onRetry={() => setStep('card-info')} />
          </motion.div>
        )}

        {step === 'confirm-code' && (
          <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <ConfirmCode
              confirmCode={confirmCode}
              setConfirmCode={setConfirmCode}
              onSubmit={handleFinalConfirm}
              codeError={confirmCodeError}
              isLoading={isConfirmingCode}
              onClearError={() => setConfirmCodeError(null)}
              productName={product.name}
              activeTotalAmount={activeTotalAmount}
              activeInstallments={activeInstallments}
              activePerInstallment={activePerInstallment}
              phoneNumber={phoneNumber}
              orderId={orderId}
            />
          </motion.div>
        )}

        {step === 'verifying-code' && (
          <motion.div key="verifying" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <VerifyingCode operationId={operationId} amount={activeTotalAmount} />
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <Success
              userName={user.name}
              orderId={orderId}
              product={product}
              activeTotalAmount={activeTotalAmount}
              activeInstallments={activeInstallments}
              activePerInstallment={activePerInstallment}
              formatPrice={formatPrice}
              onClose={() => navigate(`/product/${product.id}`)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Checkout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const products = getProducts();
  const product = products.find(p => p.id === Number(id));

  if (!user) {
    navigate('/login?redirect=/checkout/' + id);
    return null;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المنتج غير موجود</h1>
          <Link to="/" className="text-primary hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return <CheckoutContent product={product} user={user} />;
};

export default Checkout;
