import React from 'react';
import { NotificationsProvider } from './store/NotificationsContext';
import { AuthProvider } from './store/AuthContext';
import { InventoryProvider } from './store/InventoryContext';
import RootNavigator from './app/navigation/RootNavigator';

export default function App() {
  return (
    <NotificationsProvider>
      <AuthProvider>
        <InventoryProvider>
          <RootNavigator />
        </InventoryProvider>
      </AuthProvider>
    </NotificationsProvider>
  );
}
