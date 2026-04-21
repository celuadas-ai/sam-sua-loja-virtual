/// <reference types="google.maps" />
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, Crosshair } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation as getDeviceLocation, GeolocationError } from '@/utils/geolocation';
import { useToast } from '@/hooks/use-toast';

interface AddressMapPickerProps {
  initialAddress?: string;
  onAddressSelect: (address: string, coords: { lat: number; lng: number }) => void;
}

const MAPUTO_CENTER = { lat: -25.9692, lng: 32.5732 };

export function AddressMapPicker({ initialAddress, onAddressSelect }: AddressMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(MAPUTO_CENTER);
  const [isLocating, setIsLocating] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps?.places) {
            clearInterval(checkLoaded);
            setIsLoaded(true);
          }
        }, 100);
        return;
      }

      try {
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

  // Initialize map and autocomplete
  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;

    // Initialize map
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: selectedCoords,
      zoom: 16,
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

    // Initialize marker
    markerRef.current = new window.google.maps.Marker({
      position: selectedCoords,
      map: mapInstanceRef.current,
      draggable: true,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    // Listen for marker drag
    markerRef.current.addListener('dragend', () => {
      const pos = markerRef.current?.getPosition();
      if (pos) {
        const coords = { lat: pos.lat(), lng: pos.lng() };
        setSelectedCoords(coords);
        reverseGeocode(coords);
      }
    });

    // Listen for map click
    mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        markerRef.current?.setPosition(coords);
        setSelectedCoords(coords);
        reverseGeocode(coords);
      }
    });

    // Initialize autocomplete
    if (inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'mz' },
        fields: ['formatted_address', 'geometry'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setSelectedCoords(coords);
          setSelectedAddress(place.formatted_address || '');
          mapInstanceRef.current?.panTo(coords);
          markerRef.current?.setPosition(coords);
        }
      });
    }
  }, [isLoaded, loadError]);

  // Reverse geocode coordinates to address
  const reverseGeocode = useCallback((coords: { lat: number; lng: number }) => {
    if (!window.google?.maps) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        setSelectedAddress(results[0].formatted_address);
      }
    });
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setSelectedCoords(coords);
        mapInstanceRef.current?.panTo(coords);
        markerRef.current?.setPosition(coords);
        reverseGeocode(coords);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  // Confirm selection
  const handleConfirm = () => {
    if (selectedAddress) {
      onAddressSelect(selectedAddress, selectedCoords);
    }
  };

  if (loadError) {
    return (
      <div className="h-64 bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Mapa indisponível</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-64 bg-muted rounded-xl overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-full flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg"
          >
            <Navigation className="w-8 h-8 text-primary-foreground" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Pesquisar endereço..."
          className="pl-10 pr-10"
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
        />
        <button
          onClick={getCurrentLocation}
          disabled={isLocating}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Crosshair className={`w-4 h-4 text-primary ${isLocating ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Map */}
      <div className="relative h-64 rounded-xl overflow-hidden border border-border">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Instructions overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs text-muted-foreground text-center">
            Toque no mapa ou arraste o marcador para ajustar a localização
          </div>
        </div>
      </div>

      {/* Selected address display */}
      {selectedAddress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-primary/5 border border-primary/20"
        >
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{selectedAddress}</p>
          </div>
        </motion.div>
      )}

      {/* Confirm button */}
      <Button 
        className="w-full" 
        onClick={handleConfirm}
        disabled={!selectedAddress}
      >
        Confirmar localização
      </Button>
    </div>
  );
}
