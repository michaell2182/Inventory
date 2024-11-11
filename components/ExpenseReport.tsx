import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../store/AuthContext';
import type { SubscriptionTier } from '../lib/TierManager';

const ExpenseReport = () => {
  const { session, userTier } = useAuth();
  const [options, setOptions] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    format: 'PDF',
    category: '',
  });
  const [generating, setGenerating] = useState(false);

  // Helper function to check if user can generate reports
  const canGenerateReport = () => {
    return userTier === 'Premium' || userTier === 'Enterprise';
  };

  const generateReport = async () => {
    // Early return if user doesn't have required tier
    if (!canGenerateReport()) {
      alert('Please upgrade to Premium or Enterprise to generate reports');
      return;
    }

    setGenerating(true);
    try {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', options.startDate.toISOString())
        .lte('date', options.endDate.toISOString())
        .ilike('category', `%${options.category}%`);

      if (error) throw error;

      const reportContent = expenses
        .map(e => `${e.date},${e.description},${e.amount}`)
        .join('\n');

      const fileName = `expenses_${new Date().getTime()}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, reportContent);
      await Sharing.shareAsync(filePath);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    } finally {
      setGenerating(false);
    }
  };

  // Determine button styles and content based on tier and generating state
  const buttonStyle = [
    styles.generateButton,
    !canGenerateReport() && styles.disabledButton
  ];

  const renderButtonContent = () => {
    if (generating) {
      return <ActivityIndicator color="#fff" />;
    }

    return (
      <>
        <Text style={styles.generateButtonText}>Generate Report</Text>
        {!canGenerateReport() && (
          <Text style={styles.upgradeText}>
            Upgrade to Premium to generate reports
          </Text>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Report</Text>
      <TouchableOpacity
        style={buttonStyle}
        onPress={generateReport}
        disabled={!canGenerateReport() || generating}
      >
        {renderButtonContent()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  generateButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  upgradeText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ExpenseReport;