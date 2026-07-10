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
        location: string | null;
        categoryId: string;
        status: import("@prisma/client").$Enums.JobStatus;
        employerId: string;
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
        location: string | null;
        categoryId: string;
        status: import("@prisma/client").$Enums.JobStatus;
        employerId: string;
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
        location: string | null;
        categoryId: string;
        status: import("@prisma/client").$Enums.JobStatus;
        employerId: string;
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
        location: string | null;
        categoryId: string;
        status: import("@prisma/client").$Enums.JobStatus;
        employerId: string;
    }>;
    update(id: string, updateJobDto: UpdateJobDto, req: any): Promise<{
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
    }>;
    updateStatus(id: string, status: any, req: any): Promise<{
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
    }>;
    remove(id: string, req: any): Promise<{
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
    }>;
}
