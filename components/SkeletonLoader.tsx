import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonLoader = () => {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonItem}>
      <View style={styles.leftContent}>
        <Animated.View style={[styles.titleSkeleton, { opacity }]} />
        <Animated.View style={[styles.priceSkeleton, { opacity }]} />
        <Animated.View style={[styles.detailsSkeleton, { opacity }]} />
      </View>
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonItem: {
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
    gap: 8,
  },
  titleSkeleton: {
    width: 150,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  priceSkeleton: {
    width: 100,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  detailsSkeleton: {
    width: 80,
    height: 32,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginTop: 8,
  },
  imageSkeleton: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
});

export default SkeletonLoader; 