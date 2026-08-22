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
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
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

  @Patch('push-token')
  updatePushToken(@Body('token') token: string, @Request() req: any) {
    return this.usersService.updatePushToken(req.user.userId, token);
  }

  @Post('me/kyc')
  requestKyc(@Request() req: any) {
    return this.usersService.requestKyc(req.user.userId);
  }

  @Post('me/kyc/simulate-approve')
  simulateApproveKyc(@Request() req: any) {
    return this.usersService.simulateApproveKyc(req.user.userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('admin/kyc/pending')
  getPendingKyc(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.usersService.findPendingKyc();
  }

  @Patch('admin/kyc/:id/approve')
  approveKyc(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.usersService.approveKyc(id);
  }

  @Patch('admin/kyc/:id/reject')
  rejectKyc(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.usersService.rejectKyc(id);
  }

  @Get('admin/stats')
  getAdminStats(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.usersService.getAdminStats();
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete users');
    }
    return this.usersService.remove(id);
  }
}
