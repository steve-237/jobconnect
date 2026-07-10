import { Injectable } from '@nestjs/common';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  async sendPushNotification(pushToken: string | null | undefined, title: string, body: string, data?: any) {
    if (!pushToken || !Expo.isExpoPushToken(pushToken)) {
      console.log(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }

    const messages: ExpoPushMessage[] = [{
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    }];

    try {
      const ticketChunk = await this.expo.sendPushNotificationsAsync(messages);
      console.log('Push notification sent:', ticketChunk);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
