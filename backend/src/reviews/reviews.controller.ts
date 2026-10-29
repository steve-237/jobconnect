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
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: any,
  ) {
    return this.reviewsService.createReview(
      createReviewDto.jobId,
      createReviewDto.rating,
      createReviewDto.comment || '',
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
