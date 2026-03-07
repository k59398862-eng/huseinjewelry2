import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t" 
      style={{ 
        background: 'rgba(13, 22, 46, 0.96)', 
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(212, 175, 55, 0.3)'
      }}
    >
      <div className="flex items-center justify-center py-2 px-4">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 px-8 py-2 rounded-xl transition-all ${
            isActive('/') 
              ? 'bg-[#D4AF37]/20 text-[#D4AF37]' 
              : 'text-[#E6ECF8]/60 hover:text-[#E6ECF8]'
          }`}
        >
          <div className={`p-2 rounded-xl ${isActive('/') ? 'gold-gradient' : ''}`}>
            <Home className={`h-6 w-6 ${isActive('/') ? 'text-[#0B1020]' : ''}`} />
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNav;
