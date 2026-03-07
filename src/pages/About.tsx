import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Facebook } from 'lucide-react';

const About = () => (
  <Layout>
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-extrabold gold-text mb-4">من نحن</h1>

        <div className="bg-card rounded-xl border gold-border p-8 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">قصتنا</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            نحن متجر متخصص في تقديم أفضل المنتجات بأعلى جودة. نحرص على اختيار منتجاتنا بعناية لضمان رضا عملائنا.
          </p>

          <h2 className="text-xl font-bold text-foreground mb-4">معلومات المؤسسة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-muted-foreground mb-6">
            <div className="bg-secondary rounded-lg p-4">
              <span className="text-primary text-xs font-semibold">اسم المؤسسة</span>
              <p className="mt-1 text-foreground">مؤسسة حسين إبراهيم حسين للمجوهرات</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <span className="text-primary text-xs font-semibold">النشاط</span>
              <p className="mt-1 text-foreground">بيع المجوهرات والمنتجات الفاخرة</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <span className="text-primary text-xs font-semibold">بلد المنشأ</span>
              <p className="mt-1 text-foreground">المملكة العربية السعودية</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gold-gradient text-primary-foreground font-bold hover:opacity-90 transition-opacity"
          >
            <Facebook className="h-5 w-5" />
            تواصل معنا على فيسبوك
          </a>
        </div>

        {/* Payment */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-foreground mb-4">طرق الدفع</h3>
          <div className="flex flex-wrap gap-2">
            {['Visa', 'Mastercard', 'مدى', 'Apple Pay', 'STC Pay', 'تحويل بنكي'].map(m => (
              <span key={m} className="px-4 py-2 rounded-lg bg-card border gold-border text-muted-foreground text-sm">{m}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default About;
