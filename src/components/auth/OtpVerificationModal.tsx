import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerified: () => void;
}

export function OtpVerificationModal({ isOpen, onClose, phone, onVerified }: OtpVerificationModalProps) {
  const { verifyOtp, sendOtp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsVerifying(true);
    try {
      const { valid, error } = await verifyOtp(phone, otp);

      if (valid) {
        toast({ title: t.auth.phoneVerified });
        onVerified();
      } else {
        toast({
          title: t.auth.error,
          description: error?.includes('expired') ? t.auth.otpExpired : t.auth.otpInvalid,
          variant: 'destructive',
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const { error } = await sendOtp(phone);
      if (error) {
        toast({ title: t.auth.error, description: error, variant: 'destructive' });
      } else {
        toast({ title: t.auth.otpSent, description: t.auth.otpSentDesc });
        setOtp('');
      }
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background rounded-2xl p-6 w-full max-w-sm shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">{t.auth.verifyPhone}</h3>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            {t.auth.enterOtp} <span className="font-medium text-foreground">{phone}</span>
          </p>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying}
            className="sam-button-accent w-full mb-3 disabled:opacity-50"
          >
            {isVerifying ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              t.auth.verify
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full text-sm text-accent hover:underline disabled:opacity-50"
          >
            {isResending ? t.auth.sendingOtp : t.auth.resendOtp}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
