import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoSam from '@/assets/logo-sam-white.png';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary/85 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary-foreground/5" />
        <div className="absolute -bottom-48 -left-24 w-80 h-80 rounded-full bg-primary-foreground/5" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center z-10">

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>

          <img

            alt="SAM - Sociedade de Águas de Moçambique"
            className="w-72 h-auto object-contain shadow-sm opacity-100" src="/lovable-uploads/feb0618a-bb09-4196-a3e3-f25e6a8eedd4.png" />

        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-24 z-10">

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 rounded-full"
          style={{ borderWidth: '3px', borderColor: 'hsl(var(--primary-foreground) / 0.25)', borderTopColor: 'hsl(var(--primary-foreground))' }} />

      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-1">

        <p className="text-xs text-primary-foreground/50 font-light">sam.co.mz · aguadanamaacha.co.mz</p>
      </motion.div>
    </div>);

}