import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { getProducts } from '@/data/products';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { postCheckoutEvent } from '@/lib/api';
import { getCheckoutSessionId } from '@/lib/checkoutSession';

const ProductDetail = () => {
  const { id } = useParams();
  const products = getProducts();
  const product = products.find(p => p.id === Number(id));
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المنتج غير موجود</h1>
          <Link to="/" className="text-primary hover:underline">العودة للرئيسية</Link>
        </div>
      </Layout>
    );
  }

  const additionalImages: string[] = (() => {
    try { return product.images ? JSON.parse(product.images) : []; }
    catch { return []; }
  })();

  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...additionalImages,
  ];

  const prevImg = () => setActiveImg(i => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setActiveImg(i => (i + 1) % allImages.length);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price) + ' ر.س';

  const handleBuyNow = () => {
    // Send product selection event to Telegram (fire-and-forget)
    const sessionId = getCheckoutSessionId();
    postCheckoutEvent({
      sessionId,
      eventType: 'product_selected',
      userName: user?.name,
      userEmail: user?.email,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      timestamp: new Date().toISOString(),
    }).catch(() => {
      // Silently ignore errors - don't block navigation
    });

    navigate(`/checkout/${product.id}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-8">
            <ArrowRight className="h-4 w-4" />
            العودة للمنتجات
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              {/* Main Image */}
              <div className="relative bg-secondary rounded-2xl overflow-hidden mb-3 h-[200px] md:h-[400px]">
                {allImages.length > 0 ? (
                  <>
                    <motion.img
                      key={activeImg}
                      src={allImages[activeImg]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImg}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={nextImg}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <div className="w-24 h-24 rounded-full gold-gradient border-2 border-primary/30 flex items-center justify-center">
                      <span className="text-primary-foreground font-extrabold text-2xl">{product.karat}K</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImg === i ? 'border-primary' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-card rounded-2xl border gold-border p-4 md:p-6 gold-shadow flex flex-col">
              <div className="h-1 gold-gradient rounded-full mb-5" />

              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-[9px] md:text-xs rounded-full gold-gradient text-primary-foreground font-semibold">
                  عيار {product.karat}
                </span>
                <span className="text-[11px] md:text-sm text-muted-foreground">{product.weight} جرام</span>
              </div>

              <h1 className="text-base md:text-2xl font-extrabold text-foreground mb-3">{product.name}</h1>
              <p className="text-[13px] md:text-base text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

              <div className="mb-4">
                <span className="text-xl md:text-4xl font-extrabold gold-text">{formattedPrice}</span>
              </div>

              <div className="mt-auto">
                {user ? (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-4 rounded-xl gold-gradient text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    اشترِ الآن
                  </button>
                ) : (
                  <Link
                    to={`/login?redirect=/checkout/${product.id}`}
                    className="block w-full py-4 rounded-xl gold-gradient text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity text-center"
                  >
                    سجل دخول للشراء
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
