import Layout from '@/components/Layout';

const BusinessInfo = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-card rounded-xl border gold-border p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <img 
                src="/external/images/saudi_business_platform.png" 
                alt="المركز السعودي للأعمال" 
                onError={(e) => {
                  e.currentTarget.src = 'https://alfahd.shop/uploads/img%20(6).jpg';
                }}
                className="h-24 w-auto mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold gold-text mb-2">Certification</h1>
              <h2 className="text-xl font-semibold text-foreground mb-1">المركز السعودي للأعمال</h2>
              <p className="text-lg text-muted-foreground">Saudi Business Center</p>
            </div>

            {/* Verification Details */}
            <div className="space-y-6">
              <div className="border-t gold-border pt-6">
                <h3 className="text-lg font-bold gold-text mb-4">بيانات التوثيق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">رقم التوثيق</p>
                    <p className="font-semibold text-foreground">0000091863</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">رقم السجل التجاري</p>
                    <p className="font-semibold text-foreground">1010088875</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">رقم الوطني الموحد للمنشأة</p>
                    <p className="font-semibold text-foreground">7002149412</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">رقم الجوال</p>
                    <p className="font-semibold text-foreground">0594241060</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">تاريخ الإنشاء</p>
                    <p className="font-semibold text-foreground">2026/02/18</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">الحالة</p>
                    <p className="font-semibold text-green-500">نشط</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">تاريخ الانتهاء</p>
                    <p className="font-semibold text-foreground">2027/12/24</p>
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">نوع الوثيقة</p>
                    <p className="font-semibold text-foreground">سجل تجاري</p>
                  </div>
                </div>
              </div>

              {/* Business Activities */}
              <div className="border-t gold-border pt-6">
                <h3 className="text-lg font-bold gold-text mb-4">الأنشطة التجارية الموثقة</h3>
                <p className="text-foreground">
                  تجارة الذهب والأحجار الكريمة وخدمات تابي وتمارا
                </p>
              </div>

              {/* Bank Accounts */}
              <div className="border-t gold-border pt-6">
                <h3 className="text-lg font-bold gold-text mb-4">الحسابات البنكية</h3>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">رقم الآيبان</p>
                  <p className="font-semibold text-foreground font-mono">SA24 8000 0618 6080 1626 8678</p>
                </div>
              </div>

              {/* Store Information */}
              <div className="border-t gold-border pt-6">
                <h3 className="text-lg font-bold gold-text mb-4">معلومات المتجر</h3>
                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Jawhara Hussien Ibrahim Hussien</p>
                  <p className="text-foreground mb-2">مؤسسة حسين إبراهيم حسن للمجوهرات</p>
                  <p className="text-green-500 font-semibold">تم تفعيل نشاط المتجر</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t gold-border pt-6">
                <h3 className="text-lg font-bold gold-text mb-4">معلومات التواصل</h3>
                <div className="space-y-2">
                  <p className="text-foreground">
                    <span className="text-muted-foreground">البريد الإلكتروني: </span>
                    allysa hbn@gmail.com
                  </p>
                  <p className="text-foreground">
                    <span className="text-muted-foreground">رقم الجوال: </span>
                    0594241060
                  </p>
                </div>
              </div>

              {/* SDAIA */}
              <div className="border-t gold-border pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">تطوير الهيئة السعودية للبيانات والذكاء الاصطناعي</p>
                <div className="flex justify-center items-center gap-2">
                  <span className="text-lg font-bold text-foreground">SDAIA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BusinessInfo;
