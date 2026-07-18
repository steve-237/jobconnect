import { CreateApplicationDto } from './dto/create-application.dto';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ApplicationsService {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    create(createApplicationDto: CreateApplicationDto, candidateId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        isAccepted: boolean;
        jobId: string;
        candidateId: string;
    }>;
    findAllForCandidate(candidateId: string): Promise<({
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
    })[]>;
    findAllForJob(jobId: string, employerId: string): Promise<({
        candidate: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        isAccepted: boolean;
        jobId: string;
        candidateId: string;
    })[]>;
    acceptApplication(id: string, employerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        isAccepted: boolean;
        jobId: string;
        candidateId: string;
    }>;
}
