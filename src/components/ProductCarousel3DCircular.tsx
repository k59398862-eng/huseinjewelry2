import { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getProducts, type Product } from '@/data/products';
import { postCheckoutEvent } from '@/lib/api';
import { getCheckoutSessionId } from '@/lib/checkoutSession';

const CARD_WIDTH = 220;
const CARD_HEIGHT = 320;

interface CarouselCardProps {
  product: Product;
  isCenter: boolean;
  style?: React.CSSProperties;
}

const CarouselCard = ({ product, isCenter, style }: CarouselCardProps) => {
  const { user } = useAuth();

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price) + ' ر.س';

  const handleBuyNow = () => {
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
    }).catch(() => {});
  };

  return (
    <div
      className="relative rounded-xl border overflow-hidden flex-shrink-0"
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        background: '#0F172A',
        borderColor: isCenter ? 'rgba(212, 175, 55, 0.7)' : 'rgba(212, 175, 55, 0.25)',
        boxShadow: isCenter
          ? '0 0 40px rgba(212, 175, 55, 0.35), 0 8px 30px rgba(0,0,0,0.5)'
          : '0 4px 20px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      <div
        className="h-1"
        style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #F6E27A 100%)' }}
      />

      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          height: `${CARD_HEIGHT - 108}px`,
        }}
      >
        {isCenter && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(212,175,55,0.08) 0%, transparent 70%)',
            }}
          />
        )}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4"
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
                  borderColor: 'rgba(212, 175, 55, 0.3)',
                }}
              >
                <span className="font-bold text-xl" style={{ color: '#D4AF37' }}>
                  {product.karat}K
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-2.5 text-center">
        <h3 className="font-bold mb-1 line-clamp-1 text-xs" style={{ color: '#E6ECF8' }}>
          {product.name}
        </h3>

        <div className="font-extrabold mb-2" style={{ fontSize: '0.9rem', color: '#D4AF37' }}>
          {formattedPrice}
        </div>

        <Link
          to={user ? `/checkout/${product.id}` : `/login?redirect=/checkout/${product.id}`}
          onClick={handleBuyNow}
          className="block w-full text-center py-1.5 rounded-lg font-bold text-xs transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #F6E27A 0%, #FFD700 40%, #D4AF37 100%)',
            color: '#0B1020',
          }}
        >
          اشترِ الآن
        </Link>
      </div>
    </div>
  );
};

const ProductCarousel3DCircular = () => {
  const products = getProducts();
  const count = products.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || count === 0) return;
    setIsAnimating(true);
    setCurrentIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [isAnimating, count]);

  const nextSlide = useCallback(() => {
    if (isAnimating || count === 0) return;
    const nextIndex = (currentIndex + 1) % count;
    goToSlide(nextIndex);
  }, [isAnimating, count, currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    if (isAnimating || count === 0) return;
    const prevIndex = (currentIndex - 1 + count) % count;
    goToSlide(prevIndex);
  }, [isAnimating, count, currentIndex, goToSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartTime.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const dx = touchEndX - touchStartX.current;
    const dt = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dx) / dt;

    if (Math.abs(dx) > 50 || velocity > 0.3) {
      if (dx < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartTime.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (count === 0) return null;

  const getCardStyle = (index: number): React.CSSProperties => {
    const diff = index - currentIndex;
    const normalizedDiff = ((diff % count) + count) % count;

    // Show 3 cards: left, center, right
    let style: React.CSSProperties;
    let isCenter = false;
    const scale = 1;

    if (normalizedDiff === 0) {
      // Center card - front and clear
      isCenter = true;
      style = {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%) rotateY(0deg) scale(1)',
        opacity: 1,
        zIndex: 30,
        transition: 'all 0.5s ease-out',
      };
    } else if (normalizedDiff === 1 || normalizedDiff === -(count - 1)) {
      // Right card - tilted to the right
      isCenter = false;
      style = {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%) translateX(190px) rotateY(25deg) scale(0.85)',
        opacity: 0.8,
        zIndex: 20,
        transition: 'all 0.5s ease-out',
      };
    } else if (normalizedDiff === count - 1 || normalizedDiff === -1) {
      // Left card - tilted to the left
      isCenter = false;
      style = {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%) translateX(-190px) rotateY(-25deg) scale(0.85)',
        opacity: 0.8,
        zIndex: 20,
        transition: 'all 0.5s ease-out',
      };
    } else {
      // Hidden cards
      style = {
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        opacity: 0,
        zIndex: 10,
        pointerEvents: 'none',
        transition: 'all 0.5s ease-out',
      };
    }

    return { ...style, scale };
  };

  return (
    <section
      className="py-6"
      role="region"
      aria-roledescription="carousel"
      aria-label="سبائك الذهب المتاحة"
    >
      <div className="text-center mb-4 px-4">
        <h2 className="text-2xl font-extrabold gold-text mb-1">سبائك الذهب المتاحة</h2>
        <div className="w-16 h-0.5 gold-gradient mx-auto rounded-full" />
      </div>

      <div
        ref={containerRef}
        className="relative select-none"
        style={{
          height: `${CARD_HEIGHT + 20}px`,
          perspective: '1200px',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspectiveOrigin: 'center center' }}
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: `${CARD_WIDTH + 400}px`,
              height: `${CARD_HEIGHT}px`,
              transformStyle: 'preserve-3d',
            }}
          >
            {products.map((product, index) => {
              const cardStyle = getCardStyle(index);
              const isCenter = cardStyle.zIndex === 30;

              if (cardStyle.opacity === 0) return null;

              const { scale, ...styleWithoutScale } = cardStyle;

              return (
                <div
                  key={product.id}
                  aria-hidden={!isCenter}
                  style={styleWithoutScale}
                >
                  <CarouselCard product={product} isCenter={isCenter} style={{ transform: `scale(${scale})` }} />
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="flex justify-center items-center gap-4 mt-4 flex-wrap px-4">
        <button
          onClick={prevSlide}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #F6E27A 0%, #FFD700 40%, #D4AF37 100%)',
            color: '#0B1020',
          }}
          aria-label="السابق"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="flex gap-2 flex-wrap justify-center">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              disabled={isAnimating}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-8 gold-gradient' : 'w-2 bg-[#D4AF37]/30 hover:bg-[#D4AF37]/50'
              }`}
              aria-label={`المنتج ${i + 1}`}
              aria-current={i === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={isAnimating}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #F6E27A 0%, #FFD700 40%, #D4AF37 100%)',
            color: '#0B1020',
          }}
          aria-label="التالي"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="text-center mt-2">
        <span className="text-sm text-[#E6ECF8]/60">
          {currentIndex + 1} / {count}
        </span>
      </div>
    </section>
  );
};

export default ProductCarousel3DCircular;
