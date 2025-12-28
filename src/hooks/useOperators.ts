import { useState, useEffect } from 'react';
import { Operator } from '@/types';
import { mockOperators } from '@/data/mockUsers';

const STORAGE_KEY = 'sam-operators';

export function useOperators() {
  const [operators, setOperators] = useState<Operator[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setOperators(JSON.parse(stored));
    } else {
      setOperators(mockOperators);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOperators));
    }
  }, []);

  const saveOperators = (newOperators: Operator[]) => {
    setOperators(newOperators);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOperators));
  };

  const addOperator = (operator: Omit<Operator, 'id' | 'role' | 'deliveriesCompleted'>) => {
    const newOperator: Operator = {
      ...operator,
      id: `op-${Date.now()}`,
      role: 'operator',
      deliveriesCompleted: 0,
      isActive: true,
    };
    saveOperators([...operators, newOperator]);
    return newOperator;
  };

  const updateOperator = (id: string, updates: Partial<Operator>) => {
    const updated = operators.map(op => 
      op.id === id ? { ...op, ...updates } : op
    );
    saveOperators(updated);
  };

  const deleteOperator = (id: string) => {
    saveOperators(operators.filter(op => op.id !== id));
  };

  const toggleStatus = (id: string) => {
    const updated = operators.map(op =>
      op.id === id ? { ...op, isActive: !op.isActive } : op
    );
    saveOperators(updated);
  };

  return {
    operators,
    addOperator,
    updateOperator,
    deleteOperator,
    toggleStatus,
  };
}
