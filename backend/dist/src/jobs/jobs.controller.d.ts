import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(createJobDto: CreateJobDto, req: any): Promise<{
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
    }>;
    findAll(query: any): Promise<({
        category: {
            id: string;
            name: string;
            description: string | null;
            iconUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        employer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
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
    })[]>;
    findMyJobs(req: any): Promise<({
        _count: {
            applications: number;
        };
    } & {
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
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            description: string | null;
            iconUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        employer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
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
    }>;
    update(id: string, updateJobDto: UpdateJobDto, req: any): Promise<{
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
    }>;
    updateStatus(id: string, status: any, req: any): Promise<{
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
    }>;
    remove(id: string, req: any): Promise<{
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
    }>;
}
