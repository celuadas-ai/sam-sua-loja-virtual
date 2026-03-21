import { motion } from 'framer-motion';
import { Home, ShoppingCart, MapPin, Package, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t.nav.products, path: '/products' },
    { icon: ShoppingCart, label: t.nav.cart, path: '/cart' },
    { icon: MapPin, label: t.nav.track, path: '/tracking' },
    { icon: Package, label: t.nav.orders, path: '/orders' },
    { icon: User, label: t.nav.profile, path: '/profile' },
  ];

  return (
    <nav className="sam-bottom-nav z-50">
      <div className="flex items-center justify-around py-2 px-1 sm:px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => {
                if (isActive && item.path === '/products') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate(item.path);
                }
              }}
              className={`relative flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-2 rounded-xl transition-colors min-w-0 ${
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                {item.path === '/cart' && itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-accent text-accent-foreground text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] sm:text-xs font-medium truncate max-w-[48px] sm:max-w-none">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-8 sm:w-12 h-1 bg-accent rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
