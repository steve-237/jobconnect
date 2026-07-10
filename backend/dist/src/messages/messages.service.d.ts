export declare class MessagesService {
    verifyAccess(applicationId: string, userId: string): Promise<{
        job: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            price: number;
            status: import("@prisma/client").$Enums.JobStatus;
            location: string | null;
            employerId: string;
            categoryId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        isAccepted: boolean;
        jobId: string;
        candidateId: string;
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
