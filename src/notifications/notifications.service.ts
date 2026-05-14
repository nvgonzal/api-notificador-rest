import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entity/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}
  async create(data: { userId: number; type: string; message: string }) {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }
  // Obtener notificaciones de un usuario, las más recientes primero
  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // Obtener solo las no leídas
  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId, isRead: false },
      order: { createdAt: 'DESC' },
    });
  }

  // Marcar una notificación como leída
  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOneBy({
      id,
      userId,
    });

    if (!notification) {
      throw new NotFoundException(`Notificación ${id} no encontrada`);
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }
  // Marcar todas como leídas (ejemplo de update masivo)
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false }, // condición WHERE
      { isRead: true }, // valores a actualizar
    );
  }
  // Contar no leídas (útil para badges en el frontend)
  async countUnread(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}
