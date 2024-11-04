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
    backgroundColor: "#f5f5f5",
  },
  greetingContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  greeting: {
    fontSize: 36,
    fontWeight: "600",
    color: "#000",
    marginTop:  4,
  },
  date: {
    fontSize: 22,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "500",
  },
});

export default Main;
