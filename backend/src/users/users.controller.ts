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

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete users');
    }
    return this.usersService.remove(id);
  }
}
