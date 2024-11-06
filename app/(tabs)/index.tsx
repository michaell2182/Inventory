import React from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import Nav from "../../components/Nav";
import QuickAction from "../../components/QuickAction";
import MiniList from "../../components/MiniList";
import { InventoryProvider } from '../../store/InventoryContext';

const Main = () => {
  return (
    <InventoryProvider>
      <SafeAreaView style={styles.safeArea}>
        <Nav />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Modern Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>Hello, Michael</Text>
              <Text style={styles.date}>Tue, 3 Aug</Text>
            </View>
          </View>

          {/* Quick Actions Section */}
          <View style={styles.section}>
            <QuickAction />
          </View>

          {/* Products List Section */}
          <View style={styles.section}>
            <MiniList />
          </View>
        </ScrollView>
      </SafeAreaView>
    </InventoryProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#fff',
  },
  headerContent: {
    gap: 4,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  date: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
});

export default Main;
