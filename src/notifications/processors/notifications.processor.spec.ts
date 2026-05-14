// src/notifications/processors/notification.processor.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationProcessor } from './notification.processor';
import { MailService } from '../../mail/mail.service';
import { NotificationsService } from '../notifications.service';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mailService: Record<string, jest.Mock>;
  let notificationsService: Record<string, jest.Mock>;

  beforeEach(async () => {
    mailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    notificationsService = {
      create: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: MailService, useValue: mailService },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  describe('process - send-welcome-email', () => {
    const mockJob = {
      id: 'job-1',
      name: 'send-welcome-email',
      data: {
        userId: 1,
        email: 'ana@test.com',
        name: 'Ana',
        type: 'welcome',
      },
    } as any;

    it('debería enviar el email de bienvenida', async () => {
      await processor.process(mockJob);

      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'ana@test.com',
        'Ana',
      );
    });

    it('debería crear la notificación en BD después del envío', async () => {
      await processor.process(mockJob);

      expect(notificationsService.create).toHaveBeenCalledWith({
        userId: 1,
        type: 'welcome',
        message: expect.stringContaining('ana@test.com'),
      });
    });

    it('debería retornar { sent: true } al completarse', async () => {
      const result = await processor.process(mockJob);

      expect(result).toEqual({ sent: true });
    });

    it('no debería crear notificación si el email falla', async () => {
      mailService.sendWelcomeEmail.mockRejectedValue(new Error('SMTP error'));

      await expect(processor.process(mockJob)).rejects.toThrow('SMTP error');
      expect(notificationsService.create).not.toHaveBeenCalled();
    });
  });

  describe('process - send-order-confirmation', () => {
    const mockJob = {
      id: 'job-2',
      name: 'send-order-confirmation',
      data: {
        userId: 1,
        email: 'ana@test.com',
        orderId: 5678,
        total: 99.99,
        type: 'order_confirmation',
      },
    } as any;

    it('debería enviar el email de confirmación de orden', async () => {
      await processor.process(mockJob);

      expect(mailService.sendOrderConfirmation).toHaveBeenCalledWith(
        'ana@test.com',
        5678,
        99.99,
      );
    });
  });
});
