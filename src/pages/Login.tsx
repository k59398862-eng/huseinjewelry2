import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error('يرجى إدخال الاسم والبريد الإلكتروني');
      return;
    }
    login(name.trim(), email.trim());
    toast.success(`أهلاً بك، ${name}!`);
    navigate(redirect);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-card rounded-2xl border gold-border p-8 gold-shadow">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold gold-text mb-2">تسجيل الدخول</h1>
              <p className="text-sm text-muted-foreground">أدخل بياناتك للمتابعة</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">الاسم</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  className="bg-secondary border-border focus:border-primary text-foreground"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="bg-secondary border-border focus:border-primary text-foreground"
                  required
                  maxLength={255}
                />
              </div>

              <Button type="submit" className="w-full gold-gradient text-primary-foreground font-bold py-3 text-base">
                دخول
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
