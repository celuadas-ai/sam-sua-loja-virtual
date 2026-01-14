import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserAddress {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
  coords?: { lat: number; lng: number };
}

interface DbAddress {
  id: string;
  user_id: string;
  label: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

function mapDbToAddress(db: DbAddress): UserAddress {
  return {
    id: db.id,
    label: db.label,
    address: db.address,
    isDefault: db.is_default,
    coords: db.latitude && db.longitude 
      ? { lat: Number(db.latitude), lng: Number(db.longitude) } 
      : undefined,
  };
}

export function useAddresses() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAddresses((data || []).map(d => mapDbToAddress(d as DbAddress)));
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (data: { label: string; address: string; coords?: { lat: number; lng: number } }): Promise<UserAddress | null> => {
    if (!user) return null;

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          label: data.label,
          address: data.address,
          latitude: data.coords?.lat || null,
          longitude: data.coords?.lng || null,
          is_default: addresses.length === 0, // First address is default
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newAddress = mapDbToAddress(inserted as DbAddress);
      setAddresses(prev => [newAddress, ...prev]);
      return newAddress;
    } catch (err) {
      console.error('Error adding address:', err);
      setError(err instanceof Error ? err.message : 'Failed to add address');
      return null;
    }
  };

  const updateAddress = async (id: string, data: { label?: string; address?: string; coords?: { lat: number; lng: number } }): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = {};
      if (data.label) updateData.label = data.label;
      if (data.address) updateData.address = data.address;
      if (data.coords) {
        updateData.latitude = data.coords.lat;
        updateData.longitude = data.coords.lng;
      }

      const { error: updateError } = await supabase
        .from('user_addresses')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAddresses(prev =>
        prev.map(a => (a.id === id ? { ...a, ...data } : a))
      );
      return true;
    } catch (err) {
      console.error('Error updating address:', err);
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setAddresses(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting address:', err);
      return false;
    }
  };

  const setDefault = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First, unset all defaults
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the new default
      const { error: updateError } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setAddresses(prev =>
        prev.map(a => ({ ...a, isDefault: a.id === id }))
      );
      return true;
    } catch (err) {
      console.error('Error setting default address:', err);
      return false;
    }
  };

  return {
    addresses,
    isLoading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefault,
    refetch: fetchAddresses,
  };
}
