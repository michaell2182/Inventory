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
import EmptyState from './EmptyState';

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
  const [isLoading, setIsLoading] = useState(true);
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
    propsForLabels: {
      fontSize: 10, // Smaller font size for labels
    },
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date');

      if (error) throw error;
      if (!expenses || expenses.length === 0) {
        setAnalytics(null);
        return;
      }

      // Process data for charts - only show last 7 days
      const dailyTotals: Record<string, number> = {};
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString();
      }).reverse();

      // Initialize all dates with 0
      last7Days.forEach(date => {
        dailyTotals[date] = 0;
      });

      // Add actual expenses
      expenses.forEach(expense => {
        const date = new Date(expense.date).toLocaleDateString();
        if (dailyTotals[date] !== undefined) {
          dailyTotals[date] += expense.amount;
        }
      });

      const dates = Object.keys(dailyTotals);
      const amounts = Object.values(dailyTotals);
      const totalSpent = amounts.reduce((sum, amount) => sum + amount, 0);
      const averageDaily = totalSpent / amounts.length;

      setAnalytics({
        trendData: {
          dates: dates.map(date => date.split('/').slice(0, 2).join('/')), // Shorter date format
          amounts,
        },
        yearOverYear: 0,
        averageDaily,
        projectedMonthly: averageDaily * 30,
        topCategories: [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="bar-chart-outline"
          title="Loading analytics..."
          message="Please wait while we crunch the numbers"
        />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="bar-chart-outline"
          title="No Data Available"
          message="Add some expenses to see your analytics"
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending Trend</Text>
        <LineChart
          data={{
            labels: analytics.trendData.dates,
            datasets: [{
              data: analytics.trendData.amounts.length > 0 
                ? analytics.trendData.amounts 
                : [0], // Fallback if no data
            }]
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withVerticalLabels={true}
          withHorizontalLabels={true}
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
          <Text style={styles.insightLabel}>Monthly Projected</Text>
          <Text style={styles.insightValue}>
            ${analytics.projectedMonthly.toFixed(2)}
          </Text>
        </View>
      </View>
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