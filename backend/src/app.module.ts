import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './applications/applications.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { AvailabilitiesModule } from './availabilities/availabilities.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    UsersModule,
    JobsModule,
    CategoriesModule,
    AuthModule,
    ApplicationsModule,
    MessagesModule,
    NotificationsModule,
    PaymentsModule,
    AvailabilitiesModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
