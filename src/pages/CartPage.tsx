import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CartItemCard } from '@/components/CartItemCard';
import { useCart } from '@/contexts/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Carrinho" showBack />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Carrinho vazio
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            Adicione produtos para começar a sua encomenda
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className="sam-button-accent"
          >
            Ver produtos
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      <Header title="Carrinho" showBack />

      <div className="px-4 py-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <CartItemCard key={item.id} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Summary & Checkout */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-20 left-0 right-0 bg-card border-t border-border p-4 space-y-4"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal ({itemCount} itens)</span>
            <span>{total} MT</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Taxa de entrega</span>
            <span className="text-sam-success">Grátis</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span>{total} MT</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/payment')}
          className="sam-button-accent w-full py-4 rounded-2xl"
        >
          Continuar para pagamento
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <BottomNav />
    </div>
  );
}
