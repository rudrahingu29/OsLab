import React from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
