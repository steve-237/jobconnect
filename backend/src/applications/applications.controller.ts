import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto, @Request() req: any) {
    if (req.user.role !== 'CANDIDATE') {
      throw new ForbiddenException('Only candidates can apply to jobs');
    }
    return this.applicationsService.create(createApplicationDto, req.user.userId);
  }

  @Get('my-applications')
  findAllForCandidate(@Request() req: any) {
    if (req.user.role !== 'CANDIDATE') {
      throw new ForbiddenException('Only candidates can view their applications');
    }
    return this.applicationsService.findAllForCandidate(req.user.userId);
  }

  @Get('job/:jobId')
  findAllForJob(@Param('jobId') jobId: string, @Request() req: any) {
    if (req.user.role !== 'EMPLOYER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only employers can view job applications');
    }
    return this.applicationsService.findAllForJob(jobId, req.user.userId);
  }

  @Patch(':id/accept')
  acceptApplication(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only employers can accept applications');
    }
    return this.applicationsService.acceptApplication(id, req.user.userId);
  }
}
