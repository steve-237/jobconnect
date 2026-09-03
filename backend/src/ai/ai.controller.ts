import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate-job')
  async generateJob(
    @Body() body: { prompt: string; location?: string },
  ) {
    return this.aiService.generateJob(body.prompt, body.location);
  }

  @UseGuards(JwtAuthGuard)
  @Post('estimate-price')
  async estimatePrice(
    @Body() body: { title: string; description: string; location?: string },
  ) {
    return this.aiService.estimatePrice(body.title, body.description, body.location);
  }

  @UseGuards(JwtAuthGuard)
  @Post('generate-pitch')
  async generatePitch(
    @Body() body: { jobTitle: string; jobDescription: string; userBio?: string },
  ) {
    return this.aiService.generatePitch(body.jobTitle, body.jobDescription, body.userBio);
  }

  @UseGuards(JwtAuthGuard)
  @Post('match-score')
  async matchScore(
    @Body() body: {
      jobTitle: string;
      jobDescription: string;
      candidateSkills?: string[];
      isVerified?: boolean;
      rating?: number;
    },
  ) {
    return this.aiService.calculateMatchScore(
      body.jobTitle,
      body.jobDescription,
      body.candidateSkills,
      body.isVerified,
      body.rating,
    );
  }

  @Post('support-chat')
  async supportChat(
    @Body() body: { message: string },
  ) {
    return this.aiService.supportChat(body.message);
  }

  @UseGuards(JwtAuthGuard)
  @Post('gamification')
  async getGamification(
    @Body() body: { completedJobsCount?: number; averageRating?: number },
  ) {
    return this.aiService.getGamificationStatus(
      body.completedJobsCount || 0,
      body.averageRating || 5.0,
    );
  }
}
