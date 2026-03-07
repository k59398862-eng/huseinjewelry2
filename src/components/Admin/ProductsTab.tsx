import { ArrowDown, ArrowUp, Edit2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/data/products';
import ProductForm, { type ProductFormProps } from './ProductForm';

interface ProductsTabProps {
  products: Product[];
  formatPrice: (price: number) => string;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onReorder: (id: number, direction: 'up' | 'down') => void;
  productFormProps: ProductFormProps;
}

const ProductsTab = ({
  products,
  formatPrice,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  productFormProps,
}: ProductsTabProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">إدارة المنتجات ({products.length})</h2>
        <Button onClick={onAdd} className="gold-gradient text-primary-foreground font-bold gap-1">
          <Plus className="h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      <ProductForm {...productFormProps} />

      <div className="bg-card rounded-2xl border gold-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b gold-border bg-secondary/50">
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">الترتيب</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">الصورة</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">المنتج</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">السعر</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">الوزن</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">العيار</th>
                <th className="text-right p-4 text-sm font-semibold text-muted-foreground">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product.id} className="border-b gold-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onReorder(product.id, 'up')}
                        disabled={idx === 0}
                        className="text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onReorder(product.id, 'down')}
                        disabled={idx === products.length - 1}
                        className="text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                  </td>
                  <td className="p-4 text-muted-foreground text-sm">{product.weight} جرام</td>
                  <td className="p-4 text-muted-foreground text-sm">{product.karat}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(product)}
                        className="text-primary hover:bg-primary/10 h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      {!product.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(product.id)}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsTab;
