import { CreateApplicationDto } from './dto/create-application.dto';
export declare class ApplicationsService {
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
