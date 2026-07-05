export declare class CategoriesService {
    findAll(): Promise<{
        id: string;
        name: string;
        description: string | null;
        iconUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        iconUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
