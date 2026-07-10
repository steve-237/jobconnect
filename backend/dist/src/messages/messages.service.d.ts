import { NotificationsService } from '../notifications/notifications.service';
export declare class MessagesService {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    verifyAccess(applicationId: string, userId: string): Promise<{
        job: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            price: number;
            status: import("@prisma/client").$Enums.JobStatus;
            location: string | null;
            employerId: string;
            categoryId: string;
        };
    } & {
        id: string;
        message: string | null;
        isAccepted: boolean;
        jobId: string;
        candidateId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    saveMessage(applicationId: string, senderId: string, content: string): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        senderId: string;
        applicationId: string;
    }>;
    getHistory(applicationId: string, userId: string): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        senderId: string;
        applicationId: string;
    })[]>;
}
