export declare class ReviewsService {
    createReview(jobId: string, rating: number, comment: string, reviewerId: string): Promise<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        jobId: string;
        reviewerId: string;
        revieweeId: string;
    }>;
    getReviewsForUser(userId: string): Promise<({
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
