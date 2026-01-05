import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ArrowRight, Menu } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { products, brands } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import samLogo from '@/assets/sam-logo.png';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react';

const menuItems = [
  { icon: MapPin, label: 'Endereços', path: '/addresses' },
  { icon: CreditCard, label: 'Métodos de pagamento', path: '/payment-methods' },
  { icon: Bell, label: 'Notificações', path: '/notifications' },
  { icon: HelpCircle, label: 'Ajuda', path: '/help' },
  { icon: Settings, label: 'Configurações', path: '/settings' },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const { itemCount, total } = useCart();
  const [selectedBrand, setSelectedBrand] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((product) => {
    const matchesBrand =
      selectedBrand === 'Todos' || product.brand === selectedBrand;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.volume.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header with Logo and Menu */}
      <header className="sticky top-0 z-40 bg-primary safe-area-top">
        <div className="flex items-center justify-between py-4 px-4">
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="p-6 bg-primary text-primary-foreground">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <SheetTitle className="text-primary-foreground text-lg">João Silva</SheetTitle>
                    <p className="text-primary-foreground/70 text-sm">joao.silva@email.com</p>
                  </div>
                </div>
              </SheetHeader>
              <div className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full p-3 flex items-center gap-4 rounded-xl hover:bg-secondary transition-colors"
                    >
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-left font-medium text-foreground">
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  );
                })}
                <div className="pt-4 border-t border-border mt-4">
                  <button
                    onClick={() => navigate('/')}
                    className="w-full p-3 flex items-center gap-4 rounded-xl hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-destructive" />
                    <span className="flex-1 text-left font-medium text-destructive">
                      Terminar sessão
                    </span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={samLogo}
            alt="SAM - Sua loja virtual"
            className="h-10 object-contain"
          />

          <div className="w-10" />
        </div>
      </header>

      {/* Search */}
      <div className="px-2 sm:px-4 py-3 sm:py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sam-input pl-10 sm:pl-12 text-sm sm:text-base"
          />
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Brand Filter */}
      <div className="px-2 sm:px-4 mb-4">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {brands.map((brand) => (
            <motion.button
              key={brand}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                selectedBrand === brand
                  ? 'bg-accent text-accent-foreground shadow-sam'
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
              }`}
            >
              {brand}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-2 sm:px-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">Nenhum produto encontrado</p>
          </motion.div>
        )}
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-24 left-4 right-4 z-40"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/cart')}
            className="w-full sam-button-accent py-4 rounded-2xl"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="flex-1 text-left">
              Ver carrinho ({itemCount} {itemCount === 1 ? 'item' : 'itens'})
            </span>
            <span className="font-bold">{total} MT</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}
