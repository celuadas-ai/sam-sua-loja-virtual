import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Star, ShoppingBag, CreditCard, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const emojis = ['😞', '😐', '🙂', '😊', '🤩'];

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { currentOrder, processPayment, completeOrder } = useCart();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const paymentLabels: Record<string, string> = {
    mpesa: 'M-Pesa',
    emola: 'e-Mola',
    pos: 'POS',
    cash: t.payment.cash,
  };

  const handlePayment = async () => {
    setPaymentProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    processPayment();
    setPaymentComplete(true);
    setPaymentProcessing(false);

    toast({
      title: t.confirmation.paymentConfirmed,
      description: t.confirmation.thankYouPurchase,
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    completeOrder();

    toast({
      title: t.confirmation.thankYouReview,
      description: t.confirmation.opinionMatters,
    });

    setTimeout(() => {
      navigate('/products');
    }, 2000);
  };

  const handleSkip = () => {
    completeOrder();
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full bg-sam-success flex items-center justify-center mb-8"
      >
        <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-foreground text-center mb-2"
      >
        {t.confirmation.orderDelivered}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center mb-8"
      >
        {t.confirmation.hopeYouEnjoyed}
      </motion.p>

      {/* Payment Section */}
      {!paymentComplete && currentOrder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm sam-card p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sam-light-blue flex items-center justify-center">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{t.confirmation.makePayment}</h2>
              <p className="text-sm text-muted-foreground">
                {t.confirmation.method}: {paymentLabels[currentOrder.paymentMethod]}
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t.confirmation.totalToPay}</span>
              <span className="text-xl font-bold text-primary">{currentOrder.total} MT</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            disabled={paymentProcessing}
            className="sam-button-accent w-full py-4 rounded-2xl disabled:opacity-50"
          >
            {paymentProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
                />
                <span>{t.confirmation.processingPayment}</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>{t.confirmation.confirmPayment}</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Feedback Section - only show after payment */}
      {paymentComplete && !submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm sam-card p-6"
        >
          <h2 className="font-semibold text-foreground text-center mb-4">
            {t.confirmation.howWasExperience}
          </h2>

          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                className="p-1"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= rating
                      ? 'text-sam-warning fill-sam-warning'
                      : 'text-muted-foreground'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Emoji Display */}
          {rating > 0 && (
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl text-center mb-4"
            >
              {emojis[rating - 1]}
            </motion.p>
          )}

          {/* Feedback */}
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t.confirmation.leaveComment}
            className="sam-input resize-none h-24 mb-4"
          />

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={rating === 0}
            className="sam-button-accent w-full mb-3 disabled:opacity-50"
          >
            {t.confirmation.sendReview}
          </motion.button>

          <button
            onClick={handleSkip}
            className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            {t.common.skip}
          </button>
        </motion.div>
      ) : paymentComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-lg font-semibold text-foreground">
            {t.confirmation.thankYouFeedback}
          </p>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSkip}
        className="sam-button-secondary mt-8"
      >
        <ShoppingBag className="w-5 h-5" />
        {t.confirmation.newOrder}
      </motion.button>
    </div>
  );
}
