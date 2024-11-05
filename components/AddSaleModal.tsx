import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { useInventory } from '../store/InventoryContext';

interface SelectedProduct {
  product: any;
  quantity: string;
}

interface AddSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSaleComplete: () => void;
}

const AddSaleModal = ({ visible, onClose, onSaleComplete }: AddSaleModalProps) => {
  const { state: { products } } = useInventory();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [notes, setNotes] = useState('');
  const [saleDate, setSaleDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalAmount = selectedProducts.reduce((sum, item) => {
    return sum + (item.product.price * parseInt(item.quantity || '0'));
  }, 0);

  const handleProductSelect = (product: any) => {
    const existingIndex = selectedProducts.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      // Remove product if already selected
      setSelectedProducts(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add new product with quantity 1
      setSelectedProducts(prev => [...prev, { product, quantity: '1' }]);
    }
  };

  const updateQuantity = (productId: string, quantity: string) => {
    setSelectedProducts(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSaleDate(selectedDate);
    }
  };

  const handleSaleConfirm = async () => {
    if (selectedProducts.length === 0) return;

    setIsLoading(true);
    try {
      // Record each product sale
      for (const item of selectedProducts) {
        const { error: saleError } = await supabase
          .from('sales')
          .insert({
            product_id: item.product.id,
            quantity_sold: parseInt(item.quantity),
            sale_price: item.product.price * parseInt(item.quantity),
            sale_date: saleDate.toISOString(),
            notes: notes,
          });

        if (saleError) throw saleError;

        // Update product quantity
        const newQuantity = item.product.quantity - parseInt(item.quantity);
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity: newQuantity })
          .eq('id', item.product.id);

        if (updateError) throw updateError;
      }

      onSaleComplete();
      onClose();
      // Reset form
      setSelectedProducts([]);
      setNotes('');
      setSaleDate(new Date());
    } catch (error) {
      console.error('Error recording sale:', error);
      alert('Error recording sale');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Record Sale</Text>
          
          {/* Date Selection */}
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              Sale Date: {saleDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={saleDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* Product List */}
          <ScrollView style={styles.productList}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productItem,
                  selectedProducts.some(item => item.product.id === product.id) && 
                  styles.selectedProduct
                ]}
                onPress={() => handleProductSelect(product)}
              >
                <View>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.productPrice}>${product.price}</Text>
                </View>
                <Text style={styles.stockText}>In stock: {product.quantity}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <View style={styles.selectedProductsContainer}>
              <Text style={styles.sectionTitle}>Selected Items</Text>
              {selectedProducts.map((item) => (
                <View key={item.product.id} style={styles.selectedProductItem}>
                  <Text style={styles.selectedProductTitle}>
                    {item.product.title}
                  </Text>
                  <View style={styles.quantityContainer}>
                    <TextInput
                      style={styles.quantityInput}
                      value={item.quantity}
                      onChangeText={(text) => updateQuantity(item.product.id, text)}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                    <Text style={styles.itemTotal}>
                      ${(item.product.price * parseInt(item.quantity || '0')).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
              <Text style={styles.totalAmount}>
                Total: ${totalAmount.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Notes Input */}
          <TextInput
            style={styles.notesInput}
            placeholder="Add sale notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                (selectedProducts.length === 0 || isLoading) && styles.disabledButton
              ]}
              onPress={handleSaleConfirm}
              disabled={selectedProducts.length === 0 || isLoading}
            >
              <Text style={styles.confirmButtonText}>
                {isLoading ? 'Recording...' : 'Confirm Sale'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  productList: {
    maxHeight: 300,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
  },
  selectedProduct: {
    borderColor: '#000',
    backgroundColor: '#f8f8f8',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    color: '#666',
  },
  stockText: {
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#000',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  selectedProductsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  selectedProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedProductTitle: {
    fontSize: 16,
    flex: 1,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 20,
    minHeight: 80,
  },
  dateButton: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AddSaleModal;