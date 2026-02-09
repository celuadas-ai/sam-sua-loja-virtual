import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Users2,
  Truck, 
  Tag, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Store
} from 'lucide-react';
import samLogo from '@/assets/sam-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Produtos', path: '/admin/products' },
  { icon: Store, label: 'Lojas', path: '/admin/stores' },
  { icon: Users, label: 'Operadores', path: '/admin/operators' },
  { icon: Users2, label: 'Perfis', path: '/admin/profiles' },
  { icon: Truck, label: 'Encomendas', path: '/admin/orders' },
  { icon: Tag, label: 'Promoções', path: '/admin/promotions' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
  { icon: Settings, label: 'Definições', path: '/admin/settings' },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && onClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        className={`w-64 bg-card border-r border-border h-screen flex flex-col fixed lg:static z-50 lg:translate-x-0 ${
          !isOpen ? '-translate-x-full lg:translate-x-0' : ''
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl p-1.5">
              <img src={samLogo} alt="SAM" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold text-foreground">SAM Admin</h1>
              <p className="text-xs text-muted-foreground">Painel de Gestão</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 hover:bg-muted rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Terminar Sessão</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
