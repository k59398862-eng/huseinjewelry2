import { AnimatePresence, motion } from 'framer-motion';
import { Image as ImageIcon, Save, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product } from '@/data/products';

export interface ProductFormProps {
  isOpen: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  formName: string;
  formPrice: string;
  formWeight: string;
  formKarat: string;
  formDescription: string;
  formOrder: string;
  formImagePreview: string | null;
  formImageUrl: string;
  formImages: File[];
  imageInputRef: React.RefObject<HTMLInputElement>;
  imagesInputRef: React.RefObject<HTMLInputElement>;
  setFormName: (value: string) => void;
  setFormPrice: (value: string) => void;
  setFormWeight: (value: string) => void;
  setFormKarat: (value: string) => void;
  setFormDescription: (value: string) => void;
  setFormOrder: (value: string) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: (event: React.MouseEvent) => void;
  onImagesChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductForm = ({
  isOpen,
  editingProduct,
  onClose,
  onSubmit,
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
  onImageChange,
  onImageUrlChange,
  onClearImage,
  onImagesChange,
}: ProductFormProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card rounded-2xl border gold-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-foreground">اسم المنتج *</Label>
                  <Input
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="مثال: سبيكة 10 جرام"
                    className="bg-secondary border-border text-foreground"
                    maxLength={200}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">السعر (ريال) *</Label>
                  <Input
                    type="number"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="15000"
                    className="bg-secondary border-border text-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">الوزن (جرام) *</Label>
                  <Input
                    value={formWeight}
                    onChange={e => setFormWeight(e.target.value)}
                    placeholder="10"
                    className="bg-secondary border-border text-foreground"
                    maxLength={20}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">العيار</Label>
                  <Input
                    value={formKarat}
                    onChange={e => setFormKarat(e.target.value)}
                    placeholder="24"
                    className="bg-secondary border-border text-foreground"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">ترتيب الظهور</Label>
                  <Input
                    type="number"
                    value={formOrder}
                    onChange={e => setFormOrder(e.target.value)}
                    placeholder="0"
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-foreground">الوصف</Label>
                  <Input
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="وصف المنتج (اختياري)"
                    className="bg-secondary border-border text-foreground"
                    maxLength={500}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">الصورة الرئيسية</Label>
                <div
                  className="border-2 border-dashed gold-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  {formImagePreview ? (
                    <div className="relative">
                      <img
                        src={formImagePreview}
                        alt="معاينة"
                        className="w-full h-32 object-contain rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={onClearImage}
                        className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-4">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">اضغط لرفع صورة</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WebP (حتى 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">أو رابط الصورة</Label>
                <Input
                  value={formImageUrl}
                  onChange={onImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-secondary border-border text-foreground"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">أدخل رابط URL للصورة بدلاً من رفع ملف</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">صور إضافية (حتى 5)</Label>
                <div
                  className="border-2 border-dashed border-border rounded-xl p-3 text-center cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => imagesInputRef.current?.click()}
                >
                  {formImages.length > 0 ? (
                    <p className="text-sm text-muted-foreground">{formImages.length} صورة مختارة</p>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">رفع صور إضافية</span>
                    </div>
                  )}
                </div>
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onImagesChange}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1 gold-gradient text-primary-foreground font-bold gap-1">
                  <Save className="h-4 w-4" />
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </Button>
                <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground">
                  إلغاء
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductForm;
