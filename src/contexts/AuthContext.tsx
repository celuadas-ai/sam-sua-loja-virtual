import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithPhone: (phone: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, name: string, phone: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ error: string | null }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ valid: boolean; error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    return (data?.role as UserRole) || 'customer';
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id).then(setUserRole);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(role => {
          setUserRole(role);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const loginWithPhone = async (phone: string, password: string): Promise<{ error: string | null }> => {
    // Use edge function (service role) to find email by phone - bypasses RLS
    const { data: fnData, error: fnError } = await supabase.functions.invoke('get-email-by-phone', {
      body: { phone },
    });

    if (fnError || !fnData?.email) {
      return { error: 'Não foi possível encontrar a conta associada a este número' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email: fnData.email, password });
    return { error: error?.message || null };
  };

  const translateAuthError = (error: string): string => {
    if (error.includes('already registered') || error.includes('already been registered')) {
      return 'Este email já está registado. Tente iniciar sessão ou use outro email.';
    }
    if (error.includes('Password should be at least')) {
      const match = error.match(/at least (\d+)/);
      const min = match ? match[1] : '6';
      return `A palavra-passe deve ter pelo menos ${min} caracteres.`;
    }
    if (error.includes('Unable to validate email')) {
      return 'O email introduzido não é válido. Verifique e tente novamente.';
    }
    if (error.includes('Email rate limit exceeded') || error.includes('rate limit')) {
      return 'Demasiadas tentativas. Aguarde alguns minutos antes de tentar novamente.';
    }
    if (error.includes('Signup is disabled')) {
      return 'O registo de novas contas está temporariamente desactivado.';
    }
    if (error.includes('weak_password') || error.includes('too common') || error.includes('easily guessable')) {
      return 'A palavra-passe é demasiado fraca. Use uma combinação de letras, números e símbolos.';
    }
    if (error.includes('invalid') && error.includes('email')) {
      return 'O formato do email não é válido.';
    }
    return error;
  };

  const signup = async (email: string, password: string, name: string, phone: string): Promise<{ error: string | null }> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name,
          phone: phone,
        },
      },
    });

    if (error) {
      return { error: translateAuthError(error.message) };
    }

    if (data.user) {
      await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role: 'customer',
      });
    }

    return { error: null };
  };

  const sendOtp = async (phone: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.functions.invoke('send-otp', {
      body: { phone },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return { error: null };
  };

  const verifyOtp = async (phone: string, otp: string): Promise<{ valid: boolean; error: string | null }> => {
    const { data, error } = await supabase.functions.invoke('verify-otp', {
      body: { phone, otp },
    });

    if (error) {
      return { valid: false, error: error.message };
    }

    return { valid: data?.valid || false, error: data?.error || null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithPhone,
        signup,
        logout,
        sendOtp,
        verifyOtp,
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
