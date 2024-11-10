import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { useInventory } from '../store/InventoryContext';
import { useAuth } from '../store/AuthContext';
import { useRouter } from 'expo-router';

const CustomAlerts = () => {
  const { userTier } = useAuth();
  const canUseAlerts = userTier === 'Premium' || userTier === 'Enterprise';
  const router = useRouter();

  if (!canUseAlerts) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Custom Alerts</Text>
        <Text style={styles.upgradeText}>
          Upgrade to Premium to set custom alerts
        </Text>
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/monetization')}
        >
          <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
  upgradeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CustomAlerts; 