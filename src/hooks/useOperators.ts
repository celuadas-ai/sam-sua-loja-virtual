import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operator } from '@/types';

interface DbOperator {
  id: string;
  user_id: string;
  is_active: boolean;
  deliveries_completed: number;
  store_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DbProfile {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
}

// Convert DB operator + profile to app Operator type
function mapDbToOperator(dbOperator: DbOperator, profile: DbProfile | null, email: string, storeName?: string): Operator {
  return {
    id: dbOperator.id,
    userId: dbOperator.user_id,
    name: profile?.name || 'Operador',
    email: email,
    phone: profile?.phone || '',
    address: profile?.address || undefined,
    role: 'operator',
    isActive: dbOperator.is_active,
    deliveriesCompleted: dbOperator.deliveries_completed,
    storeId: dbOperator.store_id || undefined,
    storeName: storeName,
  };
}

export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all operators with their profiles
  const fetchOperators = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch operators with their user roles
      const { data: operatorsData, error: operatorsError } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (operatorsError) throw operatorsError;

      if (!operatorsData || operatorsData.length === 0) {
        setOperators([]);
        setIsLoading(false);
        return;
      }

      // Get user IDs to fetch profiles
      const userIds = operatorsData.map(op => op.user_id);

      // Fetch profiles and stores in parallel
      const [profilesResult, storesResult] = await Promise.all([
        supabase.from('profiles').select('*').in('id', userIds),
        supabase.from('stores').select('id, name'),
      ]);

      if (profilesResult.error) throw profilesResult.error;

      const profilesData = profilesResult.data;
      const storesData = storesResult.data || [];

      // Map operators with their profiles and store names
      const mappedOperators = operatorsData.map(op => {
        const profile = profilesData?.find(p => p.id === op.user_id) || null;
        const email = profile?.name ? `${profile.name.toLowerCase().replace(/\s+/g, '.')}@operator.local` : 'operator@local';
        const store = storesData.find(s => s.id === op.store_id);
        return mapDbToOperator(op as DbOperator, profile as DbProfile, email, store?.name);
      });

      setOperators(mappedOperators);
    } catch (err) {
      console.error('Error fetching operators:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch operators');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new operator via backend function
  const addOperator = async (operatorData: Omit<Operator, 'id' | 'role' | 'deliveriesCompleted'> & { password?: string }): Promise<Operator | null> => {
    try {
      const response = await supabase.functions.invoke('create-operator', {
        body: {
          name: operatorData.name,
          email: operatorData.email,
          phone: operatorData.phone,
          password: operatorData.password || 'Operator123!',
          store_id: operatorData.storeId || null,
        },
      });

      if (response.error) throw new Error(response.error.message);
      
      const result = response.data;
      if (result.error) throw new Error(result.error);

      const operator: Operator = {
        id: result.id,
        name: result.name,
        email: result.email,
        phone: result.phone,
        role: 'operator',
        isActive: result.is_active,
        deliveriesCompleted: result.deliveries_completed,
        storeId: result.store_id || undefined,
      };

      // Refetch to get store name
      await fetchOperators();
      return operator;
    } catch (err) {
      console.error('Error adding operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to add operator');
      return null;
    }
  };

  // Update an existing operator
  const updateOperator = async (id: string, updates: Partial<Operator>): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = {};
      
      if (updates.isActive !== undefined) {
        updateData.is_active = updates.isActive;
      }
      if (updates.deliveriesCompleted !== undefined) {
        updateData.deliveries_completed = updates.deliveriesCompleted;
      }
      if (updates.storeId !== undefined) {
        updateData.store_id = updates.storeId || null;
      }

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('operators')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }

      // Update local state
      setOperators(prev =>
        prev.map(op =>
          op.id === id ? { ...op, ...updates } : op
        )
      );

      return true;
    } catch (err) {
      console.error('Error updating operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to update operator');
      return false;
    }
  };

  // Delete an operator
  const deleteOperator = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOperators(prev => prev.filter(op => op.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting operator:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete operator');
      return false;
    }
  };

  // Toggle operator active status
  const toggleStatus = async (id: string): Promise<boolean> => {
    const operator = operators.find(op => op.id === id);
    if (!operator) return false;

    return updateOperator(id, { isActive: !operator.isActive });
  };

  // Initial fetch
  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  return {
    operators,
    isLoading,
    error,
    addOperator,
    updateOperator,
    deleteOperator,
    toggleStatus,
    refetch: fetchOperators,
  };
}
