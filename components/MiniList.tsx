import React from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from "react-native";
import { useInventory } from '../store/InventoryContext';
import { Product } from '../types/inventory';
// import { useInventoryActions } from '../hooks/useInventoryActions';

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

const MiniList = () => {
  const { state } = useInventory();
  // const { addTestData } = useInventoryActions();
  const { products, isLoading, error } = state;

  // const handleAddTestData = () => {
  //   addTestData();
  // };

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
        {/* <TouchableOpacity 
          style={styles.addButton} 
          onPress={handleAddTestData}
        >
          <Text style={styles.addButtonText}>Add Test Data</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.container}>
        <FlatList
          data={products}
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
});

export default MiniList; 