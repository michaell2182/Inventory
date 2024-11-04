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
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemPrice}>{item.price} · {item.quantity} QTY</Text>
      <View style={styles.detailsWrapper}>
        <Text style={styles.detailsButton}>Details</Text>
      </View>
    </View>
    <View style={styles.imageContainer}>
      <View style={styles.image} />
    </View>
  </View>
);

const ListHeader = () => (
  <View style={styles.headerLine} />
);

const MiniList = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Products</Text>
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
    marginTop: 24,
    paddingHorizontal: 0,
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    flex: 1,
    marginHorizontal: 16,
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
    fontWeight: '700',
    marginBottom: 16,
    paddingLeft: 24,
  },
});

export default MiniList; 