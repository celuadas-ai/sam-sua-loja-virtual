import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { CartItemCard } from '@/components/CartItemCard';
import { useCart } from '@/contexts/CartContext';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, iva, total, itemCount, bottleDeposit, needsBottleDeposit, hasGes20Item, setNeedsBottleDeposit } = useCart();
  const ges20Qty = items.filter(i => i.brand === 'Natura / Ges20').reduce((s, i) => s + i.quantity, 0);
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title={t.cart.title} showBack />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-6 py-20"
        >
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t.cart.empty}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {t.cart.emptyMessage}
          </p>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/products')}
            className="sam-button-accent"
          >
            {t.cart.viewProducts}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title={t.cart.title} showBack />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-[280px] sm:pb-[220px]">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <CartItemCard key={item.id} item={item} index={index} />
          ))}
          {needsBottleDeposit && hasGes20Item && (
            <motion.div
              key="bottle-deposit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="sam-card p-4 flex items-center gap-4 border border-amber-500/40"
            >
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                🪙
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Caução</p>
                <h3 className="font-semibold text-foreground truncate">Garrafão Natura / Ges20</h3>
                <p className="text-xs text-muted-foreground">Reembolsável na devolução</p>
                <p className="font-bold text-primary mt-1">
                  1000 <span className="text-xs font-normal text-muted-foreground">MT/un</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setNeedsBottleDeposit(false)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
                <span className="text-sm text-muted-foreground">x{ges20Qty}</span>
                <p className="text-sm font-semibold text-foreground">
                  {bottleDeposit.toFixed(2)} MT
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary & Checkout */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-[80px] left-0 right-0 bg-card border-t border-border p-4 pb-6 space-y-3 sm:space-y-4 shadow-lg z-40"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span>{t.cart.subtotal} ({itemCount} {itemCount === 1 ? t.cart.item : t.cart.items})</span>
            <span>{subtotal.toFixed(2)} MT</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>IVA (16%)</span>
            <span>{iva.toFixed(2)} MT</span>
          </div>
          {bottleDeposit > 0 && (
            <div className="flex justify-between text-amber-600 text-xs">
              <span>Inclui caução de garrafão ({ges20Qty}x)</span>
              <span>{bottleDeposit.toFixed(2)} MT</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>{t.cart.deliveryFee}</span>
            <span className="text-sam-success">{t.common.free}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
            <span>{t.cart.total}</span>
            <span>{total.toFixed(2)} MT</span>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(isAuthenticated ? '/payment' : '/auth')}
          className="sam-button-accent w-full py-4 rounded-2xl"
        >
          {t.cart.continueOrder}
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>

      <BottomNav />
    </div>
  );
}
