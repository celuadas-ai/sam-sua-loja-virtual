import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operator } from '@/types';

interface DbOperator {
  id: string;
  user_id: string;
  is_active: boolean;
  deliveries_completed: number;
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
function mapDbToOperator(dbOperator: DbOperator, profile: DbProfile | null, email: string): Operator {
  return {
    id: dbOperator.id,
    name: profile?.name || 'Operador',
    email: email,
    phone: profile?.phone || '',
    address: profile?.address || undefined,
    role: 'operator',
    isActive: dbOperator.is_active,
    deliveriesCompleted: dbOperator.deliveries_completed,
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

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Get user roles to get emails
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('user_id', userIds)
        .eq('role', 'operator');

      if (rolesError) throw rolesError;

      // Map operators with their profiles
      const mappedOperators = operatorsData.map(op => {
        const profile = profilesData?.find(p => p.id === op.user_id) || null;
        // Email is not available from profiles, use a placeholder or fetch from auth if needed
        const email = profile?.name ? `${profile.name.toLowerCase().replace(/\s+/g, '.')}@operator.local` : 'operator@local';
        return mapDbToOperator(op as DbOperator, profile as DbProfile, email);
      });

      setOperators(mappedOperators);
    } catch (err) {
      console.error('Error fetching operators:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch operators');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new operator (creates user role, profile, and operator record)
  const addOperator = async (operatorData: Omit<Operator, 'id' | 'role' | 'deliveriesCompleted'>): Promise<Operator | null> => {
    try {
      // First, we need to create a user in Supabase Auth
      // For now, we'll create the operator record for an existing user
      // The admin should first create the user account, then add them as operator

      // Check if user already exists with this email by checking profiles
      // Note: In production, you'd want a proper user creation flow

      // Create a placeholder - in real scenario, admin would select existing user
      const { data: newOperator, error: operatorError } = await supabase
        .from('operators')
        .insert({
          user_id: operatorData.email, // This should be a real user_id
          is_active: operatorData.isActive ?? true,
          deliveries_completed: 0,
        })
        .select()
        .single();

      if (operatorError) throw operatorError;

      const operator: Operator = {
        id: newOperator.id,
        name: operatorData.name,
        email: operatorData.email,
        phone: operatorData.phone,
        address: operatorData.address,
        role: 'operator',
        isActive: newOperator.is_active,
        deliveriesCompleted: newOperator.deliveries_completed,
      };

      setOperators(prev => [operator, ...prev]);
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
