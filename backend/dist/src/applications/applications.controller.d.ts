import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
export declare class ApplicationsController {
    private readonly applicationsService;
    constructor(applicationsService: ApplicationsService);
    create(createApplicationDto: CreateApplicationDto, req: any): Promise<{
        id: string;
        message: string | null;
        isAccepted: boolean;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    }>;
    findAllForCandidate(req: any): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
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
        message: string | null;
        isAccepted: boolean;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    })[]>;
    acceptApplication(id: string, req: any): Promise<{
        id: string;
        message: string | null;
        isAccepted: boolean;
        createdAt: Date;
        updatedAt: Date;
        jobId: string;
        candidateId: string;
    }>;
}
