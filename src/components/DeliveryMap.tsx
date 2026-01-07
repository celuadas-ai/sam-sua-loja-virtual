/// <reference types="google.maps" />
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';
import { OrderStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useDriverPosition } from '@/hooks/useDriverPosition';

interface DeliveryMapProps {
  status: OrderStatus;
  destinationAddress?: string;
  orderId?: string;
}

const MAPUTO_CENTER = { lat: -25.9692, lng: 32.5732 };

export function DeliveryMap({ status, destinationAddress, orderId }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const driverMarkerRef = useRef<google.maps.Marker | null>(null);
  const routeLineRef = useRef<google.maps.Polyline | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // Real-time driver position from Supabase
  const { position: realtimePosition } = useDriverPosition(orderId);

  // Fallback simulated positions based on order status
  const getDriverPosition = (orderStatus: OrderStatus) => {
    const positions: Record<OrderStatus, { lat: number; lng: number }> = {
      received: { lat: -25.9532, lng: 32.5832 }, // Warehouse
      preparing: { lat: -25.9532, lng: 32.5832 }, // Still at warehouse
      on_the_way: { lat: -25.9612, lng: 32.5782 }, // On route
      almost_there: { lat: -25.9672, lng: 32.5742 }, // Near destination
      delivered: MAPUTO_CENTER, // At destination
    };
    return positions[orderStatus];
  };

  // Get current driver position (realtime or simulated)
  const getCurrentDriverPosition = () => {
    if (realtimePosition) {
      return { lat: realtimePosition.latitude, lng: realtimePosition.longitude };
    }
    return getDriverPosition(status);
  };

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsLoaded(true));
        return;
      }

      try {
        // Fetch API key from edge function
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        
        if (error || !data?.apiKey) {
          console.error('Failed to load Maps API key:', error);
          setLoadError(true);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        script.onerror = () => setLoadError(true);
        document.head.appendChild(script);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setLoadError(true);
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;

  const initializeMap = () => {
      const driverPos = getCurrentDriverPosition();

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current!, {
        center: driverPos,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'off' }],
          },
        ],
      });

      // Destination marker
      new window.google.maps.Marker({
        position: MAPUTO_CENTER,
        map: mapInstanceRef.current,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#22c55e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        title: 'Destino',
      });

      // Driver marker
      driverMarkerRef.current = new window.google.maps.Marker({
        position: driverPos,
        map: mapInstanceRef.current,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="#3b82f6" stroke="#ffffff" stroke-width="4"/>
              <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🛵</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(48, 48),
          anchor: new window.google.maps.Point(24, 24),
        },
        title: 'Entregador',
      });

      // Draw route line
      routeLineRef.current = new window.google.maps.Polyline({
        path: [driverPos, MAPUTO_CENTER],
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      routeLineRef.current.setMap(mapInstanceRef.current);
    };

    initializeMap();
  }, [isLoaded, loadError]);

  // Update driver position when realtime position or status changes
  useEffect(() => {
    if (!driverMarkerRef.current || !mapInstanceRef.current) return;

    const newPos = getCurrentDriverPosition();
    driverMarkerRef.current.setPosition(newPos);
    mapInstanceRef.current.panTo(newPos);

    // Update route line
    if (routeLineRef.current) {
      routeLineRef.current.setPath([newPos, MAPUTO_CENTER]);
    }
  }, [status, realtimePosition]);

  if (loadError) {
    return (
      <div className="relative h-48 bg-muted overflow-hidden flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Mapa indisponível</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative h-48 bg-muted overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-lg"
            >
              <Navigation className="w-8 h-8 text-accent-foreground" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative h-48 overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Status overlay */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2"
      >
        <span className="text-lg">🛵</span>
        <span className="text-sm font-medium text-foreground">
          {status === 'on_the_way' && 'A caminho'}
          {status === 'almost_there' && 'Quase a chegar'}
          {status === 'delivered' && 'Entregue'}
          {status === 'preparing' && 'Em preparação'}
          {status === 'received' && 'Pedido recebido'}
        </span>
      </motion.div>
    </div>
  );
}
