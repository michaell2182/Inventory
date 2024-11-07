import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useInventory } from '../store/InventoryContext';
import { Product } from '../types/inventory';
// import { useInventoryActions } from '../hooks/useInventoryActions';
import { Ionicons } from '@expo/vector-icons';

const ListItem = ({ item, onPress }: { item: Product; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={styles.listItem}>
    <View style={styles.leftContent}>
      <Text style={styles.itemTitle}>{item.title}</Text>
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
  const { state } = useInventory();
  const { products, isLoading, error } = state;

  const limitedProducts = products.slice(0, 5);

  if (isLoading) {
    return <View style={styles.wrapper}><Text>Loading...</Text></View>;
  }

  if (error) {
    return <View style={styles.wrapper}><Text>Error: {error}</Text></View>;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Products</Text>
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
    borderColor: '#e5e7eb',
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
    // marginBottom: 16,
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
});

export default MiniList; 