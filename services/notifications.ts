import * as Notifications from 'expo-notifications';
import { Product } from '../types/inventory';

export async function registerForPushNotificationsAsync() {
  let token;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function checkAndNotifyLowStock(product: Product) {
  if (!product.reorder_point || product.quantity === undefined) return;
  
  if (product.quantity <= product.reorder_point) {
    await schedulePushNotification(
      'Low Stock Alert',
      `${product.title} is running low (${product.quantity} remaining). Time to reorder!`
    );
  }
}

export async function schedulePushNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      priority: 'high',
      sound: 'default',
      badge: 1,
      data: { type: 'low_stock' },
    },
    trigger: null,
  });
} 