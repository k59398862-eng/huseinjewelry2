import { ChevronDown, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PAYMENT_STATUS_LABELS, STATUS_COLORS, STATUS_LABELS, type Order } from './types';

interface OrdersTabProps {
  orders: Order[];
  ordersLoading: boolean;
  hasBackend: boolean;
  orderStatusFilter: string;
  setOrderStatusFilter: (value: string) => void;
  onRefresh: () => void;
  onStatusChange: (orderId: number, status: string) => void;
  formatPrice: (price: number) => string;
}

const OrdersTab = ({
  orders,
  ordersLoading,
  hasBackend,
  orderStatusFilter,
  setOrderStatusFilter,
  onRefresh,
  onStatusChange,
  formatPrice,
}: OrdersTabProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-bold text-foreground">الطلبات</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={orderStatusFilter}
              onChange={e => setOrderStatusFilter(e.target.value)}
              className="bg-secondary border border-border text-foreground rounded-lg px-3 py-2 text-sm pr-8 appearance-none cursor-pointer"
            >
              <option value="">جميع الطلبات</option>
              <option value="pending">معلقة</option>
              <option value="approved">موافق عليها</option>
              <option value="rejected">مرفوضة</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
            </select>
            <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!hasBackend ? (
        <div className="bg-card rounded-2xl border gold-border p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">الطلبات تتطلب ربط Backend</p>
          <p className="text-sm text-muted-foreground/60 mt-2">أضف VITE_API_URL في متغيرات البيئة</p>
        </div>
      ) : ordersLoading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-card rounded-2xl border gold-border p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-card rounded-xl border gold-border p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <p className="font-semibold text-foreground">{order.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                  {order.user?.phone && <p className="text-xs text-muted-foreground">{order.user.phone}</p>}
                </div>
                <div className="text-left">
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${STATUS_COLORS[order.status] || 'text-muted-foreground bg-muted'}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground text-xs">المنتج</p>
                  <p className="font-medium text-foreground">{order.product?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">المبلغ</p>
                  <p className="font-bold text-primary">{formatPrice(order.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">طريقة الدفع</p>
                  <p className="font-medium text-foreground">{order.paymentMethod === 'tamara' ? 'تمارا' : 'تابي'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">الأقساط</p>
                  <p className="font-medium text-foreground">{order.installments === 1 ? 'كاملة' : `${order.installments} أقساط`}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">كل دفعة</p>
                  <p className="font-medium text-foreground">{formatPrice(order.perInstallment)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">العمولة</p>
                  <p className="font-medium text-foreground">{formatPrice(order.commission)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">صافي التحويل</p>
                  <p className="font-bold text-green-400">{formatPrice(order.netTransfer)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">التاريخ</p>
                  <p className="font-medium text-foreground text-xs">
                    {new Date(order.createdAt).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="flex gap-2 pt-3 border-t gold-border/30">
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(order.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 text-white gap-1"
                  >
                    ✅ موافقة
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onStatusChange(order.id, 'rejected')}
                    className="text-destructive hover:bg-destructive/10 gap-1"
                  >
                    ❌ رفض
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;
