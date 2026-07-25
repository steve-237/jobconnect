import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  RawBodyRequest,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { Request } from 'express';
import { NotificationsService } from '../notifications/notifications.service';

const prisma = new PrismaClient();

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private notificationsService: NotificationsService) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
      {
        apiVersion: '2023-10-16' as any,
      },
    );
  }

  async createCheckoutSession(applicationId: string, employerId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) throw new NotFoundException('Application not found');
    if (application.job.employerId !== employerId)
      throw new ForbiddenException('You do not own this job');
    if (application.isAccepted)
      throw new ForbiddenException('Application is already accepted');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card', 'paypal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Paiement pour la mission: ${application.job.title}`,
            },
            unit_amount: Math.round(application.job.price * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3001/dashboard?success=true`,
      cancel_url: `http://localhost:3001/dashboard?canceled=true`,
      metadata: {
        applicationId: application.id,
        jobId: application.job.id,
        candidateId: application.candidateId,
      },
    });

    await prisma.job.update({
      where: { id: application.jobId },
      data: { stripeSessionId: session.id },
    });

    return { url: session.url };
  }

  async handleWebhook(req: RawBodyRequest<Request>, signature: string) {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: Stripe.Event;

    try {
      if (endpointSecret && req.rawBody) {
        event = this.stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          endpointSecret,
        );
      } else {
        // Fallback pour dev local sans secret validé (dangereux en prod, mais pratique ici)
        event = req.body;
      }
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const applicationId = session.metadata?.applicationId;
      const jobId = session.metadata?.jobId;
      const candidateId = session.metadata?.candidateId;

      if (applicationId && jobId) {
        // Accepter la candidature
        await prisma.application.update({
          where: { id: applicationId },
          data: { isAccepted: true },
        });

        // Marquer le job comme payé et en cours
        await prisma.job.update({
          where: { id: jobId },
          data: { isPaid: true, status: 'IN_PROGRESS' },
        });

        // Notifier le candidat
        if (candidateId) {
          const candidate = await prisma.user.findUnique({
            where: { id: candidateId },
          });
          if (candidate?.expoPushToken) {
            await this.notificationsService.sendPushNotification(
              candidate.expoPushToken,
              'Candidature Acceptée ! 🎉',
              `L'employeur a réglé la mission. Vous pouvez maintenant commencer !`,
              { type: 'application_accepted', applicationId },
            );
          }
        }
      }
    }

    return { received: true };
  }
}
