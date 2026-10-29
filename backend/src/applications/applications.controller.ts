import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { InviteCandidateDto } from './dto/invite-candidate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('applications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Roles('CANDIDATE', 'ADMIN')
  @Post()
  create(
    @Body() createApplicationDto: CreateApplicationDto,
    @Request() req: any,
  ) {
    return this.applicationsService.create(
      createApplicationDto,
      req.user.userId,
    );
  }

  @Roles('CANDIDATE', 'ADMIN')
  @Get('my-applications')
  findAllForCandidate(@Request() req: any) {
    return this.applicationsService.findAllForCandidate(req.user.userId);
  }

  @Roles('EMPLOYER', 'ADMIN')
  @Get('job/:jobId')
  findAllForJob(@Param('jobId') jobId: string, @Request() req: any) {
    return this.applicationsService.findAllForJob(jobId, req.user.userId);
  }

  @Roles('EMPLOYER', 'ADMIN')
  @Patch(':id/accept')
  acceptApplication(@Param('id') id: string, @Request() req: any) {
    return this.applicationsService.acceptApplication(id, req.user.userId);
  }

  @Roles('EMPLOYER', 'ADMIN')
  @Patch(':id/reject')
  rejectApplication(@Param('id') id: string, @Request() req: any) {
    return this.applicationsService.rejectApplication(id, req.user.userId);
  }

  @Roles('EMPLOYER', 'ADMIN')
  @Post('invite')
  inviteCandidate(
    @Body() inviteDto: InviteCandidateDto,
    @Request() req: any,
  ) {
    return this.applicationsService.inviteCandidate(
      req.user.userId,
      inviteDto.candidateId,
      inviteDto.jobId,
      inviteDto.message,
    );
  }
}
