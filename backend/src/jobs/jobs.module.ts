import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [NotificationsModule, MessagesModule],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
