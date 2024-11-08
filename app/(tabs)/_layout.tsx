import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function Layout() {
  // Android-specific animation config
  const androidConfig = {
    animation: 'spring',
    config: {
      duration: 350,
      damping: 20,
      stiffness: 100,
      mass: 0.3,
      overshootClamping: false,
    },
  };

  return (
    <Stack 
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        presentation: 'card',
        ...Platform.select({
          ios: {
            animation: 'slide_from_right',
          },
          android: {
            animation: 'slide_from_right',
            animationTypeForReplace: 'pop',
            cardStyleInterpolator: ({ 
              current, 
              layouts 
            }: {
              current: { progress: any };
              layouts: { screen: { width: number } };
            }) => ({
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
              overlayStyle: {
                opacity: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            }),
            transitionSpec: {
              open: androidConfig,
              close: androidConfig,
            },
          },
        }),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="sales" 
        options={{
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="expenses" 
        options={{
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
} 