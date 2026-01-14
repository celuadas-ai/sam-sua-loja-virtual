import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types';

interface DbPromotion {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  product_ids: string[];
  created_at: string;
  updated_at: string;
}

function mapDbToPromotion(db: DbPromotion): Promotion {
  return {
    id: db.id,
    name: db.name,
    description: db.description || '',
    discountPercent: db.discount_percent,
    startDate: new Date(db.start_date),
    endDate: new Date(db.end_date),
    isActive: db.is_active,
    productIds: db.product_ids || [],
  };
}

export function usePromotionsDb() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPromotions((data || []).map(d => mapDbToPromotion(d as DbPromotion)));
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const addPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<Promotion | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('promotions')
        .insert({
          name: promotion.name,
          description: promotion.description || null,
          discount_percent: promotion.discountPercent,
          start_date: promotion.startDate.toISOString(),
          end_date: promotion.endDate.toISOString(),
          is_active: promotion.isActive,
          product_ids: promotion.productIds || [],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newPromotion = mapDbToPromotion(data as DbPromotion);
      setPromotions(prev => [newPromotion, ...prev]);
      return newPromotion;
    } catch (err) {
      console.error('Error adding promotion:', err);
      setError(err instanceof Error ? err.message : 'Failed to add promotion');
      return null;
    }
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.discountPercent !== undefined) updateData.discount_percent = updates.discountPercent;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString();
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate.toISOString();
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
      if (updates.productIds !== undefined) updateData.product_ids = updates.productIds;

      const { error: updateError } = await supabase
        .from('promotions')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      setPromotions(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates } : p))
      );
      return true;
    } catch (err) {
      console.error('Error updating promotion:', err);
      return false;
    }
  };

  const deletePromotion = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPromotions(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting promotion:', err);
      return false;
    }
  };

  const togglePromotion = async (id: string): Promise<boolean> => {
    const promo = promotions.find(p => p.id === id);
    if (!promo) return false;
    return updatePromotion(id, { isActive: !promo.isActive });
  };

  return {
    promotions,
    isLoading,
    error,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    refetch: fetchPromotions,
  };
}
