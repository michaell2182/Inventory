import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { Picker } from '@react-native-picker/picker';

const EXPENSE_CATEGORIES = [
  'Supplies',
  'Equipment',
  'Utilities',
  'Rent',
  'Marketing',
  'Salary',
  'Other',
];

interface AddBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  onBudgetAdded: () => void;
}

const AddBudgetModal = ({ visible, onClose, onBudgetAdded }: AddBudgetModalProps) => {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [notifications, setNotifications] = useState(true);
  const [notes, setNotes] = useState('');
  
  const handleSubmit = async () => {
    if (!category || !limit) {
      alert('Please fill in required fields');
      return;
    }

    try {
      const budgetData = {
        category,
        budget_limit: parseFloat(limit),
        period,
        notifications,
        notes,
        spent: 0,
      };
      console.log('Attempting to insert budget:', budgetData);

      const { data, error } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Successfully added budget:', data);
      onBudgetAdded();
      onClose();
    } catch (error) {
      console.error('Detailed error:', {
        error,
        category,
        limit,
        period,
        notifications,
      });
      alert('Error adding budget. Please check console for details.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Budget</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Category *</Text>
            <Picker
              selectedValue={category}
              onValueChange={setCategory}
              style={styles.picker}
            >
              <Picker.Item label="Select a category" value="" />
              {EXPENSE_CATEGORIES.map((cat) => (
                <Picker.Item key={cat} label={cat} value={cat} />
              ))}
            </Picker>

            <Text style={styles.label}>Monthly Limit *</Text>
            <TextInput
              style={styles.input}
              value={limit}
              onChangeText={setLimit}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Period</Text>
            <View style={styles.periodButtons}>
              {['weekly', 'monthly', 'yearly'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodButton,
                    period === p && styles.selectedPeriod,
                  ]}
                  onPress={() => setPeriod(p as typeof period)}
                >
                  <Text style={[
                    styles.periodButtonText,
                    period === p && styles.selectedPeriodText,
                  ]}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.notificationContainer}>
              <Text style={styles.label}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            </View>

            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes..."
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Add Budget</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  form: {
    flex: 1,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  periodButtonText: {
    color: '#666',
  },
  selectedPeriodText: {
    color: '#fff',
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddBudgetModal; 