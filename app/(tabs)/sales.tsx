import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import AddSaleModal from '../../components/AddSaleModal';
import { InventoryProvider } from '../../store/InventoryContext';
import Nav from '../../components/Nav';
import EmptyState from '../../components/EmptyState';
import { useNavigation } from '@react-navigation/native';

interface SalesMetrics {
  totalSales: number;
  averageSale: number;
  totalItemsSold: number;
  averageItemsPerSale: number;
}

interface SaleRecord {
  id: string;
  product_id: string;
  quantity_sold: number;
  sale_price: number;
  sale_date: string;
  product: {
    title: string;
    price: number;
  };
}

const SalesScreen = () => {
  const [metrics, setMetrics] = useState<SalesMetrics>({
    totalSales: 0,
    averageSale: 0,
    totalItemsSold: 0,
    averageItemsPerSale: 0,
  });
  const [recentSales, setRecentSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchSalesData();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: true,
    });
  }, [navigation]);

  const fetchSalesData = async () => {
    try {
      // Fetch sales records with product details
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          *,
          product:products(title, price)
        `)
        .order('sale_date', { ascending: false });

      if (error) throw error;

      if (sales) {
        setRecentSales(sales);
        
        // Calculate metrics
        const totalSales = sales.reduce((sum, sale) => sum + sale.sale_price, 0);
        const totalItems = sales.reduce((sum, sale) => sum + sale.quantity_sold, 0);
        
        setMetrics({
          totalSales,
          averageSale: totalSales / sales.length || 0,
          totalItemsSold: totalItems,
          averageItemsPerSale: totalItems / sales.length || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    labels: ["1D", "1W", "1M", "3M", "1Y"],
    datasets: [{
      data: [7000, 8500, 7500, 9000, 7943],
      color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    }]
  };

  const handleSaleComplete = () => {
    fetchSalesData(); // Refresh the sales data
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Nav />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Modern Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Sales</Text>
            <TouchableOpacity 
              style={styles.addSaleButton}
              onPress={() => setShowSaleModal(true)}
            >
              <Text style={styles.addSaleButtonText}>+ Add Sale</Text>
            </TouchableOpacity>
          </View>
          
          {/* Revenue Card */}
          <View style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Total Revenue</Text>
            <View style={styles.revenueRow}>
              <Text style={styles.revenueAmount}>${metrics.totalSales.toLocaleString()}</Text>
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
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  strokeWidth: 2,
                }}
                bezier
                style={styles.miniChart}
              />
            </View>
            <View style={styles.periodContainer}>
              <Text style={styles.periodLabel}>vs. last month</Text>
              <View style={styles.changeIndicator}>
                <Text style={styles.positiveChange}>+12%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Modern 2x2 Metrics Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${metrics.totalSales.toLocaleString()}</Text>
              <Text style={styles.metricTitle}>Total Sales</Text>
              <Text style={styles.metricChange}>+13%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>${metrics.averageSale.toLocaleString()}</Text>
              <Text style={styles.metricTitle}>Average Sale</Text>
              <Text style={styles.metricChange}>+16%</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.totalItemsSold}</Text>
              <Text style={styles.metricTitle}>Items Sold</Text>
              <Text style={styles.metricChange}>+14%</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{metrics.averageItemsPerSale.toFixed(1)}</Text>
              <Text style={styles.metricTitle}>Avg Items/Sale</Text>
              <Text style={styles.metricChange}>+15%</Text>
            </View>
          </View>
        </View>

        {/* Items Sold List */}
        <View style={styles.salesContainer}>
          <Text style={styles.sectionTitle}>Items Sold</Text>
          {recentSales.length === 0 ? (
            <EmptyState
              icon="cart-outline"
              title="No Sales Yet"
              message="Record your first sale to start tracking your revenue"
            />
          ) : (
            recentSales.map((sale) => (
              <View key={sale.id} style={styles.saleItem}>
                <View style={styles.saleHeader}>
                  <View>
                    <Text style={styles.productTitle}>{sale.product.title}</Text>
                    <Text style={styles.soldText}>Sold: {sale.quantity_sold}</Text>
                  </View>
                  <Text style={styles.salePrice}>${sale.sale_price.toFixed(0)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <AddSaleModal
        visible={showSaleModal}
        onClose={() => setShowSaleModal(false)}
        onSaleComplete={handleSaleComplete}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
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
  addSaleButton: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addSaleButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  revenueCard: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  revenueLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  revenueAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  periodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 14,
    color: '#666',
  },
  changeIndicator: {
    marginLeft: 8,
  },
  positiveChange: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  metricsContainer: {
    padding: 12,
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  metricChange: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '600',
  },
  salesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  saleItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  soldText: {
    fontSize: 14,
    color: '#666',
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  miniChart: {
    paddingRight: -16,
    marginRight: -16,
  },
});

export default SalesScreen; 