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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  getProfile(@Request() req: any) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  updateMyProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Patch('push-token')
  updatePushToken(@Body('token') token: string, @Request() req: any) {
    return this.usersService.updatePushToken(req.user.userId, token);
  }

  @Post('me/kyc')
  requestKyc(
    @Request() req: any,
    @Body('docType') docType?: string,
    @Body('docUrl') docUrl?: string,
    @Body('selfieUrl') selfieUrl?: string,
  ) {
    return this.usersService.requestKyc(req.user.userId, docType, docUrl, selfieUrl);
  }

  @Post('me/kyc/simulate-approve')
  simulateApproveKyc(@Request() req: any) {
    return this.usersService.simulateApproveKyc(req.user.userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Roles('ADMIN')
  @Get('admin/kyc/pending')
  getPendingKyc() {
    return this.usersService.findPendingKyc();
  }

  @Roles('ADMIN')
  @Get('admin/stats')
  getAdminStats() {
    return this.usersService.getAdminStats();
  }

  @Roles('ADMIN')
  @Patch('admin/kyc/:id/approve')
  approveKyc(@Param('id') id: string) {
    return this.usersService.approveKyc(id);
  }

  @Roles('ADMIN')
  @Patch('admin/kyc/:id/reject')
  rejectKyc(@Param('id') id: string) {
    return this.usersService.rejectKyc(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
