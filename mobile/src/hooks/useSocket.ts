import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initSocket = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        if (!token) return;

        const socketInstance = io(API_URL, {
          auth: {
            token: `Bearer ${token}`
          },
          transports: ['websocket'], // Force WebSocket transport for React Native
        });

        socketInstance.on('connect', () => {
          if (isMounted) setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          if (isMounted) setIsConnected(false);
        });

        socketRef.current = socketInstance;
        if (isMounted) setSocket(socketInstance);
      } catch (e) {
        console.error('Socket init error', e);
      }
    };

    initSocket();

    return () => {
      isMounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { socket, isConnected };
}
