import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() body: { jobId: string; rating: number; comment?: string },
    @Request() req: any,
  ) {
    return this.reviewsService.createReview(
      body.jobId,
      body.rating,
      body.comment || '',
      req.user.userId as string,
    );
  }

  @Get('user/:userId/reputation')
  getUserReputation(@Param('userId') userId: string) {
    return this.reviewsService.getUserReputation(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  getUserReviews(@Param('userId') userId: string) {
    return this.reviewsService.getReviewsForUser(userId);
  }
}
