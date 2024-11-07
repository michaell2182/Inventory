import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Svg, Path } from "react-native-svg";
import { useRouter } from 'expo-router';

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

  const handleSalesPress = () => {
    router.push('/sales');
  };

  const handleExpensesPress = () => {
    router.push('expenses');
  };

  return (
    <View>
      {/* Top Cards */}
      <View style={styles.cardsContainer}>
        <View style={styles.actionItem}>
          <View style={styles.topContainer}>
            <View style={styles.circle}>
              <Text style={styles.icon}>$</Text>
            </View>
            <Text style={styles.label}>PROFIT</Text>
            <View style={styles.trendContainer}>
              <UpTrendIcon />
            </View>
          </View>
          <Text style={styles.amount}>$296,913.00</Text>
        </View>
        <View style={styles.actionItem}>
          <View style={styles.topContainer}>
            <View style={styles.circle}>
              <Text style={styles.icon}>$</Text>
            </View>
            <Text style={styles.label}>SALES COST</Text>
            <View style={styles.trendContainer}>
              <DownTrendIcon />
            </View>
          </View>
          <Text style={styles.amount}>$9,981.00</Text>
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
    paddingHorizontal: 24,
    marginTop: 0,
  },
  actionItem: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    color: '#6b7280',
  },
  amount: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
    color: '#111827',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  buttonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
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
    textAlign: 'center',
  },
  trendContainer: {
    marginLeft: 'auto',
  },
});

export default QuickAction; 