import { toArabicNumbers } from '@/lib/utils';
import { Calendar, CreditCard } from 'lucide-react';

interface InstallmentBadgeProps {
  price: number;
  showDetails?: boolean;
  variant?: 'compact' | 'full';
  productId?: number;
}

const INSTALLMENT_PACKAGES: { totalAmount: number; installmentsCount: number; perInstallment: number }[] = [
  { totalAmount: 4140, installmentsCount: 4, perInstallment: 1035 },
  { totalAmount: 6000, installmentsCount: 12, perInstallment: 500 },
  { totalAmount: 8280, installmentsCount: 4, perInstallment: 2070 },
  { totalAmount: 12420, installmentsCount: 6, perInstallment: 2070 },
  { totalAmount: 20700, installmentsCount: 4, perInstallment: 5175 },
  { totalAmount: 24000, installmentsCount: 24, perInstallment: 1000 },
  { totalAmount: 31050, installmentsCount: 6, perInstallment: 5175 },
  { totalAmount: 50000, installmentsCount: 12, perInstallment: 4167 },
  { totalAmount: 18000, installmentsCount: 1, perInstallment: 18000 },
  { totalAmount: 100000, installmentsCount: 36, perInstallment: 2778 },
];

const PAYMENT_DATES = [
  '٤ أبريل ٢٠٢٦',
  '٤ مايو ٢٠٢٦',
  '٤ يونيو ٢٠٢٦',
  '٤ يوليو ٢٠٢٦',
  '٤ أغسطس ٢٠٢٦',
  '٤ سبتمبر ٢٠٢٦',
];

export function getInstallmentPackage(price: number) {
  return INSTALLMENT_PACKAGES.find(pkg => pkg.totalAmount === price) || null;
}

function isTamaraOnly(productId?: number): boolean {
  if (productId === undefined) return false;
  return productId >= 1 && productId <= 9;
}

export function formatPriceArabic(price: number): string {
  const formatted = new Intl.NumberFormat('en-US').format(price);
  return toArabicNumbers(formatted);
}

export const InstallmentBadge = ({ price, showDetails = false, variant = 'compact', productId }: InstallmentBadgeProps) => {
  const pkg = getInstallmentPackage(price);
  const tamaraOnly = isTamaraOnly(productId);

  if (!pkg) return null;

  if (variant === 'compact') {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
        style={{
          background: 'linear-gradient(135deg, #9c6af8 0%, #ab8dff 100%)',
          color: '#ffffff',
        }}
      >
        <CreditCard className="h-3.5 w-3.5" />
        <span>
          {toArabicNumbers(pkg.installmentsCount)} دفعات × {formatPriceArabic(pkg.perInstallment)} ر.س
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #f7f3ff 0%, #fff 100%)',
        border: '1px solid #e9d5ff',
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #9c6af8 0%, #ab8dff 100%)' }}
      >
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-white" />
          <span className="font-bold text-white">خيار التقسيط المتاح</span>
        </div>
        <span className="text-white/90 text-sm">
          {toArabicNumbers(pkg.installmentsCount)} دفعات
        </span>
      </div>

      <div className="p-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">الدفعة الشهرية</p>
          <p className="text-2xl font-bold" style={{ color: '#5e47b7' }}>
            {formatPriceArabic(pkg.perInstallment)} ر.س
          </p>
        </div>

        {showDetails && (
          <div className="space-y-2 mt-4 pt-4 border-t border-purple-100">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              تواريخ الدفع:
            </p>
            {PAYMENT_DATES.slice(0, pkg.installmentsCount).map((date, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">الدفعة {toArabicNumbers(index + 1)}</span>
                <span className="font-semibold" style={{ color: '#5e47b7' }}>{date}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-purple-100 mt-2">
              <span className="font-bold text-gray-800">الإجمالي</span>
              <span className="font-bold" style={{ color: '#5e47b7' }}>
                {formatPriceArabic(pkg.totalAmount)} ر.س
              </span>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
          <span className="font-semibold">✓</span>
          <span>{tamaraOnly ? 'متاح الدفع عبر Tamara' : 'متاح الدفع عبر Tamara أو Tabby'}</span>
        </div>
      </div>
    </div>
  );
};

export default InstallmentBadge;
