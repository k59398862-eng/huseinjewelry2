import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ImageIcon, Heart } from 'lucide-react';
import type { Product } from '@/data/products';
import { postCheckoutEvent } from '@/lib/api';
import { getCheckoutSessionId } from '@/lib/checkoutSession';
import InstallmentBadge, { getInstallmentPackage } from './InstallmentBadge';

const ProductCard = ({ product }: { product: Product }) => {
  const { user } = useAuth();
  const [isWished, setIsWished] = useState(false);
  const hasInstallments = getInstallmentPackage(product.price) !== null;

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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg"
      style={{ 
        background: '#0F172A',
        borderColor: 'rgba(212, 175, 55, 0.3)',
        width: '265px'
      }}
    >
      <div 
        className="h-1"
        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #F6E27A 100%)' }}
      />

      {/* Product Image */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          height: '140px'
        }}
      >
        {/* Wish Button */}
        <button
          onClick={() => setIsWished(!isWished)}
          className="absolute top-2 right-2 z-10 rounded-full p-2 transition-all hover:scale-110"
          style={{ 
            background: 'rgba(255, 255, 255, 0.9)',
          }}
          aria-label="إضافة للمفضلة"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${isWished ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>

        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-[#D4AF37]/30 mx-auto mb-2" />
              <div 
                className="w-16 h-16 rounded-full border mx-auto flex items-center justify-center"
                style={{ 
                  background: 'rgba(212, 175, 55, 0.1)',
                  borderColor: 'rgba(212, 175, 55, 0.3)'
                }}
              >
                <span className="font-bold text-xl" style={{ color: '#D4AF37' }}>{product.karat}K</span>
              </div>
            </div>
          </div>
        )}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ 
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 50%)' 
          }}
        />
      </div>

      <div className="p-3 text-center">
        <h3
          className="font-bold mb-1 group-hover:text-[#D4AF37] transition-colors line-clamp-1"
          style={{ color: '#E6ECF8' }}
        >
          {product.name}
        </h3>

        <div
          className="font-extrabold mb-2"
          style={{
            fontSize: '1.125rem',
            color: '#D4AF37'
          }}
        >
          {formattedPrice}
        </div>

        <Link
          to={user ? `/checkout/${product.id}` : `/login?redirect=/checkout/${product.id}`}
          onClick={handleBuyNow}
          className="block w-full text-center py-2.5 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
          style={{
            background: 'linear-gradient(90deg, #d4af37, #f4e4ba, #d4af37)',
            backgroundSize: '200% auto',
            color: '#0B1020'
          }}
        >
          اشترِ الآن
        </Link>
      </div>
    </motion.div>
  );
};

export default ProductCard;
