import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

// Import local assets for image mapping
import namaacha500ml from '@/assets/namaacha-500ml.png';
import namaacha500mlPack6 from '@/assets/namaacha-500ml-pack6.png';
import namaacha500mlPack12 from '@/assets/namaacha-500ml-pack12.png';
import namaacha15l from '@/assets/namaacha-1.5l.png';
import namaacha15lPack6 from '@/assets/namaacha-1.5l-pack6.png';
import namaacha25l from '@/assets/namaacha-2.5l.png';
import namaacha5l from '@/assets/namaacha-5l.png';
import aguaGas330ml from '@/assets/agua-gas-330ml.png';
import ff500ml from '@/assets/ff-500ml.png';
import ff15l from '@/assets/ff-1.5l.png';
import ff7l from '@/assets/ff-7l.png';
import natura189l from '@/assets/natura-18.9l.png';
import escolhaCerta7l from '@/assets/escolha-certa-7l.png';

// Map image URLs to local assets
const imageMap: Record<string, string> = {
  '/assets/namaacha-500ml.png': namaacha500ml,
  '/assets/namaacha-500ml-pack6.png': namaacha500mlPack6,
  '/assets/namaacha-500ml-pack12.png': namaacha500mlPack12,
  '/assets/namaacha-1.5l.png': namaacha15l,
  '/assets/namaacha-1.5l-pack6.png': namaacha15lPack6,
  '/assets/namaacha-2.5l.png': namaacha25l,
  '/assets/namaacha-5l.png': namaacha5l,
  '/assets/agua-gas-330ml.png': aguaGas330ml,
  '/assets/ff-500ml.png': ff500ml,
  '/assets/ff-1.5l.png': ff15l,
  '/assets/ff-7l.png': ff7l,
  '/assets/natura-18.9l.png': natura189l,
  '/assets/escolha-certa-7l.png': escolhaCerta7l,
};

interface DbProduct {
  id: string;
  name: string;
  brand: string;
  volume: string;
  price: number;
  image_url: string;
  min_quantity: number;
  unit_label: string;
  is_promo: boolean;
  promo_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Convert DB product to app Product type
function mapDbToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    brand: dbProduct.brand,
    volume: dbProduct.volume,
    price: Number(dbProduct.price),
    image: imageMap[dbProduct.image_url] || dbProduct.image_url,
    minQuantity: dbProduct.min_quantity,
    unitLabel: dbProduct.unit_label,
    isPromo: dbProduct.is_promo,
    promoPrice: dbProduct.promo_price ? Number(dbProduct.promo_price) : undefined,
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('brand', { ascending: true })
        .order('volume', { ascending: true });

      if (fetchError) throw fetchError;

      const mappedProducts = (data || []).map(p => mapDbToProduct(p as DbProduct));
      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new product
  const addProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert({
          name: product.name,
          brand: product.brand,
          volume: product.volume,
          price: product.price,
          image_url: product.image,
          min_quantity: product.minQuantity,
          unit_label: product.unitLabel,
          is_promo: product.isPromo || false,
          promo_price: product.promoPrice || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newProduct = mapDbToProduct(data as DbProduct);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err instanceof Error ? err.message : 'Failed to add product');
      return null;
    }
  };

  // Update an existing product
  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.brand !== undefined) updateData.brand = updates.brand;
      if (updates.volume !== undefined) updateData.volume = updates.volume;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.image !== undefined) updateData.image_url = updates.image;
      if (updates.minQuantity !== undefined) updateData.min_quantity = updates.minQuantity;
      if (updates.unitLabel !== undefined) updateData.unit_label = updates.unitLabel;
      if (updates.isPromo !== undefined) updateData.is_promo = updates.isPromo;
      if (updates.promoPrice !== undefined) updateData.promo_price = updates.promoPrice;

      const { data, error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select();

      if (updateError) throw updateError;

      if (!data || data.length === 0) {
        throw new Error('Não foi possível atualizar. Verifique se tem permissões de administrador.');
      }

      await fetchProducts();
      return true;
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return false;
    }
  };

  // Delete a product
  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}

// Export brands for filter functionality
export const brands = [
  'Todos',
  'Água da Namaacha',
  'Fonte Fresca',
  'Natura / Ges20',
  'Escolha Certa',
];
