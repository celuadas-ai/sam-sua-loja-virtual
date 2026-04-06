import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ArrowRight, Menu, Loader2, WifiOff, RefreshCw } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { useProducts, brands } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import samIconBlue from '@/assets/sam-icon-blue.jpg';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger } from
'@/components/ui/sheet';
import {
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  User } from
'lucide-react';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { itemCount, total } = useCart();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { products, isLoading, error, refetch } = useProducts();
  const [selectedBrand, setSelectedBrand] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const userName = user?.user_metadata?.full_name || 'Utilizador';
  const userEmail = user?.email || '';

  const menuItems = [
  { icon: MapPin, label: t.profile.addresses, path: '/addresses' },
  { icon: CreditCard, label: t.profile.paymentMethods, path: '/payment-methods' },
  { icon: Bell, label: t.settings.notifications, path: '/notifications' },
  { icon: HelpCircle, label: t.profile.help, path: '/help' },
  { icon: Settings, label: t.profile.settings, path: '/settings' }];


  // Normalize text removing accents for accent-insensitive search
  const normalize = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesBrand =
    selectedBrand === 'Todos' || selectedBrand === 'All' || product.brand === selectedBrand;
    const query = normalize(searchQuery);
    const matchesSearch =
    normalize(product.name).includes(query) ||
    normalize(product.brand).includes(query) ||
    normalize(product.volume).includes(query);
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Header with Logo and Menu */}
      <header className="sticky top-0 z-40 bg-primary safe-area-top">
        <div className="flex items-center justify-between py-4 px-4">
          <Sheet>
            <SheetTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/20 transition-colors">

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
                    <SheetTitle className="text-primary-foreground text-lg">{userName}</SheetTitle>
                    <p className="text-primary-foreground/70 text-sm">{userEmail}</p>
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
                      className="w-full p-3 flex items-center gap-4 rounded-xl hover:bg-secondary transition-colors">

                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-left font-medium text-foreground">
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>);

                })}
                <div className="pt-4 border-t border-border mt-4">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full p-3 flex items-center gap-4 rounded-xl hover:bg-destructive/10 transition-colors">

                    <LogOut className="w-5 h-5 text-destructive" />
                    <span className="flex-1 text-left font-medium text-destructive">
                      {t.profile.logout}
                    </span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}

            alt="SAM - Sua loja virtual"
            className="h-10 w-10 object-contain rounded-xl" src={samIconBlue} />


          <div className="w-10" />
        </div>
      </header>

      {/* Search */}
      <div className="px-2 sm:px-4 py-3 sm:py-4">
        <div className="relative">
          <input
            type="text"
            placeholder={t.products.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sam-input pl-10 sm:pl-12 text-sm sm:text-base" />

          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Brand Filter */}
      <div className="px-2 sm:px-4 mb-4">
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {brands.map((brand) =>
          <motion.button
            key={brand}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedBrand(brand)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
            selectedBrand === brand ?
            'bg-accent text-accent-foreground shadow-sam' :
            'bg-secondary text-secondary-foreground hover:bg-muted'}`
            }>

              {brand === 'Todos' ? t.common.all : brand}
            </motion.button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-2 sm:px-4">
        {isLoading ?
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div> :
        error ?
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <WifiOff className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sem conexão</h3>
            <p className="text-muted-foreground mb-6 max-w-xs">
              Não foi possível carregar os produtos. Verifique a sua ligação à internet e tente novamente.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => refetch()}
              className="sam-button-accent px-6 py-3 rounded-xl flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Tentar novamente
            </motion.button>
          </motion.div> :
        <>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {filteredProducts.map((product, index) =>
            <ProductCard key={product.id} product={product} index={index} />
            )}
            </div>

            {filteredProducts.length === 0 &&
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12">

                <p className="text-muted-foreground">{t.products.noProducts}</p>
              </motion.div>
          }
          </>
        }
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 &&
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-[120px] left-4 right-4 z-40">

          <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/cart')}
          className="w-full sam-button-accent py-4 rounded-2xl">

            <ShoppingCart className="w-5 h-5" />
            <span className="flex-1 text-left">
              {t.cart.viewCart} ({itemCount} {itemCount === 1 ? t.cart.item : t.cart.items})
            </span>
            <span className="font-bold">{total} MT</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      }

      <BottomNav />
    </div>);

}