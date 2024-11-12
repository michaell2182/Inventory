import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AddBudgetModal from './AddBudgetModal';
import EmptyState from './EmptyState';

interface Budget {
  id: string;
  category: string;
  budget_limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  notifications: boolean;
  notes?: string;
}

const BudgetManager = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user signed in');
      }
    };
    
    checkUser();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  };

  const calculateProgress = (spent: number, budget_limit: number) => {
    return Math.min((spent / budget_limit) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return '#dc2626';
    if (progress >= 75) return '#f59e0b';
    return '#16a34a';
  };

  const createBudget = async (budgetData: Budget) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          ...budgetData,
          user_id: user.id,
        })
        .select();

      if (error) throw error;
      
      console.log('Budget created:', data);
      return data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw error;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.budgetList}>
        {budgets.map((budget) => {
          const progress = calculateProgress(budget.spent, budget.budget_limit);
          return (
            <View key={budget.id} style={styles.budgetCard}>
              <View style={styles.budgetHeader}>
                <Text style={styles.categoryText}>{budget.category}</Text>
                <Text style={styles.periodText}>{budget.period}</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { 
                        width: `${progress}%`,
                        backgroundColor: getProgressColor(progress),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  ${budget.spent.toFixed(2)} of ${budget.budget_limit.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })}
        
        {budgets.length === 0 && !isLoading && (
          <EmptyState
            icon="wallet-outline"
            title="No Budgets Set"
            message="Start managing your spending by setting up your first budget"
          />
        )}
      </ScrollView>

      <AddBudgetModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onBudgetAdded={() => {
          fetchBudgets();
          setShowAddModal(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetList: {
    flex: 1,
    padding: 16,
  },
  budgetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodText: {
    color: '#666',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 4,
    textAlign: 'right',
    color: '#666',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
  },
});

export default BudgetManager;