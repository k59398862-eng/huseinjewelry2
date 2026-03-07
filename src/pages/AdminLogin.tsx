import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { adminLogin } from '@/lib/api';

const AdminLogin = () => {
  const { isAuthenticated, login } = useAdminAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/admin', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLocalLogin = (u: string, p: string) => {
    const storedUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
    const storedPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    if (u === storedUsername && p === storedPassword) {
      login('local_admin_token', { id: 0, username: u }, remember);
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin', { replace: true });
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        const data = await adminLogin(username.trim(), password.trim());
        login(data.token, data.admin, remember);
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/admin', { replace: true });
      } else {
        if (!handleLocalLogin(username.trim(), password.trim())) {
          toast.error('اسم المستخدم أو كلمة المرور خاطئة');
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'خطأ في تسجيل الدخول';
      if (errMsg.includes('fetch') || errMsg.includes('network') || errMsg.includes('Failed')) {
        if (!handleLocalLogin(username.trim(), password.trim())) {
          toast.error('اسم المستخدم أو كلمة المرور خاطئة');
        }
      } else {
        toast.error(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full gold-gradient mx-auto mb-4 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold gold-text">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1 text-sm">تسجيل دخول المدير</p>
        </div>

        <div className="bg-card rounded-2xl border gold-border p-8 gold-shadow">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-foreground">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin"
                  className="bg-secondary border-border text-foreground pr-10"
                  maxLength={50}
                  autoComplete="username"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-secondary border-border text-foreground pr-10 pl-10"
                  maxLength={100}
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground">تذكرني</span>
            </label>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-5 font-bold gold-gradient text-primary-foreground"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  جارٍ تسجيل الدخول...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </span>
              )}
            </Button>
          </form>
        </div>

      </motion.div>
    </div>
    );
};

export default AdminLogin;
