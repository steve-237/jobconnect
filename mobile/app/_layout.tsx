import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

// Simple atob polyfill
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function atobPol(input: string) {
  let str = input.replace(/=+$/, '');
  let output = '';
  for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? (bs as any) * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [authRole, setAuthRole] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atobPol(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          setAuthRole(payload.role); // e.g. 'CANDIDATE' or 'EMPLOYER'
        } else {
          setAuthRole(null);
        }
      } catch (e) {
        console.error('Error reading token', e);
        setAuthRole(null);
      } finally {
        setIsReady(true);
      }
    };
    checkAuth();
  }, [segments]); // Re-check if navigation happens (like login/logout)

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!authRole && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (authRole) {
      if (authRole === 'EMPLOYER' && segments[0] !== '(employer_tabs)') {
        router.replace('/(employer_tabs)');
      } else if (authRole === 'CANDIDATE' && segments[0] !== '(tabs)') {
        router.replace('/(tabs)');
      }
    }
  }, [isReady, authRole, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(employer_tabs)" />
    </Stack>
  );
}
