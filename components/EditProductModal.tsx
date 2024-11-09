import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Product } from '../types/inventory';
import { supabase } from '../lib/supabase';
import { useInventory } from '../store/InventoryContext';

type Props = {
  visible: boolean;
  onClose: () => void;
  product: Product | null;
};

const EditProductModal = ({ visible, onClose, product }: Props) => {
  const { fetchProducts } = useInventory();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [reorderPoint, setReorderPoint] = useState('');

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setPrice(product.price?.toString() || '');
      setQuantity(product.quantity?.toString() || '');
      setCategory(product.category || '');
      setSku(product.sku || '');
      setReorderPoint(product.reorder_point?.toString() || '');
    }
  }, [product]);

  const handleSave = async () => {
    if (!product) return;

    try {
      const updates: Partial<Product> = {};
      if (title !== product.title) updates.title = title;
      if (parseFloat(price) !== product.price) updates.price = parseFloat(price);
      if (parseInt(quantity) !== product.quantity) updates.quantity = parseInt(quantity);
      if (category !== product.category) updates.category = category;
      if (sku !== product.sku) updates.sku = sku;
      if (reorderPoint !== product.reorder_point?.toString()) {
        updates.reorder_point = reorderPoint ? parseInt(reorderPoint) : undefined;
      }

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product.id);

      if (error) throw error;
      
      await fetchProducts();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Product</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Product title"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category (Optional)</Text>
            <TextInput
              style={styles.input}
              value={category}
              onChangeText={setCategory}
              placeholder="Category"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SKU (Optional)</Text>
            <TextInput
              style={styles.input}
              value={sku}
              onChangeText={setSku}
              placeholder="SKU"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Reorder Point (Optional)</Text>
            <TextInput
              style={styles.input}
              value={reorderPoint}
              onChangeText={setReorderPoint}
              keyboardType="number-pad"
              placeholder="0"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  saveButton: {
    backgroundColor: '#1a1a1a',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
  },
});

export default EditProductModal; 