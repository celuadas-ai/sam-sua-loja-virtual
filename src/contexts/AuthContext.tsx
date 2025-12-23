import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Operator, UserRole } from '@/types';
import { mockLogin } from '@/data/mockUsers';

interface AuthContextType {
  user: User | Operator | null;
  login: (emailOrPhone: string, password: string) => User | Operator | null;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | Operator | null>(null);

  const login = (emailOrPhone: string, _password: string): User | Operator | null => {
    const foundUser = mockLogin(emailOrPhone);
    if (foundUser) {
      setUser(foundUser);
    }
    return foundUser;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        userRole: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
