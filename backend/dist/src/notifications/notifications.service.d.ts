export declare class NotificationsService {
    private expo;
    constructor();
    sendPushNotification(pushToken: string | null | undefined, title: string, body: string, data?: any): Promise<void>;
}
