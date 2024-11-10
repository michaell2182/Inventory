import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useInventory } from '../store/InventoryContext';
import { Product } from '../types/inventory';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const ListItem = ({ item, onPress }: { item: Product; onPress: () => void }) => {
  const router = useRouter();

  // Function to handle the ellipsis icon press
  const handleEllipsisPress = () => {
    router.push('/products');  // Navigate to the products tab
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.listItem}>
      <View style={styles.leftContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {/* <TouchableOpacity onPress={handleEllipsisPress} style={styles.ellipsisButton}>
            <Ionicons name="ellipsis-horizontal-outline" size={20} color="black" />
          </TouchableOpacity> */}
        </View>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)} · {item.quantity} QTY</Text>
        <View style={styles.detailsWrapper}>
          <Text style={styles.detailsButton}>Details</Text>
        </View>
      </View>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.image} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const ListHeader = () => (
  <View style={styles.headerLine} />
);

const EmptyState = () => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyStateContent}>
      <View style={styles.iconContainer}>
        <Ionicons name="cube-outline" size={32} color="#666" />
      </View>
      <Text style={styles.emptyStateTitle}>No Products Yet</Text>
      <Text style={styles.emptyStateText}>
        Your inventory list is empty. Add your first product to get started.
      </Text>
    </View>
  </View>
);

const MiniList = () => {
  const { state, fetchProducts } = useInventory();
  const { products, isLoading } = state;
  const router = useRouter();

  // Add focus effect to refresh data
  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, [])
  );

  // Limit to 5 most recent products, sorted by date
  const limitedProducts = products
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);

  const handleViewAll = () => {
    router.push('/products');
  };

  const handleMorePress = (product: Product) => {
    router.push('/products');
  };

  if (isLoading) {
    return <View style={styles.wrapper}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Products</Text>
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={limitedProducts}
            renderItem={({ item }) => (
              <ListItem 
                item={item} 
                onPress={() => {}}
              />
            )}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            bounces={true}
            overScrollMode="never"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 0,
    paddingHorizontal: 0,
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 24,
  },
  listContent: {
    padding: 8,
  },
  headerLine: {

  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb85',
    borderRadius: 12,
    marginBottom: 8,
  },
  leftContent: {
    gap: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  ellipsisButton: {
    padding: 4,  // Add some padding for better touch target
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsWrapper: {
    backgroundColor: '#efefef',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  detailsButton: {
    fontSize: 14,
    color: 'black',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    backgroundColor: '#f3f4f6',
    width: '100%',
    height: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingLeft: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 24,
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
  moreButton: {
    padding: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllButton: {
    padding: 8,
  },
});

export default MiniList;
