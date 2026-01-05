import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import samLogo from '@/assets/sam-logo.png';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = login(formData.emailOrPhone, formData.password);
    
    if (user) {
      const redirectText = user.role === 'admin' 
        ? t.auth.adminPanel 
        : user.role === 'operator' 
          ? t.auth.operatorPanel 
          : t.auth.productsPage;
      
      toast({
        title: isLogin ? `${t.auth.welcomeBack}!` : t.auth.accountCreated,
        description: `${t.auth.redirectingTo} ${redirectText}...`,
      });

      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'operator') {
          navigate('/operator');
        } else {
          navigate('/products');
        }
      }, 1000);
    } else {
      toast({
        title: t.auth.welcome,
        description: t.auth.redirecting,
      });
      setTimeout(() => navigate('/products'), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="pt-12 pb-8 px-6 text-center">
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs text-muted-foreground mt-4 bg-muted p-2 rounded-lg"
        >
          {t.auth.demoHint}
        </motion.p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="flex-1 px-6 pb-8"
      >
        <div className="space-y-4">
          {!isLogin && (
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
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.auth.emailOrPhone}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={t.auth.emailPlaceholder}
                value={formData.emailOrPhone}
                onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                className="sam-input pl-12"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {formData.emailOrPhone.includes('@') ? <Mail className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
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
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button type="button" className="text-sm text-accent hover:underline">
                {t.auth.forgotPassword}
              </button>
            </div>
          )}
        </div>

        <motion.button type="submit" whileTap={{ scale: 0.98 }} className="sam-button-accent w-full mt-8">
          {isLogin ? t.auth.login : t.auth.createAccount}
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            {isLogin ? t.auth.noAccount : t.auth.hasAccount}{' '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-accent font-semibold hover:underline">
              {isLogin ? t.auth.createNewAccount : t.auth.login}
            </button>
          </p>
        </div>
      </motion.form>
    </div>
  );
}
