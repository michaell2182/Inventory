import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../store/AuthContext';

const ShippingNotification = () => {
  const { userTier } = useAuth();
  const canUseNotifications = userTier === 'Premium' || userTier === 'Enterprise';
  const router = useRouter();

  if (!canUseNotifications) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Shipping Notification</Text>
        <Text style={styles.upgradeText}>
          Upgrade to Premium to use shipping notifications
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

  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const handleNotify = () => {
    // Logic to notify user when the package is delivered
    alert(`Notification set for tracking number: ${trackingNumber}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shipping Notification</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Tracking Number"
        value={trackingNumber}
        onChangeText={setTrackingNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Estimated Delivery Date"
        value={estimatedDelivery}
        onChangeText={setEstimatedDelivery}
      />
      <Button title="Notify Me" onPress={handleNotify} />
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

export default ShippingNotification; 