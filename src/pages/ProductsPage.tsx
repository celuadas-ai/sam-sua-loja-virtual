import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ArrowRight } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ProductCard } from '@/components/ProductCard';
import { products, brands } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import samLogo from '@/assets/sam-logo.png';

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
      {/* Header with Logo */}
      <header className="sticky top-0 z-40 bg-primary safe-area-top">
        <div className="flex items-center justify-center py-4 px-4">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={samLogo}
            alt="SAM - Sua loja virtual"
            className="h-12 object-contain"
          />
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sam-input pl-12"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Brand Filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {brands.map((brand) => (
            <motion.button
              key={brand}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
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
      <div className="px-4">
        <div className="grid grid-cols-2 gap-4">
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
