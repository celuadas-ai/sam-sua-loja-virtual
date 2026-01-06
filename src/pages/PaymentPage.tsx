import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowRight, Lock } from 'lucide-react';
import { Header } from '@/components/Header';
import { PaymentMethodCard } from '@/components/PaymentMethodCard';
import { AddressSelector } from '@/components/AddressSelector';
import { useCart } from '@/contexts/CartContext';
import { PaymentMethod } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { items, total, createOrder } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: {
    method: PaymentMethod;
    label: string;
    description: string;
  }[] = [
    { method: 'mpesa', label: 'M-Pesa', description: t.payment.payWithMpesa },
    { method: 'emola', label: 'e-Mola', description: t.payment.payWithEmola },
    { method: 'pos', label: 'POS', description: t.payment.cardOnDelivery },
    { method: 'cash', label: t.payment.cash, description: t.payment.payCash },
  ];

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      toast({
        title: t.payment.selectAddress,
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMethod) {
      toast({
        title: t.payment.selectPaymentMethod,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order with customer details
      await createOrder(
        selectedMethod,
        undefined, // customerName - will use from user profile
        undefined, // customerPhone - will use from user profile
        selectedAddress.address // customerAddress
      );

      toast({
        title: t.payment.orderConfirmed,
        description: t.payment.paymentOnDeliveryDesc,
      });

      navigate('/tracking');
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Erro ao criar encomenda',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <Header title={t.payment.title} showBack />

      {/* Delivery Address Selector */}
      <div className="px-4 py-4">
        <AddressSelector
          selectedAddress={selectedAddress}
          onAddressSelect={setSelectedAddress}
        />
      </div>

      {/* Order Summary */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sam-card p-4"
        >
          <h3 className="font-semibold text-foreground mb-3">{t.payment.orderSummary}</h3>
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
            <span>{t.cart.total}</span>
            <span>{total} MT</span>
          </div>
        </motion.div>
      </div>

      {/* Payment Methods */}
      <div className="px-4">
        <h3 className="font-semibold text-foreground mb-3">
          {t.payment.paymentMethod}
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
          <span>{t.payment.payOnDelivery}</span>
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
              <span>{t.payment.processing}</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>{t.payment.confirmOrder} - {total} MT</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
