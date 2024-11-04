import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import Nav from "../../components/Nav";
import QuickAction from "../../components/QuickAction";
import MiniList from "../../components/MiniList";

const Main = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Nav />
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hello, Michael</Text>
        <Text style={styles.date}>Tue, 3 Aug</Text>
      </View>
      <QuickAction />
      <MiniList />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  greetingContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '600',
    color: '#000',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
  },
});

export default Main;
