import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(body: {
        jobId: string;
        rating: number;
        comment?: string;
    }, req: any): Promise<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        jobId: string;
        reviewerId: string;
        revieweeId: string;
    }>;
    getUserReviews(userId: string): Promise<({
        job: {
            title: string;
        };
        reviewer: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        jobId: string;
        reviewerId: string;
        revieweeId: string;
    })[]>;
}
