import { motion } from 'framer-motion';
import { ChevronLeft, Blinds } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBackRoute } from '@/utils/navigation';

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
    const parent = getBackRoute(location.pathname) || '/products';
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
              <Blinds className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
