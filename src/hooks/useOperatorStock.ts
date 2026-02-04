import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { products } from '@/data/products';

export interface StockItem {
  id: string;
  productId: string;
  productName: string;
  productBrand: string;
  productVolume: string;
  productImage: string;
  quantity: number;
}

export function useOperatorStock() {
  const { user } = useAuth();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('operator_stock')
        .select('*')
        .eq('operator_id', user.id);

      if (error) throw error;

      // Map stock data with product info
      const stockItems: StockItem[] = (data || []).map((item: any) => {
        const product = products.find(p => p.id === item.product_id);
        return {
          id: item.id,
          productId: item.product_id,
          productName: product?.name || 'Produto',
          productBrand: product?.brand || '',
          productVolume: product?.volume || '',
          productImage: product?.image || '',
          quantity: item.quantity,
        };
      });

      setStock(stockItems);
    } catch (error) {
      console.error('Error fetching operator stock:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [user]);

  const updateStock = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user) return false;

    try {
      // Check if stock entry exists
      const { data: existing } = await supabase
        .from('operator_stock')
        .select('id')
        .eq('operator_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('operator_stock')
          .update({ quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('operator_stock')
          .insert({
            operator_id: user.id,
            product_id: productId,
            quantity,
          });

        if (error) throw error;
      }

      await fetchStock();
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  };

  const removeFromStock = async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('operator_stock')
        .delete()
        .eq('operator_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchStock();
      return true;
    } catch (error) {
      console.error('Error removing from stock:', error);
      return false;
    }
  };

  // Get available products (not yet in stock)
  const availableProducts = products.filter(
    p => !stock.find(s => s.productId === p.id)
  );

  return {
    stock,
    loading,
    updateStock,
    removeFromStock,
    availableProducts,
    refetch: fetchStock,
  };
}
