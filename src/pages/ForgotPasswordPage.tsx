import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import samLogo from '@/assets/sam-logo.png';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: t.auth.error,
        description: t.auth.fillAllFields,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({ title: t.auth.error, description: error.message, variant: 'destructive' });
      } else {
        setSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {t.auth.forgotPassword}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          {sent
            ? (t.auth.resetEmailSent || 'Enviámos um link de recuperação para o seu email.')
            : (t.auth.resetInstructions || 'Insira o seu email para receber um link de recuperação.')}
        </motion.p>
      </div>

      {!sent ? (
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md px-6 pb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                {t.auth.email}
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="sam-input pl-12"
                  disabled={isSubmitting}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>
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
                {t.auth.sendResetLink || 'Enviar link de recuperação'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="text-accent font-semibold hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.auth.backToLogin || 'Voltar ao login'}
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-6 pb-8 text-center"
        >
          <div className="bg-primary/10 rounded-2xl p-6 mb-6">
            <Mail className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-sm text-foreground">
              {t.auth.checkEmailInbox || 'Verifique a sua caixa de entrada e siga o link para redefinir a palavra-passe.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="text-accent font-semibold hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.auth.backToLogin || 'Voltar ao login'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
