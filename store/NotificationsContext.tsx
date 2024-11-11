// import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
// import * as Notifications from 'expo-notifications';
// import { registerForPushNotificationsAsync, schedulePushNotification } from '../services/notifications';
// import { useAuth } from './AuthContext';
// import { supabase } from '../lib/supabase';
// import { Product } from '../types/inventory';

// export interface StockAlert {
//   id: string;
//   productId: string;
//   productName: string;
//   currentStock: number;
//   threshold: number;
//   createdAt: Date;
//   isRead: boolean;
// }

// type State = {
//   alerts: StockAlert[];
//   unreadCount: number;
// };

// type Action =
//   | { type: 'ADD_ALERT'; payload: StockAlert }
//   | { type: 'MARK_AS_READ'; payload: string }
//   | { type: 'MARK_ALL_AS_READ' }
//   | { type: 'SET_ALERTS'; payload: StockAlert[] };

// const initialState: State = {
//   alerts: [],
//   unreadCount: 0,
// };

// interface NotificationToken {
//   token: string;
//   user_id: string;
// }

// const NotificationsContext = createContext<{
//   state: State;
//   addAlert: (alert: Omit<StockAlert, 'id' | 'createdAt' | 'isRead'>) => void;
//   markAsRead: (id: string) => void;
//   markAllAsRead: () => void;
//   pushToken: string | null;
// } | undefined>(undefined);

// export function NotificationsProvider({ children }: { children: React.ReactNode }) {
//   const [state, dispatch] = useReducer((state: State, action: Action): State => {
//     switch (action.type) {
//       case 'ADD_ALERT':
//         return {
//           alerts: [action.payload, ...state.alerts],
//           unreadCount: state.unreadCount + 1,
//         };
//       case 'MARK_AS_READ':
//         return {
//           alerts: state.alerts.map(alert =>
//             alert.id === action.payload ? { ...alert, isRead: true } : alert
//           ),
//           unreadCount: state.unreadCount - 1,
//         };
//       case 'MARK_ALL_AS_READ':
//         return {
//           alerts: state.alerts.map(alert => ({ ...alert, isRead: true })),
//           unreadCount: 0,
//         };
//       case 'SET_ALERTS':
//         return {
//           alerts: action.payload,
//           unreadCount: action.payload.filter(alert => !alert.isRead).length,
//         };
//       default:
//         return state;
//     }
//   }, initialState);
//   const [pushToken, setPushToken] = React.useState<string | null>(null);
//   const notificationListener = useRef<any>();
//   const responseListener = useRef<any>();
//   const { session } = useAuth();

//   useEffect(() => {
//     registerForPushNotifications();
//     setupNotificationListeners();

//     return () => {
//       if (notificationListener.current) {
//         Notifications.removeNotificationSubscription(notificationListener.current);
//       }
//       if (responseListener.current) {
//         Notifications.removeNotificationSubscription(responseListener.current);
//       }
//     };
//   }, []);

//   const registerForPushNotifications = async () => {
//     try {
//       const token = await registerForPushNotificationsAsync();
//       if (token && session?.user) {
//         setPushToken(token);
//         await saveTokenToDatabase(token, session.user.id);
//       }
//     } catch (error) {
//       console.error('Error registering for push notifications:', error);
//     }
//   };

//   const saveTokenToDatabase = async (token: string, userId: string) => {
//     try {
//       const { error } = await supabase
//         .from('notification_tokens')
//         .upsert(
//           { token, user_id: userId },
//           { onConflict: 'user_id' }
//         );

//       if (error) throw error;
//     } catch (error) {
//       console.error('Error saving notification token:', error);
//     }
//   };

//   const setupNotificationListeners = () => {
//     notificationListener.current = Notifications.addNotificationReceivedListener(
//       notification => {
//         // Handle notification when app is in foreground
//         const alert = notification.request.content.data.alert as StockAlert;
//         if (alert) {
//           dispatch({ type: 'ADD_ALERT', payload: alert });
//         }
//       }
//     );

//     responseListener.current = Notifications.addNotificationResponseReceivedListener(
//       response => {
//         // Handle notification when user taps on it
//         const alert = response.notification.request.content.data.alert as StockAlert;
//         if (alert) {
//           markAsRead(alert.id);
//         }
//       }
//     );
//   };

//   const addAlert = async (alert: Omit<StockAlert, 'id' | 'createdAt' | 'isRead'>) => {
//     const newAlert: StockAlert = {
//       ...alert,
//       id: Math.random().toString(36).substr(2, 9),
//       createdAt: new Date(),
//       isRead: false,
//     };

//     dispatch({ type: 'ADD_ALERT', payload: newAlert });

//     // Send push notification
//     await schedulePushNotification(
//       'Low Stock Alert',
//       `${alert.productName} has ${alert.currentStock} items remaining (threshold: ${alert.threshold})`
//     );
//   };

//   const markAsRead = (id: string) => {
//     dispatch({ type: 'MARK_AS_READ', payload: id });
//   };

//   const markAllAsRead = () => {
//     dispatch({ type: 'MARK_ALL_AS_READ' });
//   };

//   return (
//     <NotificationsContext.Provider
//       value={{ state, addAlert, markAsRead, markAllAsRead, pushToken }}
//     >
//       {children}
//     </NotificationsContext.Provider>
//   );
// }

// export const useNotifications = () => {
//   const context = useContext(NotificationsContext);
//   if (!context) {
//     throw new Error('useNotifications must be used within a NotificationsProvider');
//   }
//   return context;
// }; 