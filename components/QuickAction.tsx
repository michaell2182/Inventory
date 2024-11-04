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
        <View style={styles.actionButton}>
          
        </View>
        <View style={styles.actionButton}>
         
        </View>
        <View style={styles.actionButton}>
        
        </View>
        <View style={styles.actionButton}>
         
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardsContainer: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    marginTop: 48,
    
  },
  actionItem: {
    backgroundColor: "#fff",
    borderRadius: 20,
    height: 100,
    flex: 1,
    padding: 16,
  },
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    color: '#6b7280',
  },
  amount: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginTop:32,
  },
  buttonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
  },
});

export default QuickAction; 