import {
  Controller,
  Post,
  Get,
  Param,
  Request,
  UseGuards,
  Req,
  Headers,
  BadRequestException,
  RawBodyRequest,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout/:applicationId')
  createCheckout(
    @Param('applicationId') applicationId: string,
    @Request() req: any,
  ) {
    return this.paymentsService.createCheckoutSession(
      applicationId,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  getTransactions(@Request() req: any) {
    return this.paymentsService.getUserTransactions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('deposit')
  deposit(@Body('amount') amount: number, @Request() req: any) {
    return this.paymentsService.depositFunds(req.user.userId, amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  withdraw(@Body('amount') amount: number, @Body('iban') iban: string, @Request() req: any) {
    return this.paymentsService.withdrawFunds(req.user.userId, amount, iban);
  }

  @Post('webhook')
  async webhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    // Si signature manque (ex: requete curl de test), on continue pour pouvoir tester localement sans webhooks
    if (!signature && process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Missing stripe-signature header');
    }

    try {
      return await this.paymentsService.handleWebhook(req, signature || '');
    } catch (err: any) {
      throw new BadRequestException(err.message);
    }
  }
}
