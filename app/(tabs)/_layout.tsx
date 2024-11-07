import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: 'slide_from_right',
        presentation: 'card'  // This is important for iOS-style navigation
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          gestureEnabled: false // Disable swipe on home screen
        }}
      />
      <Stack.Screen 
        name="sales" 
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen 
        name="expenses" 
        options={{
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      />
    </Stack>
  );
} 