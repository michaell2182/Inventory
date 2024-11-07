import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import AddExpenseModal from '../../components/AddExpenseModal';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BudgetManager from '../../components/BudgetManager';
import ExpenseAnalytics from '../../components/ExpenseAnalytics';
import ExpenseReport from '../../components/ExpenseReport';
import EmptyState from '../../components/EmptyState';

interface ExpenseCategory {
  name: string;
  total: number;
  color: string;
}

interface ExpenseSummary {
  daily: number;
  weekly: number;
  monthly: number;
  categories: ExpenseCategory[];
}

// Add these features to expenses.tsx:

// 1. Budget Tracking
interface Budget {
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  notifications: boolean;
}

// 2. Expense Analytics
interface ExpenseAnalytics {
  trendData: {
    dates: string[];
    amounts: number[];
  };
  yearOverYear: number; // percentage change
  averageDaily: number;
  projectedMonthly: number;
}

// 3. Tax Categories
const TAX_CATEGORIES = {
  FULLY_DEDUCTIBLE: 'fully_deductible',
  PARTIALLY_DEDUCTIBLE: 'partially_deductible',
  NON_DEDUCTIBLE: 'non_deductible'
};

// 4. Expense Reports
interface ExpenseReport {
  startDate: Date;
  endDate: Date;
  total: number;
  byCategory: Record<string, number>;
  taxDeductible: number;
  attachments: string[];
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

const ExpenseScreen = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [summary, setSummary] = useState<ExpenseSummary>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    categories: []
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'budget' | 'analytics' | 'reports'>('expenses');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data);
      setSummary(calculateSummaries(data));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      alert('Error loading expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  }, [fetchExpenses]);

  const calculateSummaries = useCallback((expenseData: Expense[]) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    const daily = expenseData.filter(expense => 
      new Date(expense.date).getTime() > now.getTime() - oneDay
    ).reduce((sum, expense) => sum + expense.amount, 0);

    const weekly = expenseData.filter(expense => 
      new Date(expense.date).getTime() > now.getTime() - oneWeek
    ).reduce((sum, expense) => sum + expense.amount, 0);

    const monthly = expenseData.filter(expense => 
      new Date(expense.date).getMonth() === now.getMonth()
    ).reduce((sum, expense) => sum + expense.amount, 0);

    // Calculate category totals
    const categoryTotals = expenseData.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const categories: ExpenseCategory[] = Object.entries(categoryTotals).map(([name, total], index) => ({
      name,
      total,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));

    return { daily, weekly, monthly, categories };
  }, []);

  const getFilteredExpenses = useCallback(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const dateInRange = expenseDate >= dateRange.start && expenseDate <= dateRange.end;
      const categoryMatches = categoryFilter === 'all' || expense.category === categoryFilter;
      return dateInRange && categoryMatches;
    });
  }, [expenses, dateRange, categoryFilter]);

  const FilterModal = () => (
    <Modal
      visible={filterVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setFilterVisible(false)}
    >
      <View style={styles.filterModal}>
        <View style={styles.filterContent}>
          <Text style={styles.filterTitle}>Filter Expenses</Text>
          
          <Text style={styles.filterLabel}>Category</Text>
          <Picker
            selectedValue={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
            style={styles.picker}
          >
            <Picker.Item label="All Categories" value="all" />
            {Array.from(new Set(expenses.map(e => e.category))).map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>

          <Text style={styles.filterLabel}>Date Range</Text>
          <View style={styles.dateRangeContainer}>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker('start')}
            >
              <Text>{dateRange.start.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <Text>to</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker('end')}
            >
              <Text>{dateRange.end.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={[styles.filterButton, styles.resetButton]}
              onPress={() => {
                setCategoryFilter('all');
                setDateRange({
                  start: new Date(new Date().setDate(new Date().getDate() - 30)),
                  end: new Date(),
                });
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, styles.applyButton]}
              onPress={() => setFilterVisible(false)}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  {showDatePicker && (
    <DateTimePicker
      value={showDatePicker === 'start' ? dateRange.start : dateRange.end}
      mode="date"
      onChange={(event, selectedDate) => {
        setShowDatePicker(null);
        if (selectedDate) {
          setDateRange(prev => ({
            ...prev,
            [showDatePicker]: selectedDate
          }));
        }
      }}
    />
  )}

  const getTotalExpenses = useCallback(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  return (
    <SafeAreaView style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#000" />}
      {/* Update Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons name="filter-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabBar}>
        {['expenses', 'budget', 'analytics', 'reports'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as typeof activeTab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'expenses' && (
        <>
          {/* Total Expenses Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(getTotalExpenses())}
            </Text>
          </View>

          {/* Time Frame Selector */}
          <View style={styles.timeFrameSelector}>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'daily' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('daily')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'daily' && styles.activeTimeFrameText]}>
                Daily
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'weekly' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('weekly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'weekly' && styles.activeTimeFrameText]}>
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.timeFrameButton, timeFrame === 'monthly' && styles.activeTimeFrame]}
              onPress={() => setTimeFrame('monthly')}
            >
              <Text style={[styles.timeFrameText, timeFrame === 'monthly' && styles.activeTimeFrameText]}>
                Monthly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>
                {timeFrame === 'daily' ? 'Today' : timeFrame === 'weekly' ? 'This Week' : 'This Month'}
              </Text>
              <Text style={styles.summaryAmount}>
                ${summary[timeFrame].toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Category Breakdown */}
          <View style={styles.categoryBreakdown}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {summary.categories.length > 0 ? (
                summary.categories.map((category) => (
                  <View 
                    key={category.name} 
                    style={[styles.categoryCard, { borderLeftColor: category.color }]}
                  >
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryAmount}>
                      ${category.total.toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <EmptyState
                  icon="pie-chart-outline"
                  title="No Categories Yet"
                  message="Add expenses to see your spending breakdown by category"
                />
              )}
            </ScrollView>
          </View>

          {/* Expenses List */}
          <ScrollView
            style={styles.expensesList}
            contentContainerStyle={styles.expensesListContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {expenses.map((expense) => (
              <Animated.View
                key={expense.id}
                style={styles.expenseItem}
                entering={FadeIn}
                layout={Layout.springify()}
              >
                <View style={styles.expenseHeader}>
                  <Text style={styles.expenseDescription}>
                    {expense.description}
                  </Text>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(expense.amount)}
                  </Text>
                </View>
                <View style={styles.expenseDetails}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{expense.category}</Text>
                  </View>
                  <Text style={styles.expenseDate}>
                    {formatDate(expense.date)}
                  </Text>
                </View>
                {expense.notes && (
                  <Text style={styles.expenseNotes}>{expense.notes}</Text>
                )}
              </Animated.View>
            ))}
          </ScrollView>
        </>
      )}
      {activeTab === 'budget' && <BudgetManager />}
      {activeTab === 'analytics' && <ExpenseAnalytics />}
      {activeTab === 'reports' && <ExpenseReport />}

      {/* Add Expense Modal */}
      <AddExpenseModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onExpenseAdded={() => {
          fetchExpenses();
          setShowAddModal(false);
        }}
      />

      {filterVisible && (
        <FilterModal />
      )}
    </SafeAreaView>
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
    backgroundColor: '#fff',
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
  totalCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '600',
  },
  expensesList: {
    flex: 1,
    padding: 10,
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  expenseDate: {
    color: '#666',
    fontSize: 14,
  },
  expenseNotes: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'center',
    gap: 8,
  },
  timeFrameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  activeTimeFrame: {
    backgroundColor: '#000',
  },
  timeFrameText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTimeFrameText: {
    color: '#fff',
  },
  summaryContainer: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '600',
  },
  categoryBreakdown: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderLeftWidth: 4,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  filterContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 16,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dateButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f3f4f6',
  },
  applyButton: {
    backgroundColor: '#000',
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  emptyCategory: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  emptyCategoryText: {
    color: '#666',
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tab: {
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  expensesListContent: {
    paddingBottom: 20,
  },
});

// Add category colors
const CATEGORY_COLORS = [
  'white', // Indigo
  // '#0891b2', // Cyan
  // '#16a34a', // Green
  // '#ca8a04', // Yellow
  // '#dc2626', // Red
  // '#9333ea', // Purple
  // '#2563eb', // Blue
  // '#db2777', // Pink
];

export default ExpenseScreen; 