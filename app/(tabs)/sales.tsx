import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import AddSaleModal from '../../components/AddSaleModal';
import { InventoryProvider } from '../../store/InventoryContext';
import Nav from '../../components/Nav';

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

  useEffect(() => {
    fetchSalesData();
  }, []);

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
    <InventoryProvider>
      <SafeAreaView style={styles.container}>
        <Nav />
        <ScrollView>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sales Report</Text>
            <View style={styles.totalSalesContainer}>
              <Text style={styles.totalSalesLabel}>Total Sales</Text>
              <Text style={styles.totalSalesAmount}>${metrics.totalSales.toFixed(0)}</Text>
              <Text style={styles.periodLabel}>Last 30 Days <Text style={styles.positiveChange}>+12%</Text></Text>
            </View>

            {/* Chart */}
            <LineChart
              data={chartData}
              width={Dimensions.get('window').width - 32}
              height={200}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
              withDots={false}
              withVerticalLines={false}
              withHorizontalLines={false}
            />
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Sales</Text>
                <Text style={styles.metricValue}>${metrics.totalSales.toFixed(0)}</Text>
                <Text style={styles.positiveChange}>+13%</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Average Sales</Text>
                <Text style={styles.metricValue}>${metrics.averageSale.toFixed(0)}</Text>
                <Text style={styles.positiveChange}>+16%</Text>
              </View>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Total Items Sold</Text>
                <Text style={styles.metricValue}>{metrics.totalItemsSold}</Text>
                <Text style={styles.positiveChange}>+14%</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricTitle}>Average Items Sold</Text>
                <Text style={styles.metricValue}>{metrics.averageItemsPerSale.toFixed(1)}</Text>
                <Text style={styles.positiveChange}>+15%</Text>
              </View>
            </View>
          </View>

          {/* Add this button before or after your metrics grid */}
          <TouchableOpacity 
            style={styles.addSaleButton}
            onPress={() => setShowSaleModal(true)}
          >
            <Text style={styles.addSaleButtonText}>Record New Sale</Text>
          </TouchableOpacity>

          {/* Items Sold List */}
          <View style={styles.salesContainer}>
            <Text style={styles.sectionTitle}>Items Sold</Text>
            {recentSales.map((sale) => (
              <View key={sale.id} style={styles.saleItem}>
                <View style={styles.saleHeader}>
                  <View>
                    <Text style={styles.productTitle}>{sale.product.title}</Text>
                    <Text style={styles.soldText}>Sold: {sale.quantity_sold}</Text>
                  </View>
                  <Text style={styles.salePrice}>${sale.sale_price.toFixed(0)}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <AddSaleModal
          visible={showSaleModal}
          onClose={() => setShowSaleModal(false)}
          onSaleComplete={handleSaleComplete}
        />
      </SafeAreaView>
    </InventoryProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  totalSalesContainer: {
    marginBottom: 24,
  },
  totalSalesLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  totalSalesAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 14,
    color: '#666',
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
  },
  metricsGrid: {
    padding: 16,
    gap: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  positiveChange: {
    color: '#22c55e',
    fontSize: 14,
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
  addSaleButton: {
    backgroundColor: '#000',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addSaleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SalesScreen; 