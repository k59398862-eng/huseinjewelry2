import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminUser {
  id: number;
  username: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  login: (token: string, admin: AdminUser, remember: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

const getStoredAdmin = (): { token: string; admin: AdminUser } | null => {
  try {
    const tokenLS = localStorage.getItem('admin_token');
    const adminLS = localStorage.getItem('admin_user');
    if (tokenLS && adminLS) return { token: tokenLS, admin: JSON.parse(adminLS) };

    const tokenSS = sessionStorage.getItem('admin_token');
    const adminSS = sessionStorage.getItem('admin_user');
    if (tokenSS && adminSS) return { token: tokenSS, admin: JSON.parse(adminSS) };

    return null;
  } catch {
    return null;
  }
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const stored = getStoredAdmin();
  const [admin, setAdmin] = useState<AdminUser | null>(stored?.admin ?? null);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);

  const login = (newToken: string, newAdmin: AdminUser, remember: boolean) => {
    setAdmin(newAdmin);
    setToken(newToken);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('admin_token', newToken);
    storage.setItem('admin_user', JSON.stringify(newAdmin));
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, logout, isAuthenticated: !!admin && !!token }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
