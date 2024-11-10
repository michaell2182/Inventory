import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';

const ShippingNotification = () => {
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
});

export default ShippingNotification; 