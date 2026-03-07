import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, LogOut, Package, ShoppingBag, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  reorderProduct,
  defaultProducts,
  type Product,
} from '@/data/products';
import {
  fetchAdminStats,
  fetchAdminOrders,
  updateOrderStatus,
  createProduct,
  editProduct,
  removeProduct,
  reorderProductApi,
} from '@/lib/api';
import { OrdersTab, ProductsTab, StatsTab, MarqueeTab, type Order, type Stats, type Tab, type MarqueeSettings } from '@/components/Admin';

const AdminDashboard = () => {
  const { admin, logout, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<Product[]>(getProducts());

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formKarat, setFormKarat] = useState('24');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState('');
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImages, setFormImages] = useState<File[]>([]);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const [formImageUrl, setFormImageUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Marquee Settings
  const [marqueeSettings, setMarqueeSettings] = useState<MarqueeSettings>({
    text: "مؤسسة حسين إبراهيم حسين للمجوهرات و للذهب ☆ أفضل أسعار الذهب ☆ سبيكة ذهب عيار 24 ☆ توصيل لجميع المناطق ☆ ",
    enabled: true,
  });

  const hasBackend = Boolean(import.meta.env.VITE_API_URL);

  const loadOrders = useCallback(async () => {
    if (!hasBackend) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const data = await fetchAdminOrders(orderStatusFilter || undefined);
      setOrders(data.orders || []);
    } catch {
      toast.error('تعذر تحميل الطلبات');
    } finally {
      setOrdersLoading(false);
    }
  }, [hasBackend, orderStatusFilter]);

  const loadStats = useCallback(async () => {
    if (!hasBackend) {
      setStats(null);
      return;
    }
    setStatsLoading(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch {
      toast.error('تعذر تحميل الإحصائيات');
    } finally {
      setStatsLoading(false);
    }
  }, [hasBackend]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('marquee_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMarqueeSettings({
          text: parsed.text || marqueeSettings.text,
          enabled: parsed.enabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading marquee settings:', error);
    }
  }, []);

  useEffect(() => {
    if (tab === 'orders') loadOrders();
    if (tab === 'stats') loadStats();
  }, [tab, loadOrders, loadStats]);

  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormWeight('');
    setFormKarat('24');
    setFormDescription('');
    setFormOrder('');
    setFormImage(null);
    setFormImages([]);
    setFormImagePreview(null);
    setFormImageUrl('');
  };

  const populateForm = (product: Product) => {
    setFormName(product.name);
    setFormPrice(String(product.price));
    setFormWeight(String(product.weight));
    setFormKarat(String(product.karat));
    setFormDescription(product.description || '');
    setFormOrder(String(product.order ?? 0));
    setFormImagePreview(product.imageUrl || null);
    setFormImageUrl(product.imageUrl || '');
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormImage(file);
    setFormImageUrl('');
    const reader = new FileReader();
    reader.onload = ev => setFormImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value.trim();
    setFormImageUrl(url);
    setFormImage(null);
    setFormImagePreview(url || null);
  };

  const clearImage = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFormImage(null);
    setFormImagePreview(null);
    setFormImageUrl('');
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormImages(files);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', formName.trim());
    fd.append('price', formPrice);
    fd.append('weight', formWeight);
    fd.append('karat', formKarat);
    fd.append('description', formDescription.trim());
    fd.append('order', formOrder || '0');
    if (formImage) {
      fd.append('image', formImage);
    }
    fd.append('imageUrl', formImageUrl.trim());
    formImages.forEach(file => fd.append('images', file));
    return fd;
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formName || !formPrice || !formWeight) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (hasBackend) {
        await createProduct(buildFormData());
        toast.success('تم إضافة المنتج بنجاح');
      } else {
        const imageUrl = formImageUrl.trim() || formImagePreview || null;
        addProduct({
          name: formName.trim(),
          price: parseFloat(formPrice),
          weight: formWeight,
          karat: formKarat,
          description: formDescription || `${formName} ذهب عيار ${formKarat}`,
          imageUrl,
          images: null,
          order: formOrder ? parseInt(formOrder) : undefined,
        });
        toast.success('تم إضافة المنتج بنجاح');
      }
      setProducts(getProducts());
      resetForm();
      setShowAddForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في الإضافة');
    }
  };

  const handleEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingProduct || !formName || !formPrice || !formWeight) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      if (hasBackend) {
        await editProduct(editingProduct.id, buildFormData());
      } else if (!editingProduct.isDefault) {
        const newImageUrl = formImage ? formImagePreview : formImageUrl.trim() || editingProduct.imageUrl;
        updateProduct(editingProduct.id, {
          name: formName.trim(),
          price: parseFloat(formPrice),
          weight: formWeight,
          karat: formKarat,
          description: formDescription,
          imageUrl: newImageUrl || null,
          order: formOrder ? parseInt(formOrder) : editingProduct.order,
        });
      }
      toast.success('تم تحديث المنتج بنجاح');
      setProducts(getProducts());
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في التحديث');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      if (hasBackend) {
        await removeProduct(id);
      } else {
        if (defaultProducts.some(p => p.id === id)) {
          toast.error('لا يمكن حذف المنتجات الأساسية');
          return;
        }
        deleteProduct(id);
      }
      toast.success('تم حذف المنتج');
      setProducts(getProducts());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في الحذف');
    }
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const allProducts = getProducts();
    const idx = allProducts.findIndex(p => p.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= allProducts.length) return;

    const targetProduct = allProducts[targetIdx];

    if (hasBackend) {
      try {
        const currentOrder = allProducts[idx].order ?? idx;
        const targetOrder = targetProduct.order ?? targetIdx;
        await reorderProductApi(id, targetOrder);
        await reorderProductApi(targetProduct.id, currentOrder);
      } catch {
        toast.error('خطأ في ترتيب المنتج');
        return;
      }
    } else {
      reorderProduct(id, direction);
    }
    setProducts(getProducts());
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    if (!hasBackend) return;
    try {
      await updateOrderStatus(orderId, status);
      toast.success('تم تحديث حالة الطلب');
      loadOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'خطأ في تحديث الحالة');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const handleSaveMarqueeSettings = (text: string, enabled: boolean) => {
    const updated = { text, enabled };
    setMarqueeSettings(updated);
    try {
      localStorage.setItem('marquee_settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving marquee settings:', error);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 }).format(price) + ' ر.س';

  if (!isAuthenticated) return null;

  const productFormProps = {
    isOpen: showAddForm || Boolean(editingProduct),
    editingProduct,
    onClose: () => {
      setShowAddForm(false);
      setEditingProduct(null);
      resetForm();
    },
    onSubmit: editingProduct ? handleEdit : handleAdd,
    formName,
    formPrice,
    formWeight,
    formKarat,
    formDescription,
    formOrder,
    formImagePreview,
    formImageUrl,
    formImages,
    imageInputRef,
    imagesInputRef,
    setFormName,
    setFormPrice,
    setFormWeight,
    setFormKarat,
    setFormDescription,
    setFormOrder,
    onImageChange: handleImageChange,
    onImageUrlChange: handleImageUrlChange,
    onClearImage: clearImage,
    onImagesChange: handleImagesChange,
  };

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <div className="sticky top-0 z-50 bg-card border-b gold-border glass-dark">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-extrabold gold-text">لوحة التحكم</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">مرحباً، {admin?.username}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex gap-2 mb-8 border-b gold-border pb-2 overflow-x-auto">
          {[
            { key: 'products', label: 'المنتجات', icon: Package },
            { key: 'orders', label: 'الطلبات', icon: ShoppingBag },
            { key: 'stats', label: 'الإحصائيات', icon: BarChart2 },
            { key: 'settings', label: 'الإعدادات', icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap text-sm ${
                tab === key
                  ? 'gold-gradient text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'products' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProductsTab
                products={products}
                formatPrice={formatPrice}
                onAdd={() => {
                  setShowAddForm(true);
                  setEditingProduct(null);
                  resetForm();
                }}
                onEdit={product => {
                  setEditingProduct(product);
                  setShowAddForm(false);
                  populateForm(product);
                }}
                onDelete={handleDelete}
                onReorder={handleReorder}
                productFormProps={productFormProps}
              />
            </motion.div>
          )}

          {tab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <OrdersTab
                orders={orders}
                ordersLoading={ordersLoading}
                hasBackend={hasBackend}
                orderStatusFilter={orderStatusFilter}
                setOrderStatusFilter={setOrderStatusFilter}
                onRefresh={loadOrders}
                onStatusChange={handleStatusChange}
                formatPrice={formatPrice}
              />
            </motion.div>
          )}

          {tab === 'stats' && (
            <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StatsTab
                stats={stats}
                statsLoading={statsLoading}
                hasBackend={hasBackend}
                onRefresh={loadStats}
                formatPrice={formatPrice}
              />
            </motion.div>
          )}

          {tab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <MarqueeTab
                initialText={marqueeSettings.text}
                initialEnabled={marqueeSettings.enabled}
                onSave={handleSaveMarqueeSettings}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
