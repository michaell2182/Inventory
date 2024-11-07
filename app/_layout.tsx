import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true, // Enable swipe gesture
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
      }}
    />
  );
} 