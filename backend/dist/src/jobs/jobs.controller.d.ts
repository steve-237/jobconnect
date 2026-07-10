import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(createJobDto: CreateJobDto, req: any): Promise<{
        id: string;
        title: string;
        description: string;
        price: number;
        status: import("@prisma/client").$Enums.JobStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        employerId: string;
        categoryId: string;
    }>;
    findAll(query: any): Promise<({
        employer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        category: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            iconUrl: string | null;
        };
    } & {
        id: string;
        title: string;
        description: string;
        price: number;
        status: import("@prisma/client").$Enums.JobStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        employerId: string;
        categoryId: string;
    })[]>;
    findMyJobs(req: any): Promise<({
        _count: {
            applications: number;
        };
    } & {
        id: string;
        title: string;
        description: string;
        price: number;
        status: import("@prisma/client").$Enums.JobStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        employerId: string;
        categoryId: string;
    })[]>;
    findOne(id: string): Promise<{
        employer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        category: {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            iconUrl: string | null;
        };
    } & {
        id: string;
        title: string;
        description: string;
        price: number;
        status: import("@prisma/client").$Enums.JobStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        employerId: string;
        categoryId: string;
    }>;
    update(id: string, updateJobDto: UpdateJobDto, req: any): Promise<{
        id: string;
        title: string;
        description: string;
        price: number;
        status: import("@prisma/client").$Enums.JobStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        employerId: string;
        categoryId: string;
    }>;
    updateStatus(id: string, status: any, req: any): Promise<{
        id: string;
        title: string;
        description: string;
        price: number;
        status: import("@prisma/client").$Enums.JobStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        employerId: string;
        categoryId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        title: string;
        description: string;
        price: number;
        status: import("@prisma/client").$Enums.JobStatus;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        employerId: string;
        categoryId: string;
    }>;
}
