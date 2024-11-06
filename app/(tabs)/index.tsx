import React from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
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
          <Animated.View 
            entering={FadeInDown.duration(600).springify()}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.greeting}>Hello, Michael</Text>
              <Text style={styles.date}>Tue, 3 Aug</Text>
            </View>
          </Animated.View>

          {/* Quick Actions Section */}
          <Animated.View 
            entering={FadeInRight.delay(200).duration(600).springify()}
            style={styles.section}
          >
            <QuickAction />
          </Animated.View>

          {/* Products List Section */}
          <Animated.View 
            entering={FadeInRight.delay(400).duration(600).springify()}
            style={styles.section}
          >
            <MiniList />
          </Animated.View>
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
