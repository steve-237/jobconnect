import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createJobDto: CreateJobDto, @Request() req: any) {
    // req.user contains the decoded JWT token payload (e.g. { userId, email, role })
    return this.jobsService.create(createJobDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @Request() req: any) {
    return this.jobsService.update(id, updateJobDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.jobsService.remove(id, req.user.userId);
  }
}
