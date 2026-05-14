import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from '../../mail/mail.service';
import { NotificationsService } from '../notifications.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private mailService: MailService,
    private notificationService: NotificationsService,
  ) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'send-welcome-email':
        return this.handleWelcomeEmail(job);
      default:
        this.logger.warn(`Job desconocido: ${job.name}`);
    }
  }
  private async handleWelcomeEmail(job: Job) {
    this.logger.log(
      `Procesando job ${job.id}: email de bienvenida para ${job.data.email}`,
    );
    await this.mailService.sendWelcomeEmail(job.data.email, job.data.name);
    await this.notificationService.create({
      userId: job.data.userId,
      type: 'welcome',
      message: `Email de bienvenida enviado a ${job.data.email}`,
    });
    this.logger.log(`Datos del job: ${JSON.stringify(job.data)}`);
    return { sent: true };
  }
  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completado: ${JSON.stringify(result)}`);
  }
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} falló: ${error.message}`);
    this.logger.error(`Intento ${job.attemptsMade} de ${job.opts.attempts}`);
  }
}
