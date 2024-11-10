import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Svg, Path } from "react-native-svg";
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

const UpTrendIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 17L9 11L13 15L21 7M21 7H15M21 7V13" 
      stroke="#16A34A" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const DownTrendIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path 
      d="M3 7L9 13L13 9L21 17M21 17V11M21 17H15" 
      stroke="#DC2626" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </Svg>
);

const QuickAction = () => {
  const router = useRouter();
  const { userTier } = useAuth();
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    fetchTotals();
  }, []);

  const fetchTotals = async () => {
    try {
      // Fetch total revenue from sales
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('amount');
      
      if (salesError) throw salesError;
      
      const revenue = salesData?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0;
      setTotalRevenue(revenue);

      // Fetch total expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount');
      
      if (expensesError) throw expensesError;
      
      const expenses = expensesData?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      setTotalExpenses(expenses);

    } catch (error) {
      console.error('Error fetching totals:', error);
    }
  };

  const handleSalesPress = () => {
    router.push('/sales');
  };

  const handleExpensesPress = () => {
    router.push('/expenses');
  };

  return (
    <View>
      {/* Top Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.revenueCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Total Revenue</Text>
            <View style={[styles.badge, styles.positiveBadge]}>
              <Text style={styles.badgeText}>+2.5%</Text>
            </View>
          </View>
          <Text style={styles.amount}>${totalRevenue.toFixed(2)}</Text>
          <View style={styles.trendContainer}>
            <UpTrendIcon />
            <Text style={styles.trendText}>vs last month</Text>
          </View>
        </View>

        <View style={styles.revenueCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Total Expenses</Text>
            <View style={[styles.badge, styles.negativeBadge]}>
              <Text style={styles.badgeText}>-1.5%</Text>
            </View>
          </View>
          <Text style={styles.amount}>${totalExpenses.toFixed(2)}</Text>
          <View style={styles.trendContainer}>
            <DownTrendIcon />
            <Text style={styles.trendText}>vs last month</Text>
          </View>
        </View>
      </View>

      {/* Bottom Quick Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.darkButton]}
          onPress={handleExpensesPress}
        >
          <Text style={styles.buttonText}>Expenses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.darkButton]}
          onPress={handleSalesPress}
        >
          <Text style={styles.buttonText}>Sales Record</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 16,
  },
  revenueCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    // shadowColor: '#000',
    // shadowOffset: {
    //   width: 0,
    //   height: 2,
    // },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positiveBadge: {
    backgroundColor: '#dcfce7',
  },
  negativeBadge: {
    backgroundColor: '#fee2e2',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginVertical: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendText: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  darkButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default QuickAction; 