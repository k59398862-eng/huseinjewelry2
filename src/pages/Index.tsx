import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCarousel3DCircular from '@/components/ProductCarousel3DCircular';
import { useMarqueeSettings } from '@/hooks/useMarqueeSettings';
import { Star, ShieldCheck, Award, Truck, Clock, Quote } from 'lucide-react';

// Hero Slider Images
const heroImages = [
  { id: 1, src: '/logo2.jpg', alt: 'سبيكة ذهب 24 قيراط' },
  { id: 2, src: '/logo2.jpg', alt: 'أفضل أسعار الذهب' },
  { id: 3, src: '/logo2.jpg', alt: 'عروض خاصة' },
];

const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="px-4 pt-4 pb-2">
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(212, 175, 55, 0.2)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="relative h-[200px]"
          >
            {/* Note: Optimal banner image dimensions should be 490x200 (width x height) for best display. Current images (logo2.jpg) are 1080x636. */}
            <img
              src={heroImages[currentIndex].src}
              alt={heroImages[currentIndex].alt}
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0"
              style={{ 
                background: 'linear-gradient(to top, rgba(11, 16, 32, 0.9) 0%, rgba(11, 16, 32, 0) 50%)' 
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'w-8 gold-gradient' 
                  : 'bg-white/40'
              }`}
              aria-label={`الانتقال إلى الشريحة ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Moving Text (Marquee)
const MovingText = ({ text, enabled }: { text: string; enabled: boolean }) => {
  if (!enabled) return null;

  return (
    <section
      className="py-3 my-2"
      style={{ background: '#0B1020' }}
    >
      <div className="marquee-container">
        <div className="marquee-content">
          <span className="text-lg font-bold" style={{
            background: 'linear-gradient(90deg, #D4AF37, #FFD700, #F6E27A, #D4AF37)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer 3s linear infinite'
          }}>
            {text}{text}
          </span>
        </div>
      </div>
    </section>
  );
};

// 3D Circular Carousel Component - Google Earth style rotation
// Uses the ProductCarousel3DCircular component for 3D circular carousel

// Features Section
const features = [
  { icon: ShieldCheck, label: 'ضمان الجودة', sub: 'ذهب خالص معتمد' },
  { icon: Award, label: 'عيار 24 قيراط', sub: 'أعلى نقاء' },
  { icon: Truck, label: 'توصيل سريع', sub: 'لجميع المناطق' },
  { icon: Clock, label: 'خدمة 24/7', sub: 'دعم متواصل' },
];

const Features = () => (
  <section 
    className="px-4 py-6 border-y"
    style={{ 
      borderColor: 'rgba(212, 175, 55, 0.2)',
      background: 'rgba(15, 23, 42, 0.5)'
    }}
  >
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {features.map(({ icon: Icon, label, sub }) => (
        <div key={label} className="flex flex-col items-center text-center gap-2">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #F6E27A 100%)' }}
          >
            <Icon className="h-6 w-6 text-[#0B1020]" />
          </div>
          <span className="text-sm font-bold text-[#E6ECF8]">{label}</span>
          <span className="text-xs text-[#E6ECF8]/60">{sub}</span>
        </div>
      ))}
    </div>
  </section>
);

// Testimonials
const staticReviews = [
  {
    name: 'سارة الأحمدي',
    city: 'الرياض',
    rating: 5,
    text: 'تجربة ممتازة! المنتج أصلي والتوصيل سريع جداً. سأتسوق مجدداً بكل تأكيد.',
    date: 'منذ أسبوع',
    avatar: 'س',
  },
  {
    name: 'نورة المطيري',
    city: 'جدة',
    rating: 5,
    text: 'سبيكة الذهب وصلت بحالة ممتازة مع شهادة الجودة. خدمة العملاء محترفة ومتجاوبة.',
    date: 'منذ أسبوعين',
    avatar: 'ن',
  },
  {
    name: 'منى الغامدي',
    city: 'الدمام',
    rating: 5,
    text: 'أفضل متجر للذهب في المملكة! الأسعار تنافسية والجودة عالية جداً.',
    date: 'منذ شهر',
    avatar: 'م',
  },
  {
    name: 'هند العتيبي',
    city: 'مكة المكرمة',
    rating: 5,
    text: 'اشتريت سبيكة هدية لوالدي وكان سعيداً جداً. التغليف أنيق والمنتج أصلي 100%.',
    date: 'منذ شهر',
    avatar: 'ه',
  },
  {
    name: 'رنا الشهري',
    city: 'أبها',
    rating: 5,
    text: 'خدمة استثنائية وسرعة في التوصيل. المنتج مطابق تماماً للوصف. شكراً!',
    date: 'منذ شهرين',
    avatar: 'ر',
  },
  {
    name: 'أميرة القحطاني',
    city: 'الطائف',
    rating: 5,
    text: 'تعاملت معهم أكثر من مرة ودائماً راضية. الذهب أصلي والسعر مناسب.',
    date: 'منذ شهرين',
    avatar: 'أ',
  },
];

const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < count ? 'text-yellow-400 fill-yellow-400' : 'text-[#E6ECF8]/30'}`}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % staticReviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || reviewRating === 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setReviewComment('');
      setReviewRating(0);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const StarDisplay = () => (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => setReviewRating(i + 1)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${i < reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <section
      className="px-4 py-8 border-t"
      style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-extrabold gold-text mb-1">آراء عملائنا</h2>
        <div className="w-12 h-0.5 gold-gradient mx-auto rounded-full" />
        <p className="text-sm text-[#E6ECF8]/60 mt-2">ماذا يقول عملاؤنا الكرام</p>
      </div>

      {/* Fake Review Form */}
      <div
        className="max-w-md mx-auto mb-8 rounded-xl p-5"
        style={{
          background: '#0F172A',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <h3 className="text-lg font-bold text-[#E6ECF8] mb-4 text-center">أضف تقييمك</h3>

        {showSuccess ? (
          <div className="text-center py-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(34, 197, 94, 0.2)' }}
            >
              <Star className="h-8 w-8 text-green-500 fill-green-500" />
            </div>
            <p className="text-[#E6ECF8] font-bold">شكراً لك!</p>
            <p className="text-sm text-[#E6ECF8]/60">تم إرسال تقييمك بنجاح</p>
          </div>
        ) : (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            {/* Comment field first */}
            <div>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="اكتب رأيك هنا"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-right placeholder:text-[#E6ECF8]/30 resize-none"
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  color: '#E6ECF8'
                }}
                required
              />
            </div>

            {/* Rating stars */}
            <div>
              <StarDisplay />
            </div>

            <div className="flex justify-start">
              <button
                type="submit"
                disabled={isSubmitting || reviewRating === 0 || !reviewComment.trim()}
                className="px-4 py-1.5 rounded-lg font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(90deg, #d4af37, #f4e4ba, #d4af37)',
                  backgroundSize: '200% auto',
                  color: '#0B1020'
                }}
              >
                {isSubmitting ? 'جاري الإرسال...' : 'حفظ التعليق'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Auto Slider */}
      <div className="relative max-w-md mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentReview}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-5"
            style={{ 
              background: '#0F172A',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-[#0B1020] font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #F6E27A 100%)' }}
              >
                {staticReviews[currentReview].avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#E6ECF8]">{staticReviews[currentReview].name}</p>
                <p className="text-xs text-[#E6ECF8]/60">{staticReviews[currentReview].city} · {staticReviews[currentReview].date}</p>
              </div>
              <Quote className="h-5 w-5 text-[#D4AF37]/50" />
            </div>
            
            <StarRating count={staticReviews[currentReview].rating} />
            
            <p className="text-sm text-[#E6ECF8]/80 mt-3 leading-relaxed">
              {staticReviews[currentReview].text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {staticReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentReview(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentReview 
                  ? 'w-8 gold-gradient' 
                  : 'bg-[#D4AF37]/30'
              }`}
              aria-label={`الانتقال إلى الرأي ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Payment Methods
const paymentLogos = [
  { name: 'طريقة دفع 1', img: 'https://checkout.tamara.center/pay/pay1.jpg' },
  { name: 'طريقة دفع 2', img: 'https://checkout.tamara.center/pay/pay2.jpg' },
  { name: 'طريقة دفع 3', img: 'https://checkout.tamara.center/pay/pay3.jpg' },
  { name: 'طريقة دفع 4', img: 'https://checkout.tamara.center/pay/pay4.jpg' },
  { name: 'طريقة دفع 5', img: 'https://checkout.tamara.center/pay/pay5.jpg' },
  { name: 'طريقة دفع 6', img: 'https://checkout.tamara.center/pay/pay6.jpg' },
  { name: 'طريقة دفع 7', img: 'https://checkout.tamara.center/pay/pay12.jpg' },
  { name: 'طريقة دفع 8', img: 'https://checkout.tamara.center/pay/pay11.jpg' },
  { name: 'طريقة دفع 9', img: 'https://checkout.tamara.center/pay/pay9.jpg' },
  { name: 'طريقة دفع 10', img: 'https://checkout.tamara.center/pay/pay8.jpg' },
];

const PaymentMethods = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    const scrollContainer = scrollRef.current;
    let scrollAmount = 0;
    
    const scroll = () => {
      scrollAmount += 1;
      if (scrollContainer.scrollWidth / 2 <= scrollAmount) {
        scrollAmount = 0;
      }
      scrollContainer.scrollLeft = scrollAmount;
    };
    
    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="px-4 py-8 border-t"
      style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}
    >
      <h3 className="text-xl font-bold gold-text mb-2 text-center">طرق دفع آمنة</h3>
      <div className="w-12 h-0.5 gold-gradient mx-auto rounded-full mb-6" />
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden scrollbar-hide"
        style={{ maxWidth: '100%' }}
      >
        {[...paymentLogos, ...paymentLogos].map((p, i) => (
          <div
            key={`${p.name}-${i}`}
            className="flex-shrink-0 w-24 h-14 rounded-xl flex items-center justify-center"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)' 
            }}
          >
            <img 
              src={p.img} 
              alt={p.name} 
              className="h-9 w-auto object-contain" 
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

// Floating Background Elements
const FloatingElements = () => (
  <>
    <div 
      className="fixed rounded-full pointer-events-none float-animation"
      style={{
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0) 70%)',
        top: '10%',
        right: '0px',
        zIndex: 0,
      }}
    />
    <div 
      className="fixed rounded-full pointer-events-none float-animation-delayed"
      style={{
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0) 70%)',
        bottom: '20%',
        left: '0px',
        zIndex: 0,
      }}
    />
    <div 
      className="fixed rounded-full pointer-events-none float-animation-slow"
      style={{
        width: '150px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0) 70%)',
        top: '50%',
        left: '10%',
        zIndex: 0,
      }}
    />
  </>
);

// Main Index Component
const Index = () => {
  const { settings: marqueeSettings, isLoaded: marqueeLoaded } = useMarqueeSettings();

  if (!marqueeLoaded) {
    return null; // Prevent flash while loading settings
  }

  return (
    <Layout>
      <div className="relative overflow-x-hidden w-full">
        <FloatingElements />

        <HeroSlider />
        <ProductCarousel3DCircular />
        <MovingText text={marqueeSettings.text} enabled={marqueeSettings.enabled} />
        <Features />
        <Testimonials />
        <PaymentMethods />

        {/* Bottom spacing for mobile bottom nav */}
        <div className="h-20 md:h-0" />
      </div>
    </Layout>
  );
};

export default Index;
