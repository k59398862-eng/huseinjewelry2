import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, ImageIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getProducts, type Product } from '@/data/products';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' ر.س';
};

const Header = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  return (
    <header 
      className="sticky top-0 z-50 theme-nav-bg border-b"
      style={{ 
        borderBottomLeftRadius: '22px', 
        borderBottomRightRadius: '22px',
        borderColor: 'rgba(212, 175, 55, 0.3)'
      }}
    >
      <div className="container mx-auto px-4" style={{ height: '130px' }}>
        <div className="flex items-center justify-between h-full">
          {/* Menu Icon - Right */}
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#E6ECF8] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 w-[48px] h-[48px]"
                >
                  {open ? <X className="h-[37px] w-[37px]" /> : <Menu className="h-[37px] w-[37px]" />}
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="theme-card-bg border-[#D4AF37]/30 p-0"
                style={{ background: '#0F172A' }}
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-[#D4AF37]/20">
                    <h2 className="text-lg font-bold gold-text">المنتجات</h2>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                      {products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 p-4 border-b border-[#D4AF37]/10 hover:bg-[#D4AF37]/5 transition-colors"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#1E293B] flex-shrink-0">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-[#D4AF37]/50" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-[#E6ECF8] truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm gold-text font-bold mt-0.5">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t border-[#D4AF37]/20">
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="block w-full text-center py-2.5 rounded-lg gold-gradient text-[#0B1020] font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      لوحة التحكم
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - Center */}
          <Link to="/" className="flex flex-col items-center gap-1">
            <img
              src="/se3ar.png"
              alt="مؤسسة حسين إبراهيم Hussein Ibrahim Gold Jewelry"
              className="w-[180px] h-auto object-contain"
              style={{ maxHeight: '80px' }}
            />
          </Link>

          {/* Profile Icon - Left */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#D4AF37] hover:bg-[#D4AF37]/10 w-[48px] h-[48px]"
                >
                  <User className="h-[29px] w-[29px]" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#E6ECF8] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 w-[48px] h-[48px]"
                >
                  <User className="h-[29px] w-[29px]" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
