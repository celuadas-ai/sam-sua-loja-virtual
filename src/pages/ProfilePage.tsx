import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';

const menuItems = [
  { icon: MapPin, label: 'Endereços', path: '/addresses' },
  { icon: CreditCard, label: 'Métodos de pagamento', path: '/payment-methods' },
  { icon: Bell, label: 'Notificações', path: '/notifications' },
  { icon: HelpCircle, label: 'Ajuda', path: '/help' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export default function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Perfil" showMenu />

      {/* Profile Card */}
      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sam-card p-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-primary mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            João Silva
          </h2>
          <p className="text-muted-foreground">joao.silva@email.com</p>
          <p className="text-sm text-muted-foreground">+258 84 123 4567</p>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="sam-button-secondary mt-4"
          >
            Editar perfil
          </motion.button>
        </motion.div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(item.path)}
              className="w-full sam-card p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="flex-1 text-left font-medium text-foreground">
                {item.label}
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          );
        })}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: menuItems.length * 0.05 }}
          onClick={() => navigate('/')}
          className="w-full sam-card p-4 flex items-center gap-4 border-destructive/20"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <span className="flex-1 text-left font-medium text-destructive">
            Terminar sessão
          </span>
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
