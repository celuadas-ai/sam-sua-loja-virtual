import { useState, useEffect } from 'react';
import { Promotion } from '@/types';
import { mockPromotions } from '@/data/mockUsers';

const STORAGE_KEY = 'sam-promotions';

export function usePromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      const promotionsWithDates = parsed.map((p: Promotion) => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
      }));
      setPromotions(promotionsWithDates);
    } else {
      setPromotions(mockPromotions);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPromotions));
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = (data: Promotion[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const addPromotion = (promotion: Omit<Promotion, 'id'>) => {
    const newPromotion: Promotion = {
      ...promotion,
      id: `promo-${Date.now()}`,
    };
    const updated = [...promotions, newPromotion];
    setPromotions(updated);
    saveToStorage(updated);
    return newPromotion;
  };

  const updatePromotion = (id: string, data: Partial<Promotion>) => {
    const updated = promotions.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    setPromotions(updated);
    saveToStorage(updated);
  };

  const deletePromotion = (id: string) => {
    const updated = promotions.filter((p) => p.id !== id);
    setPromotions(updated);
    saveToStorage(updated);
  };

  const togglePromotion = (id: string) => {
    const updated = promotions.map((p) =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    setPromotions(updated);
    saveToStorage(updated);
  };

  return {
    promotions,
    isLoading,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotion,
  };
}
