import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(createApplicationDto: CreateApplicationDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        isAccepted: boolean;
        jobId: string;
        candidateId: string;
    }>;
    findAllForCandidate(req: any): Promise<({
        job: {
            id: string;
            description: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            price: number;
            location: string | null;
            categoryId: string;
            status: import("@prisma/client").$Enums.JobStatus;
            employerId: string;
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
    findAllForJob(jobId: string, req: any): Promise<({
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
    acceptApplication(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string | null;
        isAccepted: boolean;
        jobId: string;
        candidateId: string;
    }>;
}
