import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  trendData: {
    dates: string[];
    amounts: number[];
  };
  yearOverYear: number;
  averageDaily: number;
  projectedMonthly: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

const ExpenseAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch last 30 days of expenses
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date');

      if (error) throw error;

      // Process data for charts
      const dailyTotals = expenses.reduce((acc: Record<string, number>, expense) => {
        const date = new Date(expense.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + expense.amount;
        return acc;
      }, {});

      const dates = Object.keys(dailyTotals).slice(-7); // Last 7 days
      const amounts = dates.map(date => dailyTotals[date]);

      // Calculate analytics
      const totalSpent = amounts.reduce((sum, amount) => sum + amount, 0);
      const averageDaily = totalSpent / amounts.length;

      setAnalytics({
        trendData: {
          dates,
          amounts,
        },
        yearOverYear: 0, // Calculate if you have historical data
        averageDaily,
        projectedMonthly: averageDaily * 30,
        topCategories: [], // Add category calculations
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {analytics && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Spending Trend</Text>
            <LineChart
              data={{
                labels: analytics.trendData.dates,
                datasets: [{
                  data: analytics.trendData.amounts
                }]
              }}
              width={screenWidth - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Daily Average</Text>
              <Text style={styles.insightValue}>
                ${analytics.averageDaily.toFixed(2)}
              </Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightLabel}>Year over Year</Text>
              <Text style={styles.insightValue}>
                {analytics.yearOverYear > 0 ? '+' : ''}
                {analytics.yearOverYear}%
              </Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  insightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '600',
  },
});

export default ExpenseAnalytics; 