import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ReportOptions {
  startDate: Date;
  endDate: Date;
  format: 'PDF' | 'CSV' | 'EXCEL';
  includeCategories: boolean;
  includeTags: boolean;
  includeNotes: boolean;
}

const ExpenseReport = () => {
  const [options, setOptions] = useState<ReportOptions>({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    format: 'PDF',
    includeCategories: true,
    includeTags: true,
    includeNotes: false,
  });
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Fetch expenses for the date range
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', options.startDate.toISOString())
        .lte('date', options.endDate.toISOString());

      if (error) throw error;

      // Generate report content based on format
      // This is a simplified example - you'd want to add more formatting
      const reportContent = expenses
        .map(e => `${e.date},${e.description},${e.amount}`)
        .join('\n');

      // Save and share the file
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Report</Text>
      
      <View style={styles.optionsContainer}>
        {/* Add date pickers and format options here */}
      </View>

      <TouchableOpacity
        style={styles.generateButton}
        onPress={generateReport}
        disabled={generating}
      >
        {generating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Report</Text>
        )}
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
  optionsContainer: {
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
});

export default ExpenseReport; 