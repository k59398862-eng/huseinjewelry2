import { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  joinYear: string;
}

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('jewelry_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (name: string, email: string) => {
    const u: User = { name, email, joinYear: new Date().getFullYear().toString() };
    setUser(u);
    localStorage.setItem('jewelry_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jewelry_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
