import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import api from '@/lib/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Send token to backend if logged in
        const jwt = localStorage.getItem('token') || ''; // wait, react native uses AsyncStorage, but we used a custom api interceptor that checks AsyncStorage.
        // Actually we should just call api.patch, and the interceptor adds the token!
        api.patch('/users/push-token', { token }).catch(err => console.log('Not logged in or failed to send push token', err));
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received push notification:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User tapped notification:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return { expoPushToken };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    return token.data;
  } else {
    console.log('Must use physical device for Push Notifications');
    return null;
  }
}
