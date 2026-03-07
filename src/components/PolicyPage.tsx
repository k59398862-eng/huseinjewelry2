import { ReactNode } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';

export interface PolicySection {
  title: string;
  content: ReactNode;
}

interface PolicyPageProps {
  title: string;
  intro: string;
  sections: PolicySection[];
}

const PolicyPage = ({ title, intro, sections }: PolicyPageProps) => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold gold-text mb-4">{title}</h1>
          <p className="text-muted-foreground leading-relaxed mb-8">{intro}</p>

          {/* Company Info */}
          <div className="bg-card rounded-xl border gold-border p-6 mb-8">
            <h3 className="text-sm font-bold text-primary mb-3">معلومات المؤسسة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
              <div>
                <span className="text-foreground/70">اسم المؤسسة:</span>
                <p>مؤسسة حسين إبراهيم حسين للمجوهرات</p>
              </div>
              <div>
                <span className="text-foreground/70">النشاط:</span>
                <p>بيع المجوهرات والمنتجات الفاخرة</p>
              </div>
              <div>
                <span className="text-foreground/70">بلد المنشأ:</span>
                <p>المملكة العربية السعودية</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <Accordion type="multiple" className="space-y-3">
            {sections.map((section, i) => (
              <AccordionItem key={i} value={`section-${i}`} className="bg-card rounded-xl border gold-border px-6 overflow-hidden">
                <AccordionTrigger className="text-foreground font-semibold hover:text-primary py-4">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {section.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PolicyPage;
