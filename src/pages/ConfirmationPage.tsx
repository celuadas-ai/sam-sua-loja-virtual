import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Star, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const emojis = ['😞', '😐', '🙂', '😊', '🤩'];

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeOrder } = useCart();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    completeOrder();

    toast({
      title: 'Obrigado pela avaliação!',
      description: 'A sua opinião é muito importante para nós.',
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
        Pedido entregue com sucesso!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-center mb-8"
      >
        Esperamos que tenha gostado do serviço
      </motion.p>

      {!submitted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm sam-card p-6"
        >
          <h2 className="font-semibold text-foreground text-center mb-4">
            Como foi a sua experiência?
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
            placeholder="Deixe o seu comentário (opcional)"
            className="sam-input resize-none h-24 mb-4"
          />

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={rating === 0}
            className="sam-button-accent w-full mb-3 disabled:opacity-50"
          >
            Enviar avaliação
          </motion.button>

          <button
            onClick={handleSkip}
            className="w-full text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            Pular
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-lg font-semibold text-foreground">
            Obrigado pelo feedback!
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
        Efetuar novo pedido
      </motion.button>
    </div>
  );
}
