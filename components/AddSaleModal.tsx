import React, { useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';
import { useInventory } from '../store/InventoryContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  withTiming, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  FadeIn,
  FadeOut,
  Layout,
  withSequence,
} from 'react-native-reanimated';
import debounce from 'lodash/debounce';
import * as Haptics from 'expo-haptics';
import { checkAndNotifyLowStock } from '../services/notifications';

interface SelectedProduct {
  product: any;
  quantity: string;
}

interface AddSaleModalProps {
  visible: boolean;
  onClose: () => void;
  onSaleComplete: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AddSaleModal = ({ visible, onClose, onSaleComplete }: AddSaleModalProps) => {
  const { state: { products } } = useInventory();
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [notes, setNotes] = useState('');
  const [saleDate, setSaleDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notesHeight = useSharedValue(0);
  const notesPadding = useSharedValue(0);
  const notesBorder = useSharedValue(0);
  const searchInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchShake = useSharedValue(0);

  const availableProducts = products.filter(product => product.quantity > 0);

  const totalAmount = selectedProducts.reduce((sum, item) => {
    return sum + (item.product.price * parseInt(item.quantity || '0'));
  }, 0);

  // Enhanced debounced search with loading state
  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      try {
        setIsSearching(true);
        setSearchError(null);
        
        // Simulate search delay (remove this in production)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSearchQuery(text);
      } catch (error) {
        setSearchError('Failed to search products');
        // Trigger shake animation
        searchShake.value = withSequence(
          withTiming(10, { duration: 100 }),
          withTiming(-10, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Animated style for search error shake
  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: searchShake.value }],
  }));

  // Handle product selection with haptics
  const handleProductSelect = async (product: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const existingIndex = selectedProducts.findIndex(item => item.product.id === product.id);
    
    if (existingIndex >= 0) {
      setSelectedProducts(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      setSelectedProducts(prev => [...prev, { product, quantity: '1' }]);
    }
  };

  // Handle quantity change with haptics
  const handleQuantityChange = async (productId: string, quantity: string) => {
    await Haptics.selectionAsync();
    updateQuantity(productId, quantity);
  };

  // Handle notes toggle with haptics
  const handleNotesToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleNotes();
  };

  // Handle keyboard dismiss
  const handleScreenPress = () => {
    Keyboard.dismiss();
  };

  const filteredProducts = products
    .filter(product => product.quantity > 0)
    .filter(product => 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.price.toString().includes(searchQuery)
    );

  const toggleNotes = () => {
    if (!showNotes) {
      setShowNotes(true);
      notesHeight.value = withSpring(60);
      notesPadding.value = withSpring(12);
      notesBorder.value = withSpring(1);
    } else {
      notesHeight.value = withSpring(0);
      notesPadding.value = withSpring(0);
      notesBorder.value = withSpring(0);
      setTimeout(() => {
        setShowNotes(false);
        setNotes('');
      }, 300);
    }
  };

  const animatedNotesStyle = useAnimatedStyle(() => ({
    height: notesHeight.value,
    padding: notesPadding.value,
    borderWidth: notesBorder.value,
  }));

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSaleDate(selectedDate);
    }
  };

  const updateQuantity = (productId: string, quantity: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Validate quantity against stock
    const newQuantity = parseInt(quantity) || 0;
    if (newQuantity > product.quantity) {
      Alert.alert(
        'Invalid Quantity',
        `Maximum available quantity is ${product.quantity}`
      );
      return;
    }

    setSelectedProducts(prev => prev.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: quantity };
      }
      return item;
    }));
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

      // After successfully creating the sale, check stock levels
      const product = products.find(product => product.id === selectedProducts[0].product.id);
      if (!product) return;

      const updatedProduct = {
        ...product,
        quantity: product.quantity - parseInt(selectedProducts[0].quantity)
      };
      
      await checkAndNotifyLowStock(updatedProduct);

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
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.modalContainer}
          onPress={handleScreenPress}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Sale</Text>

            {/* Search Bar with loading state and error handling */}
            <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
              {isSearching ? (
                <ActivityIndicator size="small" color="#666" style={styles.searchIcon} />
              ) : (
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              )}
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search products..."
                onChangeText={(text) => {
                  setSearchError(null);
                  debouncedSearch(text);
                }}
                clearButtonMode="while-editing"
                returnKeyType="done"
              />
            </Animated.View>

            {/* Search Error Message */}
            {searchError && (
              <Animated.Text 
                style={styles.errorText}
                entering={FadeIn}
                exiting={FadeOut}
              >
                {searchError}
              </Animated.Text>
            )}

            {/* Product List with loading state */}
            <ScrollView ref={scrollViewRef} style={styles.productList}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000" />
                  <Text style={styles.loadingText}>Searching products...</Text>
                </View>
              ) : filteredProducts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#666" />
                  <Text style={styles.emptyText}>No products found</Text>
                </View>
              ) : (
                filteredProducts.map((product) => (
                  <AnimatedTouchable
                    key={product.id}
                    style={[
                      styles.productItem,
                      selectedProducts.some(item => item.product.id === product.id) && 
                      styles.selectedProduct
                    ]}
                    onPress={() => handleProductSelect(product)}
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    layout={Layout.springify()}
                  >
                    <View>
                      <Text style={styles.productTitle}>{product.title}</Text>
                      <Text style={styles.productPrice}>${product.price}</Text>
                    </View>
                    <Text style={styles.stockText}>In stock: {product.quantity}</Text>
                  </AnimatedTouchable>
                ))
              )}
            </ScrollView>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <Animated.View 
                style={styles.selectedProductsContainer}
                entering={FadeIn}
                layout={Layout.springify()}
              >
                <Text style={styles.sectionTitle}>Selected Items</Text>
                {selectedProducts.map((item) => (
                  <View key={item.product.id} style={styles.selectedProductItem}>
                    <View style={styles.productInfoContainer}>
                      <Text style={styles.selectedProductTitle}>
                        {item.product.title}
                      </Text>
                    </View>
                    <View style={styles.quantityPriceContainer}>
                      <TouchableOpacity 
                        onPress={() => handleQuantityChange(
                          item.product.id, 
                          String(Math.max(1, parseInt(item.quantity || '1') - 1))
                        )}
                        style={styles.quantityButton}
                      >
                        <Ionicons name="remove" size={20} color="#666" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.quantityInput}
                        value={item.quantity}
                        onChangeText={(text) => handleQuantityChange(item.product.id, text)}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                      <TouchableOpacity 
                        onPress={() => handleQuantityChange(
                          item.product.id, 
                          String(Math.min(item.product.quantity, parseInt(item.quantity || '1') + 1))
                        )}
                        style={styles.quantityButton}
                      >
                        <Ionicons name="add" size={20} color="#666" />
                      </TouchableOpacity>
                      <Text style={styles.itemTotal}>
                        ${(item.product.price * parseInt(item.quantity || '0')).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.totalAmount}>
                  Total: ${totalAmount.toFixed(2)}
                </Text>
              </Animated.View>
            )}

            {/* Notes Section */}
            <View style={styles.notesContainer}>
              <TouchableOpacity 
                style={styles.notesIcon}
                onPress={handleNotesToggle}
              >
                <Ionicons 
                  name={showNotes ? "remove-circle-outline" : "add-circle-outline"} 
                  size={24} 
                  color="#666" 
                />
                <Text style={styles.notesIconText}>
                  {showNotes ? 'Remove Note' : 'Add Note'}
                </Text>
              </TouchableOpacity>
              {showNotes && (
                <Animated.View 
                  style={[styles.notesInputContainer, animatedNotesStyle]}
                  entering={FadeIn}
                  exiting={FadeOut}
                >
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add sale notes..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={2}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </Animated.View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onClose();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  (selectedProducts.length === 0 || isLoading) && styles.disabledButton
                ]}
                onPress={async () => {
                  await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  handleSaleConfirm();
                }}
                disabled={selectedProducts.length === 0 || isLoading}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? 'Recording...' : 'Confirm Sale'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
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
    width: 50,
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
    paddingVertical: 8,
  },
  productInfoContainer: {
    flex: 1,
    marginRight: 12,
  },
  quantityPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 160,
    justifyContent: 'flex-end',
  },
  selectedProductTitle: {
    fontSize: 16,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '500',
    width: 80,
    textAlign: 'right',
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
    height: 60,
    fontSize: 16,
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
  notesContainer: {
    marginVertical: 12,
  },
  notesIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  notesIconText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  notesInputContainer: {
    overflow: 'hidden',
    borderColor: '#ddd',
    borderRadius: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 12,
  },
  quantityButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 4,
  },
});

export default AddSaleModal;