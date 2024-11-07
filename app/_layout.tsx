import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../store/AuthContext';
import { InventoryProvider } from '../store/InventoryContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'screens';

    if (!session && !inAuthGroup) {
      router.replace('/screens/AuthScreen');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <ProtectedRoute>
          <Stack 
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
              animation: 'slide_from_right'
            }} 
          />
        </ProtectedRoute>
      </InventoryProvider>
    </AuthProvider>
  );
} 