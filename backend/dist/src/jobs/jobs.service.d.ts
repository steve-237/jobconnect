import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
export declare class JobsService {
    create(createJobDto: CreateJobDto, employerId: string): Promise<{
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
    findAll(): Promise<({
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
    update(id: string, updateJobDto: UpdateJobDto, userId: string): Promise<{
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
    remove(id: string, userId: string): Promise<{
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
