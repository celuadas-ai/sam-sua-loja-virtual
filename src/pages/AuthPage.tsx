import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from 'lucide-react';
import samLogo from '@/assets/sam-logo.png';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup, isAuthenticated, userRole, isLoading } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });

  // Redirect if already authenticated - wait for userRole to be loaded
  useEffect(() => {
    if (isAuthenticated && !isLoading && userRole) {
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'operator') {
        navigate('/operator');
      } else {
        navigate('/products');
      }
    }
  }, [isAuthenticated, userRole, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: t.auth.error || 'Erro',
        description: t.auth.fillAllFields || 'Por favor preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    if (!isLogin && (!formData.name || !formData.phone || !formData.confirmPassword)) {
      toast({
        title: t.auth.error || 'Erro',
        description: t.auth.fillAllFields || 'Por favor preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: t.auth.error || 'Erro',
        description: t.auth.passwordsDontMatch || 'As palavras-passe não coincidem',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await login(formData.email, formData.password);
        
        if (error) {
          toast({
            title: t.auth.error || 'Erro',
            description: error === 'Invalid login credentials' 
              ? (t.auth.invalidCredentials || 'Credenciais inválidas')
              : error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: `${t.auth.welcomeBack}!`,
            description: t.auth.redirecting || 'Redirecionando...',
          });
        }
      } else {
        const { error } = await signup(formData.email, formData.password, formData.name, formData.phone);
        
        if (error) {
          let errorMessage = error;
          if (error.includes('already registered')) {
            errorMessage = t.auth.emailAlreadyRegistered || 'Este email já está registado';
          }
          
          toast({
            title: t.auth.error || 'Erro',
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t.auth.accountCreated || 'Conta criada',
            description: t.auth.redirecting || 'Redirecionando...',
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full max-w-md pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 mx-auto mb-6 bg-primary rounded-2xl p-3 shadow-sam"
        >
          <img src={samLogo} alt="SAM" className="w-full h-full object-contain" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-foreground mb-2"
        >
          {isLogin ? t.auth.welcomeBack : t.auth.createAccount}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          {isLogin
            ? t.auth.loginToContinue
            : t.auth.registerToOrder}
        </motion.p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="flex-1 w-full max-w-md px-6 pb-8"
      >
        <div className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t.auth.fullName}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t.auth.yourName}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="sam-input pl-12"
                    disabled={isSubmitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t.auth.mobilePhone || 'Número de Telemóvel'}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder={t.auth.mobilePhonePlaceholder || '+258 84 000 0000'}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="sam-input pl-12"
                    disabled={isSubmitting}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Phone className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.auth.email || 'Email'}
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder={t.auth.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="sam-input pl-12"
                disabled={isSubmitting}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Mail className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.auth.password}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="sam-input pl-12 pr-12"
                disabled={isSubmitting}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.auth.confirmPassword || 'Confirmar Palavra-passe'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="sam-input pl-12 pr-12"
                  disabled={isSubmitting}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {isLogin && (
            <div className="text-right">
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-accent hover:underline">
                {t.auth.forgotPassword}
              </button>
            </div>
          )}
        </div>

        <motion.button 
          type="submit" 
          whileTap={{ scale: 0.98 }} 
          className="sam-button-accent w-full mt-8 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isLogin ? t.auth.login : t.auth.createAccount}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}{' '}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-accent font-semibold hover:underline"
              disabled={isSubmitting}
            >
              {isLogin ? t.auth.createNewAccount : t.auth.login}
            </button>
          </p>
        </div>
      </motion.form>
    </div>
  );
}
