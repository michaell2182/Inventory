import React from "react";
import { View, StyleSheet, Text } from "react-native";

const QuickAction = () => {
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
          </View>
          <Text style={styles.amount}>$296,913.00</Text>
        </View>
        <View style={styles.actionItem}>
          <View style={styles.topContainer}>
            <View style={styles.circle}>
              <Text style={styles.icon}>$</Text>
            </View>
            <Text style={styles.label}>SALES COST</Text>
          </View>
          <Text style={styles.amount}>$9,981.00</Text>
        </View>
      </View>

      {/* Bottom Quick Action Buttons */}
      <View style={styles.buttonsContainer}>
        <View style={styles.topButtons}>
          <View style={[styles.actionButton, styles.activeButton]}>
            <Text style={[styles.buttonText, styles.activeButtonText]}>Today</Text>
          </View>
          <View style={[styles.actionButton, { marginHorizontal: 8 }]}>
            <Text style={styles.buttonText}>This Week</Text>
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.buttonText}>This Month</Text>
          </View>
        </View>
        <View style={[styles.actionButton, styles.customButton]}>
          <Text style={styles.customButtonText}>Custom</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 24,
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
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
    width: '80%',
    alignSelf: 'center', 
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  activeButton: {
    backgroundColor: '#000',
  },
  customButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeButtonText: {
    color: '#fff',
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default QuickAction; 