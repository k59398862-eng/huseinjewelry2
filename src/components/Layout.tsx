import Header from './Header';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';
import BottomNav from './BottomNav';

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background text-foreground font-cairo overflow-x-hidden w-full">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <FloatingWhatsApp />
    <BottomNav />
  </div>
);

export default Layout;
