import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import { useInventory } from '../store/InventoryContext';

const CustomAlerts = () => {
  const { products } = useInventory();
  const [threshold, setThreshold] = useState(5); // Example threshold

  const handleSetAlert = () => {
    // Logic to set alerts based on threshold
    alert(`Alert set for products below ${threshold} in stock.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Alerts</Text>
      <TextInput
        style={styles.input}
        placeholder="Set low stock threshold"
        keyboardType="numeric"
        value={String(threshold)}
        onChangeText={setThreshold}
      />
      <Button title="Set Alert" onPress={handleSetAlert} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
});

export default CustomAlerts; 