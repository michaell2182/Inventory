import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';
import EmptyState from './EmptyState';
import { useAuth } from '../store/AuthContext';
import { useRouter } from 'expo-router';

interface AnalyticsData {
  trendData: {
    dates: string[];
    amounts: number[];
  };
  advancedData: {
    predictedExpenses: number[];
    seasonalTrends: number[];
    varianceAnalysis: number[];
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
  const { userTier } = useAuth();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  const isPremiumUser = userTier === 'Premium' || userTier === 'Enterprise';

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
      fontSize: 10,
    },
  };

  const advancedChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo color for premium charts
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

      // Process basic analytics data
      const dailyTotals: Record<string, number> = {};
      const last7Days = [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString();
      }).reverse();

      last7Days.forEach(date => {
        dailyTotals[date] = 0;
      });

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

      // Generate mock advanced analytics data for premium users
      const advancedData = {
        predictedExpenses: amounts.map(amount => amount * 1.1), // Simple prediction
        seasonalTrends: amounts.map(amount => amount * (1 + Math.random() * 0.2)),
        varianceAnalysis: amounts.map(amount => amount * (1 + Math.random() * 0.3 - 0.15)),
      };

      setAnalytics({
        trendData: {
          dates: dates.map(date => date.split('/').slice(0, 2).join('/')),
          amounts,
        },
        advancedData,
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

  const handleUpgradePress = () => {
    router.push('/monetization');
  };

  const renderAdvancedAnalytics = () => {
    if (!isPremiumUser) {
      return (
        <View style={styles.premiumCard}>
          <Text style={styles.premiumTitle}>Advanced Analytics</Text>
          <Text style={styles.premiumDescription}>
            Upgrade to Premium to unlock advanced analytics including:
          </Text>
          <View style={styles.premiumFeatures}>
            <Text style={styles.premiumFeature}>• Profit Margin Analysis by Product</Text>
            <Text style={styles.premiumFeature}>• Sales Funnel Visualization</Text>
            <Text style={styles.premiumFeature}>• Automated Restock Alerts</Text>
            <Text style={styles.premiumFeature}>• Expiry Date Tracking and Alerts</Text>
          </View>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgradePress}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!analytics?.advancedData) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Advanced Analytics</Text>
        <Text style={styles.subtitle}>Expense Predictions vs Actual</Text>
        <LineChart
          data={{
            labels: analytics.trendData.dates,
            datasets: [
              {
                data: analytics.trendData.amounts,
                color: () => 'rgba(0, 0, 0, 0.5)',
              },
              {
                data: analytics.advancedData.predictedExpenses,
                color: () => 'rgba(79, 70, 229, 0.5)',
              },
            ],
          }}
          width={screenWidth - 32}
          height={220}
          chartConfig={advancedChartConfig}
          bezier
          style={styles.chart}
          legend={['Actual', 'Predicted']}
        />
      </View>
    );
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
      {renderAdvancedAnalytics()}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Spending Trend</Text>
        <LineChart
          data={{
            labels: analytics.trendData.dates,
            datasets: [{
              data: analytics.trendData.amounts.length > 0 
                ? analytics.trendData.amounts 
                : [0],
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
  premiumCard: {
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4f46e5',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  premiumFeatures: {
    marginBottom: 16,
  },
  premiumFeature: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
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
  upgradeButton: {
    backgroundColor: '#4f46e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExpenseAnalytics;