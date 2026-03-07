import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'من نحن', path: '/about' },
  { label: 'الشروط والأحكام', path: '/terms' },
  { label: 'سياسة الخصوصية', path: '/privacy' },
  { label: 'سياسة الاسترجاع والاستبدال', path: '/returns' },
  { label: 'طريقة معرفة مقاس الخاتم', path: '/ring-size' },
  { label: 'الأحكام الشرعية', path: '/shariah' },
  { label: 'شروط التوصيل', path: '/delivery' },
];

const Footer = () => {
  return (
    <footer
      className="border-t"
      style={{
        background: '#0B1020',
        borderColor: 'rgba(212, 175, 55, 0.2)'
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Company Info Card with Gold Gradient */}
        <div
          className="rounded-2xl p-6 mb-4"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #F6E27A 100%)',
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/se3ar.png"
              alt="مؤسسة حسين إبراهيم حسين"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Company Name - repeated twice */}
          <h3 className="text-lg font-bold text-[#0B1020] text-center mb-1">
            مؤسسة حسين إبراهيم حسين للمجوهرات و للذهب
          </h3>
          <h3 className="text-lg font-bold text-[#0B1020] text-center mb-3">
            مؤسسة حسين إبراهيم حسين للمجوهرات و للذهب
          </h3>

          {/* Description */}
          <p className="text-sm text-[#0B1020]/80 text-center leading-relaxed">
            متجر متخصص في قطع الذهب المميزة والنادرة
          </p>
          <p className="text-sm text-[#0B1020]/80 text-center leading-relaxed mt-1">
            نسعى لإرضاء عملائنا ولتصبح الخيار الأول في عالم الذهب والمجوهرات.
          </p>
        </div>

        {/* Important Links Section */}
        <div className="mb-6">
          <h4 className="text-lg font-bold text-[#E6ECF8] text-center mb-2">
            روابط مهمة
          </h4>
          <div className="w-16 h-1 mx-auto rounded-full mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)' }} />

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-3">
            {footerLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm text-[#E6ECF8] hover:text-[#D4AF37] transition-colors text-right py-2 px-3 rounded-lg hover:bg-[#D4AF37]/10"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Zakat and Income Badge */}
        <div className="flex justify-center mb-6">
          <a
            href="https://zatca.gov.sa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl theme-card-bg border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors"
            style={{ background: '#0F172A' }}
          >
            <img
              src="/external/images/commercial_reg.png"
              alt="ضريبة القيمة المضافة"
              onError={(e) => {
                e.currentTarget.src = 'https://altmiz.shop/uploads/acac.png';
              }}
              className="h-14 w-auto object-contain"
            />
          </a>
        </div>

        {/* Commercial Registration & Verified */}
        <div className="flex flex-col gap-3 mb-6">
          <a
            href="https://mc.gov.sa/ar/eservices/Pages/Commercial-data.aspx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl theme-card-bg border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors text-right"
            style={{ background: '#0F172A' }}
          >
            <img
              src="/external/images/commercial_reg.png"
              alt="السجل التجاري"
              onError={(e) => {
                e.currentTarget.src = 'https://altmiz.shop/uploads/acac.png';
              }}
              className="h-10 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-bold text-[#E6ECF8]">السجل التجاري</p>
              <p className="text-xs text-[#D4AF37]">1010088875</p>
            </div>
          </a>
          
          <Link
            to="/business-info"
            className="flex items-center gap-3 p-3 rounded-xl theme-card-bg border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-colors text-right"
            style={{ background: '#0F172A' }}
          >
            <img
              src="/external/images/saudi_business_platform.png"
              alt="منصة الأعمال السعودية"
              onError={(e) => {
                e.currentTarget.src = 'https://alfahd.shop/uploads/img%20(6).jpg';
              }}
              className="h-10 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-bold text-[#E6ECF8]">مركز الأعمال السعودية</p>
              <p className="text-xs text-[#D4AF37]">مسجل وموثق</p>
            </div>
          </Link>
        </div>

        {/* Copyright */}
        <div
          className="border-t pt-5"
          style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}
        >
          <p className="text-xs text-[#E6ECF8]/60 text-center">
            © {new Date().getFullYear()} مؤسسة حسين إبراهيم حسين. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
