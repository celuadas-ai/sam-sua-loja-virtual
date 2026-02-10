import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  maxDeliveryRadiusKm: number;
  isActive: boolean;
  deliveryZone: { lat: number; lng: number }[] | null;
}

export function useStores() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        setStores(data.map(s => ({
          id: s.id,
          name: s.name,
          address: s.address,
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
          maxDeliveryRadiusKm: Number(s.max_delivery_radius_km),
          isActive: s.is_active,
          deliveryZone: Array.isArray(s.delivery_zone) ? (s.delivery_zone as unknown as { lat: number; lng: number }[]) : null,
        })));
      }
      setLoading(false);
    };

    fetchStores();
  }, []);

  return { stores, loading };
}
