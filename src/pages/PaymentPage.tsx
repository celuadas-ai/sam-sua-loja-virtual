import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowRight, Lock, MapPin } from 'lucide-react';
import { Header } from '@/components/Header';
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
import { useCart } from '@/contexts/CartContext';
import { PaymentMethod } from '@/types';
import { useToast } from '@/hooks/use-toast';

const paymentMethods: {
  method: PaymentMethod;
  label: string;
  description: string;
}[] = [
  { method: 'mpesa', label: 'M-Pesa', description: 'Pagar com M-Pesa' },
  { method: 'emola', label: 'e-Mola', description: 'Pagar com e-Mola' },
  { method: 'pos', label: 'POS', description: 'Cartão na entrega' },
  { method: 'cash', label: 'Numerário', description: 'Pagar em dinheiro' },
];

export default function PaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, total, createOrder } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmOrder = async () => {
    if (!selectedMethod) {
      toast({
        title: 'Selecione um método de pagamento',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    createOrder(selectedMethod);

    toast({
      title: 'Encomenda confirmada!',
      description: 'O pagamento será efetuado na entrega.',
    });

    navigate('/tracking');
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header title="Pagamento" showBack />

      {/* Delivery Address */}
      <div className="px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sam-card p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sam-light-blue flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Entregar em</p>
              <p className="font-semibold text-foreground">
                Av. Julius Nyerere, 123
              </p>
              <p className="text-sm text-muted-foreground">
                Maputo, Moçambique
              </p>
            </div>
            <button className="text-accent text-sm font-semibold">
              Alterar
            </button>
          </div>
        </motion.div>
      </div>

      {/* Order Summary */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sam-card p-4"
        >
          <h3 className="font-semibold text-foreground mb-3">Resumo do pedido</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-muted-foreground"
              >
                <span>
                  {item.quantity}x {item.name} ({item.volume})
                </span>
                <span>{item.price * item.quantity} MT</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-foreground pt-3 mt-3 border-t border-border">
            <span>Total</span>
            <span>{total} MT</span>
          </div>
        </motion.div>
      </div>

      {/* Payment Methods */}
      <div className="px-4">
        <h3 className="font-semibold text-foreground mb-3">
          Método de pagamento
        </h3>
        <div className="space-y-3">
          {paymentMethods.map((pm, index) => (
            <motion.div
              key={pm.method}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <PaymentMethodCard
                method={pm.method}
                label={pm.label}
                description={pm.description}
                selected={selectedMethod === pm.method}
                onSelect={() => setSelectedMethod(pm.method)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4"
      >
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
          <Lock className="w-4 h-4" />
          <span>Pagamento na entrega</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirmOrder}
          disabled={!selectedMethod || isProcessing}
          className="sam-button-accent w-full py-4 rounded-2xl disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full"
              />
              <span>A processar...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Confirmar Encomenda - {total} MT</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
