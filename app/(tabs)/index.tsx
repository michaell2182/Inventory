import React from 'react'
import { View, Text, SafeAreaView, StyleSheet } from 'react-native'
import Nav from '../../components/Nav'

const Main = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Nav />
      <View>
        <Text>Test</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
})

export default Main
