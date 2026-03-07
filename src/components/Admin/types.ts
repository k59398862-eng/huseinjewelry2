export type Tab = 'products' | 'orders' | 'stats' | 'settings';

export interface MarqueeSettings {
  text: string;
  enabled: boolean;
}

export interface Order {
  id: number;
  user: { name: string; email: string; phone?: string };
  product: { name: string; imageUrl?: string };
  amount: number;
  paymentMethod: string;
  installments: number;
  perInstallment: number;
  commission: number;
  netTransfer: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface Stats {
  totalOrders: number;
  todayOrders: number;
  monthOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalProducts: number;
  totalUsers: number;
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'معلق',
  approved: 'موافق عليه',
  rejected: 'مرفوض',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  approved: 'text-green-400 bg-green-400/10',
  rejected: 'text-red-400 bg-red-400/10',
  completed: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-gray-400 bg-gray-400/10',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'معلق',
  paid: 'مدفوع',
  failed: 'فاشل',
};
