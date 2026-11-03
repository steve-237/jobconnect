import { Injectable, Logger } from '@nestjs/common';
import {
  SendEmailOptions,
  getWelcomeEmailTemplate,
  getNewApplicationEmailTemplate,
  getApplicationAcceptedEmailTemplate,
  getPaymentReceiptEmailTemplate,
} from './mail.templates';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resendApiKey = process.env.RESEND_API_KEY;
  private readonly mailFrom = process.env.MAIL_FROM || 'JobConnect <notifications@jobconnect.app>';

  /**
   * Generic email sender.
   * If RESEND_API_KEY is configured, sends via Resend REST API (zero extra package dependency).
   * Otherwise, logs the email content to stdout in dev/test mode.
   */
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; id?: string }> {
    const { to, subject, html, text } = options;

    if (this.resendApiKey && !this.resendApiKey.includes('placeholder')) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: this.mailFrom,
            to: [to],
            subject,
            html,
            text,
          }),
        });

        if (!response.ok) {
          const errBody = await response.text();
          this.logger.error(`Failed to send email via Resend to ${to}: ${errBody}`);
          return { success: false };
        }

        const data: any = await response.json();
        this.logger.log(`Email successfully dispatched via Resend to ${to} (id: ${data?.id})`);
        return { success: true, id: data?.id };
      } catch (error) {
        this.logger.error(`Network error sending email to ${to}`, error);
        return { success: false };
      }
    }

    // Dev / Test simulation mode
    this.logger.log(
      `[DEV EMAIL SIMULATION] To: ${to} | Subject: "${subject}" | Length: ${html.length} chars`,
    );
    return { success: true, id: `mock-${Date.now()}` };
  }

  async sendWelcomeEmail(to: string, firstName: string, role: string) {
    const { subject, html, text } = getWelcomeEmailTemplate(firstName, role);
    return this.sendEmail({ to, subject, html, text });
  }

  async sendNewApplicationNotification(
    employerEmail: string,
    employerName: string,
    candidateName: string,
    jobTitle: string,
  ) {
    const { subject, html, text } = getNewApplicationEmailTemplate(
      employerName,
      candidateName,
      jobTitle,
    );
    return this.sendEmail({ to: employerEmail, subject, html, text });
  }

  async sendApplicationAcceptedNotification(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    price: number,
  ) {
    const { subject, html, text } = getApplicationAcceptedEmailTemplate(
      candidateName,
      jobTitle,
      price,
    );
    return this.sendEmail({ to: candidateEmail, subject, html, text });
  }

  async sendPaymentReceipt(
    userEmail: string,
    userName: string,
    jobTitle: string,
    amount: number,
    transactionId: string,
  ) {
    const { subject, html, text } = getPaymentReceiptEmailTemplate(
      userName,
      jobTitle,
      amount,
      transactionId,
    );
    return this.sendEmail({ to: userEmail, subject, html, text });
  }
}
