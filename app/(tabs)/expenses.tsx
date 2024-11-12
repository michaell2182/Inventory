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
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation();

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: true,
    });
  }, [navigation]);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id) // Filter by user_id
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
      
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Expenses</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setFilterVisible(true)}
            >
              <Ionicons name="funnel-outline" size={22} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Expense</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total Expenses Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Expenses</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>
              {formatCurrency(getTotalExpenses())}
            </Text>
            <LineChart
              data={{
                datasets: [{
                  data: [5000, 6000, 5500, 7000, 6500, 8000, 7500]
                }]
              }}
              width={100}
              height={40}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              chartConfig={{
                backgroundGradientFrom: '#f8f9fa',
                backgroundGradientTo: '#f8f9fa',
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                strokeWidth: 2,
              }}
              bezier
              style={styles.miniChart}
            />
          </View>
        </View>
      </View>

      {/* Modern Tab Bar */}
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
        <ScrollView style={styles.mainContent}>
          {/* Time Frame Selector */}
          <View style={styles.timeFrameSelector}>
            {['daily', 'weekly', 'monthly'].map((period) => (
              <TouchableOpacity 
                key={period}
                style={[
                  styles.timeFrameButton, 
                  timeFrame === period && styles.activeTimeFrame
                ]}
                onPress={() => setTimeFrame(period as typeof timeFrame)}
              >
                <Text style={[
                  styles.timeFrameText, 
                  timeFrame === period && styles.activeTimeFrameText
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>
                  {timeFrame === 'daily' ? 'Today' : 
                   timeFrame === 'weekly' ? 'This Week' : 'This Month'}
                </Text>
                <Text style={styles.summaryAmount}>
                  ${summary[timeFrame].toFixed(2)}
                </Text>
                <Text style={styles.summaryChange}>+12.5%</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Average Daily</Text>
                <Text style={styles.summaryAmount}>
                  ${(summary[timeFrame] / 30).toFixed(2)}
                </Text>
                <Text style={styles.summaryChange}>-3.2%</Text>
              </View>
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
          <View style={styles.expensesContainer}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {expenses.length === 0 ? (
              <EmptyState
                icon="wallet-outline"
                title="No Expenses Yet"
                message="Add your first expense to start tracking your spending"
              />
            ) : (
              <View style={styles.expensesList}>
                {expenses.map((expense) => (
                  <Animated.View
                    key={expense.id}
                    style={styles.expenseItem}
                    entering={FadeIn}
                    layout={Layout.springify()}
                  >
                    <View style={styles.expenseContent}>
                      <View style={styles.expenseMainInfo}>
                        <Text style={styles.expenseDescription} numberOfLines={1}>
                          {expense.description}
                        </Text>
                        <Text style={styles.expenseAmount}>
                          ${expense.amount.toFixed(2)}
                        </Text>
                      </View>
                      
                      <View style={styles.expenseStats}>
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Category</Text>
                          <Text style={styles.statValue}>{expense.category}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text style={styles.statLabel}>Date</Text>
                          <Text style={styles.statValue}>
                            {formatDate(expense.date)}
                          </Text>
                        </View>
                        {expense.notes && (
                          <>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                              <Text style={styles.statLabel}>Notes</Text>
                              <Text style={styles.statValue} numberOfLines={1}>
                                {expense.notes}
                              </Text>
                            </View>
                          </>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
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
    padding: 24,
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: 'black',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  miniChart: {
    marginRight: -16,
  },
  mainContent: {
    flex: 1,
  },
  timeFrameSelector: {
    flexDirection: 'row',
    padding: 24,
    justifyContent: 'center',
    gap: 8,
  },
  timeFrameButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  activeTimeFrame: {
    backgroundColor: 'black',
  },
  timeFrameText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  activeTimeFrameText: {
    color: '#fff',
  },
  summaryContainer: {
    padding: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  summaryChange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  categoryBreakdown: {
    padding: 24,
  },
  // sectionTitle: {
  //   fontSize: 18,
  //   fontWeight: '600',
  //   color: '#1a1a1a',
  //   marginBottom: 16,
  // },
  categoryContainer: {
    paddingRight: 24,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minWidth: 150,
    
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#666',
  },
  expensesSection: {
    padding: 24,
  },
  // expenseItem: {
  //   backgroundColor: 'white',
  //   borderRadius: 16,
  //   borderWidth: 1,
  //   borderColor: '#f0f0f0',
  //   overflow: 'hidden',
  // },
  expenseMain: {
    gap: 12,
  },
  expenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // expenseDescription: {
  //   fontSize: 16,
  //   fontWeight: '500',
  //   color: '#1a1a1a',
  //   flex: 1,
  //   marginRight: 12,
  // },
  // expenseAmount: {
  //   fontSize: 16,
  //   fontWeight: '600',
  //   color: '#1a1a1a',
  // },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseNotes: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  // expensesList: {
  //   gap: 12,
  // },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expensesContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  expensesList: {
    gap: 12,
  },
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  expenseContent: {
    padding: 16,
  },
  expenseMainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  expenseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
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