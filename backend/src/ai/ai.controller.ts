import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
}
