import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Request,
  UseGuards,
  Req,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepositDto, WithdrawDto } from './dto/payment.dto';

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
  deposit(@Body() depositDto: DepositDto, @Request() req: any) {
    return this.paymentsService.depositFunds(req.user.userId, depositDto.amount);
  }

  @UseGuards(JwtAuthGuard)
  @Post('withdraw')
  withdraw(@Body() withdrawDto: WithdrawDto, @Request() req: any) {
    return this.paymentsService.withdrawFunds(req.user.userId, withdrawDto.amount, withdrawDto.iban);
  }

  @Post('webhook')
  async webhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('En-tête stripe-signature manquant ou invalide');
    }
    return this.paymentsService.handleWebhook(req, signature);
  }
}
