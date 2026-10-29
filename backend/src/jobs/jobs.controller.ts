import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'ADMIN')
  @Post()
  create(@Body() createJobDto: CreateJobDto, @Request() req: any) {
    return this.jobsService.create(createJobDto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.jobsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CANDIDATE', 'ADMIN')
  @Get('candidate/calendar')
  async getMyCalendar(@Request() req: any) {
    return this.jobsService.findMyCalendar(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('EMPLOYER', 'ADMIN')
  @Get('employer/my-jobs')
  findMyJobs(@Request() req: any) {
    return this.jobsService.findMyJobs(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Request() req: any,
  ) {
    return this.jobsService.updateStatus(id, status, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Request() req: any,
  ) {
    return this.jobsService.update(id, updateJobDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.jobsService.remove(id, req.user.userId);
  }
}
