import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";

const listData = [
  { title: "Iphone", price: "$500", quantity: 5 },
  { title: "Macbook Pro", price: "$1299", quantity: 2 },
  { title: "AirPods", price: "$199", quantity: 3 },
  { title: "iPad", price: "$799", quantity: 1 },
  { title: "Apple Watch", price: "$399", quantity: 4 },
];

interface ListItemData {
  title: string;
  price: string;
  quantity: number;
}

const ListItem = ({ item }: { item: ListItemData }) => (
  <View style={styles.listItem}>
    <View style={styles.leftContent}>
      <View style={styles.itemCircle} />
      <View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
      </View>
    </View>
    <View style={styles.quantityContainer}>
      <View style={styles.quantityWrapper}>
        <Text style={styles.quantity}>{item.quantity} QTY</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </View>
  </View>
);

const ListHeader = () => (
  <View style={styles.headerLine} />
);

const MiniList = () => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <FlatList
          data={listData}
          renderItem={({ item }) => <ListItem item={item} />}
          keyExtractor={(item, index) => index.toString()}
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
    marginTop: 56,
    paddingHorizontal: 16,
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  headerLine: {
    width: 40,
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quantity: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 26,
    color: '#6b7280',
    alignSelf: 'center',
  },
  quantityWrapper: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MiniList; 