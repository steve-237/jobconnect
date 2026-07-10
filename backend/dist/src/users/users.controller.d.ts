import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    getProfile(req: any): Promise<{
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
    updatePushToken(token: string, req: any): Promise<{
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
    findAll(): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
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
