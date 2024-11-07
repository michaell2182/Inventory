import React from 'react';
import { AuthProvider } from './store/AuthContext';
import RootNavigator from './app/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
} 