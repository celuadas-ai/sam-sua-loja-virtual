import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loginWithPhone, signup, sendOtp, verifyOtp, isAuthenticated, userRole, isLoading } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [pendingSignupData, setPendingSignupData] = useState<{ email: string; password: string; name: string; phone: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });

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

    if (isLogin) {
      if (loginMethod === 'email' && (!formData.email || !formData.password)) {
        toast({ title: t.auth.error, description: t.auth.fillAllFields, variant: 'destructive' });
        return;
      }
      if (loginMethod === 'phone' && (!formData.phone || !formData.password)) {
        toast({ title: t.auth.error, description: t.auth.fillAllFields, variant: 'destructive' });
        return;
      }
    } else {
      if (!formData.email || !formData.password || !formData.name || !formData.phone || !formData.confirmPassword) {
        toast({ title: t.auth.error, description: t.auth.fillAllFields, variant: 'destructive' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: t.auth.error, description: t.auth.passwordsDontMatch, variant: 'destructive' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        let result;
        if (loginMethod === 'email') {
          result = await login(formData.email, formData.password);
        } else {
          result = await loginWithPhone(formData.phone, formData.password);
        }

        if (result.error) {
          toast({
            title: t.auth.error,
            description: result.error === 'Invalid login credentials' ? t.auth.invalidCredentials : result.error,
            variant: 'destructive'
          });
        } else {
          toast({ title: `${t.auth.welcomeBack}!`, description: t.auth.redirecting });
        }
      } else {
        // Signup: first send OTP to verify phone
        setPendingSignupData({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
        });
        setOtpPhone(formData.phone);

        const { error } = await sendOtp(formData.phone);
        if (error) {
          toast({ title: t.auth.error, description: error, variant: 'destructive' });
        } else {
          setShowOtpModal(true);
          toast({ title: t.auth.otpSent, description: t.auth.otpSentDesc });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerified = async () => {
    if (!pendingSignupData) return;

    setIsSubmitting(true);
    try {
      const { error } = await signup(
        pendingSignupData.email,
        pendingSignupData.password,
        pendingSignupData.name,
        pendingSignupData.phone
      );

      if (error) {
        let errorMessage = error;
        if (error.includes('already registered')) {
          errorMessage = t.auth.emailAlreadyRegistered;
        }
        toast({ title: t.auth.error, description: errorMessage, variant: 'destructive' });
      } else {
        toast({ title: t.auth.accountCreated, description: t.auth.redirecting });
        setShowOtpModal(false);
        setPendingSignupData(null);
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
          className="w-20 h-20 mx-auto mb-6 bg-primary rounded-2xl p-3 shadow-sam">
          <img alt="SAM" className="w-full h-full object-contain" src="/lovable-uploads/00897e18-d75b-4d41-94bb-3e2a7fa24533.jpg" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-foreground mb-2">
          {isLogin ? t.auth.welcomeBack : t.auth.createAccount}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground">
          {isLogin ? t.auth.loginToContinue : t.auth.registerToOrder}
        </motion.p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="flex-1 w-full max-w-md px-6 pb-8">

        {/* Login method toggle (only for login) */}
        {isLogin && (
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'email'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="w-4 h-4" />
              {t.auth.loginWithEmail}
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                loginMethod === 'phone'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              {t.auth.loginWithPhone}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.auth.fullName}</label>
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
                <label className="block text-sm font-medium text-foreground mb-2">{t.auth.mobilePhone}</label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder={t.auth.mobilePhonePlaceholder}
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t.auth.email}</label>
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
            </>
          )}

          {isLogin && loginMethod === 'email' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t.auth.email}</label>
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
          )}

          {isLogin && loginMethod === 'phone' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t.auth.mobilePhone}</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder={t.auth.mobilePhonePlaceholder}
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
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{t.auth.password}</label>
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
              <label className="block text-sm font-medium text-foreground mb-2">{t.auth.confirmPassword}</label>
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

          {isLogin && loginMethod === 'email' && (
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

        {!isLogin && (
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Ao criar conta, aceita os nossos{' '}
            <Link to="/termos-e-condicoes" className="text-accent hover:underline">Termos e Condições</Link>
            {' '}e a{' '}
            <Link to="/privacidade" className="text-accent hover:underline">Política de Privacidade</Link>.
          </p>
        )}
      </motion.form>

      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => { setShowOtpModal(false); setPendingSignupData(null); }}
        phone={otpPhone}
        onVerified={handleOtpVerified}
      />
    </div>
  );
}
