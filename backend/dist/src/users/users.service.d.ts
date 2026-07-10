import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
export declare class UsersService {
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        bio: string | null;
        avatarUrl: string | null;
        isVerified: boolean;
        expoPushToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        bio: string | null;
        avatarUrl: string | null;
        isVerified: boolean;
        expoPushToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    updatePushToken(id: string, token: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        bio: string | null;
        avatarUrl: string | null;
        isVerified: boolean;
        expoPushToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        bio: string | null;
        avatarUrl: string | null;
        isVerified: boolean;
        expoPushToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
        bio: string | null;
        avatarUrl: string | null;
        isVerified: boolean;
        expoPushToken: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
