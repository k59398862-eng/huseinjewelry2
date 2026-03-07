import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TamaraLogo from '@/components/TamaraLogo';
import type { Product } from '@/data/products';

interface SuccessProps {
  userName: string;
  orderId: string;
  product: Product;
  activeTotalAmount: number;
  activeInstallments: number;
  activePerInstallment: number;
  formatPrice: (price: number) => string;
  onClose?: () => void;
}

const Success = ({
  userName,
  orderId,
  product,
  activeTotalAmount,
  activeInstallments,
  activePerInstallment,
  formatPrice,
  onClose,
}: SuccessProps) => {
  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      dir="rtl"
      style={{ fontFamily: "'Tajawal', 'Cairo', sans-serif" }}
    >
      <div className="max-w-[430px] mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <TamaraLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="text-[14px] text-[#333] font-medium"
            >
              English
            </button>
            <span className="text-[#ccc]">|</span>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#ddd] hover:bg-gray-50 transition-colors"
            >
              <span className="text-[#333] text-lg leading-none">✕</span>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#eee] mx-0" />

        {/* Content */}
        <div className="px-5 py-6 flex flex-col flex-1">
          <div className="w-20 h-20 rounded-full bg-green-100 mx-auto mb-6 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="text-[22px] font-bold text-black mb-2 text-center">تم الشراء بنجاح! 🎉</h2>
          <p className="text-[14px] text-[#666] mb-6 text-center">شكراً لك {userName}، تم تأكيد طلبك</p>

          <div className="bg-gray-50 rounded-xl p-5 text-right space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-mono text-xs">{orderId}</span>
              <span className="text-[#666]">رقم الطلب</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black">{product.name}</span>
              <span className="text-[#666]">المنتج</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black font-bold">{formatPrice(activeTotalAmount)}</span>
              <span className="text-[#666]">المبلغ الإجمالي</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black">تمارا</span>
              <span className="text-[#666]">طريقة الدفع</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black">{activeInstallments} دفعة</span>
              <span className="text-[#666]">الدفعات</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-black">{formatPrice(activePerInstallment)}</span>
              <span className="text-[#666]">كل دفعة</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              ✅ ستصلك رسالة تأكيد على جوالك مع تفاصيل الدفع
            </p>
          </div>

          <Link to="/">
            <Button className="w-full bg-[#d4af37] hover:bg-[#c9a030] text-white font-bold py-4 rounded-lg">
              <ShoppingBag className="h-4 w-4 ml-2" />
              العودة للتسوق
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
