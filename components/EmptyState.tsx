import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

const EmptyState = ({ icon, title, message }: EmptyStateProps) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={32} color="#666" />
    </View>
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState; 