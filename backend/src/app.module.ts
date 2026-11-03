import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
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
import { DisputesModule } from './disputes/disputes.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 secondes
        limit: 100, // 100 requêtes max par minute par IP par défaut
      },
    ]),
    PrismaModule,
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
    DisputesModule,
    ReviewsModule,
    UploadsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
