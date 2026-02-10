import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types';

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: Promotion[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        discountPercent: p.discount_percent,
        startDate: new Date(p.start_date),
        endDate: new Date(p.end_date),
        isActive: p.is_active,
        productIds: p.product_ids || [],
      }));

      setPromotions(mapped);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const addPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<Promotion | null> => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          name: promotion.name,
          description: promotion.description || null,
          discount_percent: promotion.discountPercent,
          start_date: promotion.startDate instanceof Date ? promotion.startDate.toISOString() : promotion.startDate,
          end_date: promotion.endDate instanceof Date ? promotion.endDate.toISOString() : promotion.endDate,
          is_active: promotion.isActive,
          product_ids: promotion.productIds || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newPromotion: Promotion = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        discountPercent: data.discount_percent,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        isActive: data.is_active,
        productIds: data.product_ids || [],
      };

      setPromotions(prev => [newPromotion, ...prev]);
      return newPromotion;
    } catch (err) {
      console.error('Error adding promotion:', err);
      return null;
    }
  };

  const updatePromotion = async (id: string, updates: Partial<Promotion>): Promise<boolean> => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.discountPercent !== undefined) dbUpdates.discount_percent = updates.discountPercent;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate instanceof Date ? updates.startDate.toISOString() : updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate instanceof Date ? updates.endDate.toISOString() : updates.endDate;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.productIds !== undefined) dbUpdates.product_ids = updates.productIds;

      const { error } = await supabase
        .from('promotions')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setPromotions(prev =>
        prev.map(p => p.id === id ? { ...p, ...updates } : p)
      );
      return true;
    } catch (err) {
      console.error('Error updating promotion:', err);
      return false;
    }
  };

  const deletePromotion = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

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
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
    refetch: fetchPromotions,
  };
}
