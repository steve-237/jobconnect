import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsService {
    create(createJobDto: CreateJobDto, employerId: string): Promise<{
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
    findAll(): Promise<({
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
    findMyJobs(employerId: string): Promise<({
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
    update(id: string, updateJobDto: UpdateJobDto, userId: string): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
