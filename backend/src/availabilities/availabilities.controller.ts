import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createAvailabilityDto: CreateAvailabilityDto) {
    return this.availabilitiesService.create(req.user.userId, createAvailabilityDto);
  }

  @Get('user/:userId')
  findAllByUser(@Param('userId') userId: string) {
    return this.availabilitiesService.findAllByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.availabilitiesService.remove(id, req.user.userId);
  }
}
