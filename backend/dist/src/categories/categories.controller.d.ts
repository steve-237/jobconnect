import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        iconUrl: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        iconUrl: string | null;
    } | null>;
}
