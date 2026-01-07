import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DriverPosition {
  orderId: string;
  operatorId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  updatedAt: string;
}

export function useDriverPosition(orderId?: string) {
  const [position, setPosition] = useState<DriverPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Subscribe to realtime position updates for a specific order
  useEffect(() => {
    if (!orderId) return;

    // Fetch initial position
    const fetchPosition = async () => {
      const { data, error } = await supabase
        .from('driver_positions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (data && !error) {
        setPosition({
          orderId: data.order_id,
          operatorId: data.operator_id,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          heading: data.heading ? Number(data.heading) : undefined,
          speed: data.speed ? Number(data.speed) : undefined,
          updatedAt: data.updated_at,
        });
      }
    };

    fetchPosition();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`driver-position-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_positions',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          console.log('Driver position update:', payload);
          if (payload.new && typeof payload.new === 'object' && 'order_id' in payload.new) {
            const data = payload.new as any;
            setPosition({
              orderId: data.order_id,
              operatorId: data.operator_id,
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
              heading: data.heading ? Number(data.heading) : undefined,
              speed: data.speed ? Number(data.speed) : undefined,
              updatedAt: data.updated_at,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Start tracking (for operators)
  const startTracking = useCallback(async (orderIdToTrack: string) => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsTracking(true);

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, heading, speed } = pos.coords;
        
        // Upsert position to database
        const { error } = await supabase
          .from('driver_positions')
          .upsert({
            order_id: orderIdToTrack,
            operator_id: user.id,
            latitude,
            longitude,
            heading: heading ?? null,
            speed: speed ?? null,
          }, {
            onConflict: 'order_id',
          });

        if (error) {
          console.error('Error updating position:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    setWatchId(id);
  }, []);

  // Stop tracking
  const stopTracking = useCallback(async (orderIdToStop: string) => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);

    // Remove position from database
    await supabase
      .from('driver_positions')
      .delete()
      .eq('order_id', orderIdToStop);
  }, [watchId]);

  return {
    position,
    isTracking,
    startTracking,
    stopTracking,
  };
}
