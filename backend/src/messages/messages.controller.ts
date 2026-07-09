import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':applicationId')
  getHistory(@Param('applicationId') applicationId: string, @Request() req: any) {
    return this.messagesService.getHistory(applicationId, req.user.userId);
  }
}
