import { useState, useMemo } from 'react';
import type { PaymentMethod } from '../types';
import type { Product } from '@/data/products';

interface PaymentMethodSelectionProps {
  product: Product;
  userName: string;
  coupon: string;
  couponApplied: boolean;
  discount: number;
  finalPrice: number;
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  setCoupon: (value: string) => void;
  applyCoupon: () => void;
  onBack: () => void;
  onContinue: () => void;
  formatPrice: (price: number) => string;
}

const ALL_PACKAGES = [
  { totalAmount: 4140, installmentsCount: 4, perInstallment: 1035, commission: 210 },
  { totalAmount: 8280, installmentsCount: 4, perInstallment: 2070, commission: 410 },
  { totalAmount: 20700, installmentsCount: 4, perInstallment: 5175, commission: 1040 },
  { totalAmount: 6210, installmentsCount: 6, perInstallment: 1035, commission: 310 },
  { totalAmount: 12420, installmentsCount: 6, perInstallment: 2070, commission: 620 },
  { totalAmount: 31050, installmentsCount: 6, perInstallment: 5175, commission: 1550 },
  { totalAmount: 18000, installmentsCount: 12, perInstallment: 1500, commission: 900 },
  { totalAmount: 24000, installmentsCount: 24, perInstallment: 1000, commission: 600 },
  { totalAmount: 50000, installmentsCount: 12, perInstallment: 4166, commission: 1800 },
  { totalAmount: 100000, installmentsCount: 36, perInstallment: 2777, commission: 2200 },
];

const TAMARA_ONLY_PRICES = [24000, 50000, 100000, 6210, 31050, 12420, 4140, 20700, 8280];
const TABBY_ONLY_PRICES = [6000, 18000];

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#000000" strokeWidth="1.5">
    <path d="M14.4998 12.001C14.4998 13.3817 13.3805 14.501 11.9998 14.501C10.6191 14.501 9.49982 13.3817 9.49982 12.001C9.49982 10.6203 10.6191 9.50098 11.9998 9.50098C13.3805 9.50098 14.4998 10.6203 14.4998 12.001Z"/>
    <path d="M16 5.00098C18.4794 5.00098 20.1903 5.38518 21.1329 5.6773C21.6756 5.84549 22 6.35987 22 6.92803V16.6833C22 17.7984 20.7719 18.6374 19.6762 18.4305C18.7361 18.253 17.5107 18.1104 16 18.1104C11.2491 18.1104 10.1096 19.9161 3.1448 18.3802C2.47265 18.232 2 17.6275 2 16.9392V6.92214C2 5.94628 2.92079 5.23464 3.87798 5.42458C10.1967 6.67844 11.4209 5.00098 16 5.00098Z"/>
    <path d="M2 9.00098C3.95133 9.00098 5.70483 7.40605 5.92901 5.75514M18.5005 5.50098C18.5005 7.54062 20.2655 9.46997 22 9.46997M22 15.001C20.1009 15.001 18.2601 16.3112 18.102 18.0993M6.00049 18.4971C6.00049 16.2879 4.20963 14.4971 2.00049 14.4971"/>
  </svg>
);

const PaymentMethodSelection = ({
  product,
  userName,
  coupon,
  couponApplied,
  discount,
  finalPrice,
  selectedMethod,
  onSelectMethod,
  setCoupon,
  applyCoupon,
  onBack,
  onContinue,
  formatPrice,
}: PaymentMethodSelectionProps) => {
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const closestPackage = useMemo(() => {
    const sorted = [...ALL_PACKAGES].sort((a, b) => {
      const diffA = Math.abs(a.totalAmount - finalPrice);
      const diffB = Math.abs(b.totalAmount - finalPrice);
      return diffA - diffB;
    });
    return sorted[0];
  }, [finalPrice]);

  const isTamaraOnly = TAMARA_ONLY_PRICES.includes(product.price);
  const isTabbyOnly = TABBY_ONLY_PRICES.includes(product.price);

  const isTamaraDisabled = isTabbyOnly;
  const isTabbyDisabled = isTamaraOnly;

  const formatPricePlain = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  return (
    <div
      className="min-h-screen bg-[#ffffff]"
      dir="rtl"
      style={{ fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="max-w-[430px] mx-auto w-full min-h-screen flex flex-col bg-[#ffffff]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-[97px] h-[80px] border border-gray-200 rounded flex items-center justify-center overflow-hidden">
              <img
                src="/se3ar.png"
                alt="شعار المتجر"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[16px] font-medium text-black">{userName}</p>
            <p className="text-[13px] text-[#777]">سلة المشتريات / <span className="font-bold text-[16px]">إتمام الطلب</span></p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#e0e0e0]" />

        {/* Content */}
        <div className="flex-1 px-4 py-4">
          {/* Order Total Section */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[14px] font-semibold text-black">إجمالي الطلب</span>
              <span className="text-[18px] font-bold text-black">
                {formatPricePlain(finalPrice)} ريال
              </span>
            </div>
            <div className="text-center">
              <span className="text-[14px] text-red-500">لديك كوبون تخفيض ؟</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="flex rounded-lg overflow-hidden mb-4 w-full" style={{ border: '1px solid #d1d5db' }}>
            <input
              type="text"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="أدخل رمز الكوبون"
              disabled={couponApplied}
              className="flex-1 h-[40px] px-3 text-[14px] border-0 bg-white text-black placeholder-[#999] outline-none text-right"
            />
            <button
              onClick={applyCoupon}
              disabled={couponApplied || !coupon.trim()}
              className="h-[40px] px-5 text-[14px] font-medium transition-colors whitespace-nowrap"
              style={{
                backgroundColor: couponApplied ? '#22c55e' : '#000000',
                color: '#fff',
                cursor: couponApplied || !coupon.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {couponApplied ? 'تم التطبيق' : 'تطبيق'}
            </button>
          </div>

          {/* Order Details Toggle Button */}
          <div className="flex justify-center mb-2">
            <button
              onClick={() => setShowOrderDetails(!showOrderDetails)}
              className="py-2 px-4 border rounded text-black text-[12px] font-medium flex items-center justify-center gap-2"
              style={{
                borderColor: showOrderDetails ? '#87CEEB' : '#d1d5db',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                width: 'auto',
              }}
            >
              {showOrderDetails ? 'إخفاء التفاصيل' : 'تفاصيل الطلب'}
            </button>
          </div>

          {/* Order Details Content */}
          {showOrderDetails && (
            <div className="px-4 py-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-black">{product.name}</span>
                <span className="text-[14px] text-black">1 × {formatPricePlain(product.price)}.00 ريال</span>
              </div>
            </div>
          )}

          {/* Separator */}
          <hr style={{ margin: '0.7rem 0' }} className="border-gray-300" />

          {/* Payment Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <WalletIcon />
              <span className="text-[16px] font-bold text-black">الدفع</span>
            </div>
            <p className="text-[14px] text-black mb-3 mr-7">اختر طريقة الدفع</p>

            {/* Payment Method Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => !isTamaraDisabled && onSelectMethod('tamara')}
                disabled={isTamaraDisabled}
                className={`flex-1 h-[50px] flex items-center justify-center border-2 rounded-lg transition-all ${
                  isTamaraDisabled
                    ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                    : selectedMethod === 'tamara'
                    ? 'border-black bg-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isTamaraDisabled
                        ? 'border-gray-300'
                        : selectedMethod === 'tamara'
                        ? 'border-black bg-black'
                        : 'border-gray-300'
                    }`}
                  >
                    {!isTamaraDisabled && selectedMethod === 'tamara' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <img
                    src="/external/images/tamara.png"
                    alt="Tamara"
                    onError={(e) => {
                      e.currentTarget.src = 'https://checkout.tamara.center/a.jpg';
                    }}
                    className="h-6"
                  />
                </div>
              </button>
              <button
                onClick={() => !isTabbyDisabled && onSelectMethod('tabby')}
                disabled={isTabbyDisabled}
                className={`flex-1 h-[50px] flex items-center justify-center border-2 rounded-lg transition-all ${
                  isTabbyDisabled
                    ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50'
                    : selectedMethod === 'tabby'
                    ? 'border-black bg-white'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isTabbyDisabled
                        ? 'border-gray-300'
                        : selectedMethod === 'tabby'
                        ? 'border-black bg-black'
                        : 'border-gray-300'
                    }`}
                  >
                    {!isTabbyDisabled && selectedMethod === 'tabby' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <img
                    src="/external/images/tabby.png"
                    alt="Tabby"
                    onError={(e) => {
                      e.currentTarget.src = 'https://checkout.tamara.center/b.jpg';
                    }}
                    className="h-6"
                  />
                </div>
              </button>
            </div>

            {/* Tamara Details */}
            {selectedMethod === 'tamara' && closestPackage && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-[14px] text-black mb-3">
                  ✓ قسّم فاتورتك حتى 24 دفعات بدون فوائد!
                </p>
                <p className="text-[14px] text-black mb-3">✓ ادفع قيمة طلبك كاملة</p>
                <hr className="border-gray-200 my-3" />
                <p className="text-[13px] text-black mb-2" style={{ fontWeight: 720 }}>خدمات مطابقة للشريعة الإسلامية</p>
                <p className="text-[12px] text-black mb-2" style={{ fontWeight: 720 }}>حلال</p>
                <p className="text-[12px] text-black mb-2" style={{ fontWeight: 720 }}>سجلك الائتماني قد يؤثر على خطط الدفع</p>
                <p className="text-[12px] text-black" style={{ fontWeight: 720 }}>خدمات تمارا متاحة للعملاء الأكبر من 18 سنة</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirm Payment Button - Fixed at bottom */}
        <div className="px-4 pb-4 pt-2 bg-[#ffffff]">
          <button
            onClick={onContinue}
            disabled={!selectedMethod}
            className="w-full h-[48px] text-[16px] font-bold rounded transition-colors"
            style={{
              backgroundColor: selectedMethod ? '#000000' : '#ddd',
              color: selectedMethod ? '#fff' : '#999',
              cursor: selectedMethod ? 'pointer' : 'not-allowed',
            }}
          >
            تأكيد الدفع
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-6 pt-2 text-center bg-[#ffffff]">
          <p className="text-[12px] text-[#777] mb-1">مع كل طلب لك نصيب من الخير</p>
          <p className="text-[11px] text-[#777]">سنتبرع بجزء من قيمة طلبك لجمعية ركن الحوار</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelection;
