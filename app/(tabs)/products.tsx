import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../store/InventoryContext';
import { Product } from '../../types/inventory';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import EditProductModal from '../../components/EditProductModal';
import { useFocusEffect } from 'expo-router';
import ImagePickerModal from '../../components/ImagePickerModal';
import AddProductForm from '../../components/AddProductForm';
import * as ImagePicker from 'expo-image-picker';

const ProductList = () => {
  const { products, fetchProducts } = useInventory();
  const [refreshing, setRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const router = useRouter();
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditModalVisible(true);
  };

  const handleDelete = async (product: Product) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', product.id);
              
              if (error) throw error;
              await fetchProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleEdit(item)}
    >
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.productImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={24} color="#9ca3af" />
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Price</Text>
            <Text style={styles.statValue}>${item.price.toFixed(2)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Stock</Text>
            <Text style={styles.statValue}>{item.quantity}</Text>
          </View>
          {item.reorder_point && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Reorder at</Text>
                <Text style={styles.statValue}>{item.reorder_point}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.categoryChip}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleCamera = async () => {
    setImagePickerVisible(false);
    
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFormVisible(true);
    }
  };

  const handleGallery = async () => {
    setImagePickerVisible(false);
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Gallery permission is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFormVisible(true);
    }
  };

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="cube-outline" size={32} color="#666" />
        </View>
        <Text style={styles.emptyStateTitle}>No Products Found</Text>
        <Text style={styles.emptyStateText}>
          Start building your inventory by adding your first product.
        </Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setImagePickerVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      <ImagePickerModal
        visible={imagePickerVisible}
        onClose={() => setImagePickerVisible(false)}
        onSelectCamera={handleCamera}
        onSelectGallery={handleGallery}
      />

      {selectedImage && (
        <AddProductForm
          visible={formVisible}
          onClose={() => {
            setFormVisible(false);
            setSelectedImage(null);
          }}
          imageUri={selectedImage}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {products.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <EditProductModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 80,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 160,
    backgroundColor: '#f3f4f6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  productDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#64748b',
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 300,
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 12,
  },
  categoryChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
});

export default ProductList; 