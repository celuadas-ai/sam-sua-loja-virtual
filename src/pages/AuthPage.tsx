import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import samLogo from '@/assets/sam-logo.png';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: isLogin ? 'Bem-vindo de volta!' : 'Conta criada com sucesso!',
      description: 'A redirecionar para os produtos...',
    });

    setTimeout(() => {
      navigate('/products');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
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
          {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          {isLogin
            ? 'Entre na sua conta para continuar'
            : 'Registe-se para começar a encomendar'}
        </motion.p>
      </div>

      {/* Form */}
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
                Nome completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="O seu nome"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
              Email ou Telefone
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="exemplo@email.com ou 84XXXXXXX"
                value={formData.emailOrPhone}
                onChange={(e) =>
                  setFormData({ ...formData, emailOrPhone: e.target.value })
                }
                className="sam-input pl-12"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                {formData.emailOrPhone.includes('@') ? (
                  <Mail className="w-5 h-5" />
                ) : (
                  <Phone className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Palavra-passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-accent hover:underline"
              >
                Recuperar palavra-passe
              </button>
            </div>
          )}
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          className="sam-button-accent w-full mt-8"
        >
          {isLogin ? 'Entrar' : 'Criar conta'}
          <ArrowRight className="w-5 h-5" />
        </motion.button>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent font-semibold hover:underline"
            >
              {isLogin ? 'Criar nova conta' : 'Entrar'}
            </button>
          </p>
        </div>
      </motion.form>
    </div>
  );
}
