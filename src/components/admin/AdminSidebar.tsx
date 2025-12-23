import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Truck, 
  Tag, 
  BarChart3, 
  Settings,
  LogOut 
} from 'lucide-react';
import samLogo from '@/assets/sam-logo.png';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Produtos', path: '/admin/products' },
  { icon: Users, label: 'Operadores', path: '/admin/operators' },
  { icon: Truck, label: 'Encomendas', path: '/admin/orders' },
  { icon: Tag, label: 'Promoções', path: '/admin/promotions' },
  { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
  { icon: Settings, label: 'Definições', path: '/admin/settings' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 bg-card border-r border-border h-screen flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl p-1.5">
            <img src={samLogo} alt="SAM" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">SAM Admin</h1>
            <p className="text-xs text-muted-foreground">Painel de Gestão</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
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
  );
}
