import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Check, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product } from '@/data/products';
import type { PaymentMethod } from '../types';

interface CheckoutProductProps {
  user: { name: string; email: string };
  product: Product;
  coupon: string;
  couponApplied: boolean;
  discount: number;
  finalPrice: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  setCoupon: (value: string) => void;
  applyCoupon: () => void;
  onConfirm: () => void;
  formatPrice: (price: number) => string;
}

const CheckoutProduct = ({
  user,
  product,
  coupon,
  couponApplied,
  discount,
  finalPrice,
  paymentMethod,
  setPaymentMethod,
  setCoupon,
  applyCoupon,
  onConfirm,
  formatPrice,
}: CheckoutProductProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[hsl(340,80%,55%)]">
          <ArrowRight className="h-4 w-4" />
          العودة
        </Link>
        <div className="text-gray-900 font-semibold text-sm flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[hsl(340,80%,55%)]" />
          سلة المشتريات
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-[hsl(340,80%,55%)] flex items-center justify-center text-white font-bold text-sm">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="text-gray-900 font-semibold">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900">{product.name}</h3>
          <span className="px-2 py-1 text-xs rounded-full bg-[hsl(340,80%,55%,0.1)] text-[hsl(340,80%,55%)] font-semibold">عيار {product.karat}</span>
        </div>
        <div className="text-3xl font-extrabold text-gray-900 text-center py-4">
          {formatPrice(product.price)}
        </div>
        {couponApplied && (
          <div className="text-center">
            <span className="text-sm text-green-600">خصم: -{formatPrice(discount)}</span>
            <div className="text-2xl font-extrabold text-green-600 mt-1">{formatPrice(finalPrice)}</div>
          </div>
        )}
        <div className="border-t border-gray-100 mt-4 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">إجمالي الطلب</span>
            <span className="text-gray-900 font-bold">{formatPrice(finalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-3">أدخل الكوبون للخصم</p>
        <div className="flex gap-2">
          <Input
            value={coupon}
            onChange={e => setCoupon(e.target.value)}
            placeholder="أدخل الكوبون"
            className="bg-gray-50 border-gray-300 text-gray-900 flex-1 focus:border-[hsl(340,80%,55%)] focus:ring-[hsl(340,80%,55%)]"
            maxLength={30}
            disabled={couponApplied}
          />
          <Button
            onClick={applyCoupon}
            disabled={couponApplied || !coupon.trim()}
            className="bg-[hsl(340,80%,55%)] hover:bg-[hsl(340,80%,50%)] text-white font-semibold px-6"
          >
            {couponApplied ? <Check className="h-4 w-4" /> : 'تطبيق'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[hsl(340,80%,55%)]" />
          طريقة الدفع
        </h3>

        <button
          onClick={() => setPaymentMethod('tamara')}
          className={`w-full p-4 rounded-xl border mb-3 text-right transition-all ${
            paymentMethod === 'tamara'
              ? 'border-[hsl(340,80%,55%)] bg-[hsl(340,80%,55%,0.05)]'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'tamara' ? 'border-[hsl(340,80%,55%)]' : 'border-gray-300'}`}>
                {paymentMethod === 'tamara' && <div className="w-3 h-3 rounded-full bg-[hsl(340,80%,55%)]" />}
              </div>
              <span className="font-bold text-[hsl(340,80%,55%)] text-lg">Tamara</span>
              <img
                src="/tamara-logo.webp"
                alt="Tamara"
                className="h-6 object-contain"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 mr-8">تقسيم فاتورتك حتى 36 دفعة بدون فوائد!</p>
        </button>

        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>ادفع قيمة طلبك كاملة</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="text-[hsl(340,80%,55%)] font-bold">حلال</span>
            <span>خدمات مطابقة للشريعة الإسلامية</span>
          </div>
          <p className="text-xs text-gray-400">سجلك الائتماني قد يؤثر على خطط الدفع</p>
          <p className="text-xs text-gray-400">خدمات تمارا متاحة للعملاء الأكبر من 18 سنة</p>
        </div>
      </div>

      <Button
        onClick={onConfirm}
        disabled={!paymentMethod}
        className="w-full py-6 text-lg font-bold bg-[hsl(340,80%,55%)] hover:bg-[hsl(340,80%,50%)] text-white"
      >
        <Lock className="h-5 w-5 ml-2" />
        تأكيد الدفع
      </Button>
    </div>
  );
};

export default CheckoutProduct;
