// src/notifications/listeners/notification.listener.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { UsersListener } from './users.listener';
import { UserRegisteredEvent } from '../events/user-registered.event';

describe('UsersListener', () => {
  let listener: UsersListener;
  let queue: Record<string, jest.Mock>;

  beforeEach(async () => {
    queue = {
      add: jest.fn().mockResolvedValue({ id: 'job-1' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersListener,
        { provide: getQueueToken('notifications'), useValue: queue },
      ],
    }).compile();

    listener = module.get<UsersListener>(UsersListener);
  });

  describe('handleUserRegistered', () => {
    it('debería encolar un job send-welcome-email con los datos del evento', async () => {
      const event = new UserRegisteredEvent(1, 'ana@test.com', 'Ana');

      await listener.handleUserRegistered(event);

      expect(queue.add).toHaveBeenCalledWith(
        'send-welcome-email',
        {
          userId: 1,
          email: 'ana@test.com',
          name: 'Ana',
          type: 'welcome',
        },
        expect.objectContaining({
          attempts: 3,
          backoff: expect.objectContaining({
            type: 'exponential',
            delay: 2000,
          }),
          removeOnComplete: true,
        }),
      );
    });

    it('debería encolar exactamente un job por evento', async () => {
      const event = new UserRegisteredEvent(1, 'ana@test.com', 'Ana');

      await listener.handleUserRegistered(event);

      expect(queue.add).toHaveBeenCalledTimes(1);
    });
  });
});
