import { motion } from 'framer-motion';
import { ChevronLeft, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
}

export function Header({ title, showBack = false, showMenu = false }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = showBack && location.pathname !== '/products';

  const handleBack = () => {
    // Define logical parent routes instead of browser history
    const parentRoutes: Record<string, string> = {
      '/cart': '/products',
      '/payment': '/cart',
      '/tracking': '/products',
      '/confirmation': '/products',
      '/orders': '/products',
      '/profile': '/products',
      '/settings': '/profile',
      '/addresses': '/profile',
      '/payment-methods': '/profile',
      '/help': '/profile',
      '/notifications': '/products',
    };

    // Check for dynamic routes
    if (location.pathname.startsWith('/orders/')) {
      navigate('/orders');
      return;
    }

    const parent = parentRoutes[location.pathname] || '/products';
    navigate(parent);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border safe-area-top">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="w-10">
          {canGoBack && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-foreground"
        >
          {title}
        </motion.h1>

        <div className="w-10">
          {showMenu && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
