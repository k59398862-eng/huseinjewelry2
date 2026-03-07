import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Crown, ShoppingBag, Bell, LogOut } from 'lucide-react';
import { useEffect } from 'react';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const stats = [
    { label: 'إجمالي المبالغ', value: '0 ريال', icon: ShoppingBag },
    { label: 'غير مقروء', value: '0', icon: Bell },
    { label: 'عدد الطلبات', value: '0', icon: ShoppingBag },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Welcome Header */}
          <div className="bg-card rounded-2xl border gold-border p-8 mb-6 gold-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-foreground">أهلاً, {user.name}</h1>
                <p className="text-sm text-muted-foreground">{user.email} - عضو منذ {user.joinYear}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-900/30 text-green-400">
                    <Shield className="h-3 w-3" /> حساب موثق
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full gold-gradient text-primary-foreground">
                    <Crown className="h-3 w-3" /> VIP عميل
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">
                    لوحة تحكم حديثة
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {stats.map(stat => (
              <div key={stat.label} className="bg-card rounded-xl border gold-border p-5 text-center">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Account Info */}
          <div className="bg-card rounded-2xl border gold-border p-8 mb-6">
            <h2 className="text-lg font-bold gold-text mb-6">لوحة الحساب</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-secondary rounded-lg p-4">
                <span className="text-xs text-muted-foreground">الاسم</span>
                <p className="text-foreground font-medium mt-1">{user.name}</p>
              </div>
              <div className="bg-secondary rounded-lg p-4">
                <span className="text-xs text-muted-foreground">البريد الإلكتروني</span>
                <p className="text-foreground font-medium mt-1">{user.email}</p>
              </div>
              <div className="bg-secondary rounded-lg p-4">
                <span className="text-xs text-muted-foreground">رقم الهاتف</span>
                <p className="text-foreground font-medium mt-1">—</p>
              </div>
              <div className="bg-secondary rounded-lg p-4">
                <span className="text-xs text-muted-foreground">حالة الحساب</span>
                <p className="text-green-400 font-medium mt-1">نشط</p>
              </div>
            </div>
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
