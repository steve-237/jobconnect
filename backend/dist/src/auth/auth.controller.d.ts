import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<{
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
    login(body: Record<string, any>): Promise<{
        access_token: string;
    }>;
}
