import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send welcome email in simulation mode', async () => {
    const result = await service.sendWelcomeEmail('alice@example.com', 'Alice', 'CANDIDATE');
    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('should send new application notification', async () => {
    const result = await service.sendNewApplicationNotification(
      'employer@example.com',
      'Jean',
      'Marc B.',
      'Rénovation terrasse',
    );
    expect(result.success).toBe(true);
  });

  it('should send application accepted notification', async () => {
    const result = await service.sendApplicationAcceptedNotification(
      'candidate@example.com',
      'Marc',
      'Rénovation terrasse',
      350,
    );
    expect(result.success).toBe(true);
  });

  it('should send payment receipt', async () => {
    const result = await service.sendPaymentReceipt(
      'employer@example.com',
      'Jean Dupont',
      'Rénovation terrasse',
      350,
      'tx-12345-mock',
    );
    expect(result.success).toBe(true);
  });
});
