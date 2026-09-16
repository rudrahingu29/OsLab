import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../../../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check current authentication state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('oslab_token');
      const savedUser = localStorage.getItem('oslab_user');

      if (token && savedUser) {
        try {
          // Pre-set from cache to avoid flicker
          setUser(JSON.parse(savedUser));
          
          // Verify with server
          const response = await api.get('/auth/me');
          const userData = {
            id: response.data._id || response.data.id,
            name: response.data.name,
            email: response.data.email
          };
          setUser(userData);
          localStorage.setItem('oslab_user', JSON.stringify(userData));
        } catch (_error) {
          // Token expired or invalid
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: userData, token } = response.data;
    
    localStorage.setItem('oslab_token', token);
    localStorage.setItem('oslab_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    const { user: userData, token } = response.data;
    
    localStorage.setItem('oslab_token', token);
    localStorage.setItem('oslab_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('oslab_token');
    localStorage.removeItem('oslab_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
export default AuthContext;
