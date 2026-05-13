// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from '../entity/user.entity';

// Mockear bcrypt para que los tests sean rápidos
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Record<string, jest.Mock>;
  let eventEmitter: Record<string, jest.Mock>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    const createUserDto = {
      name: 'Ana',
      lastName: 'García',
      email: 'ana@test.com',
      password: 'password123',
      bday: new Date('1990-01-01'),
    };

    it('debería crear un usuario con la contraseña hasheada', async () => {
      repository.findOneBy.mockResolvedValue(null); // email no existe
      repository.create.mockReturnValue({ ...createUserDto, id: 1 });
      repository.save.mockResolvedValue({
        id: 1,
        ...createUserDto,
        password: 'hashed-password',
      });

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(repository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashed-password',
      });
      expect(result.id).toBe(1);
    });

    it('debería emitir el evento user.registered al crear', async () => {
      repository.findOneBy.mockResolvedValue(null);
      repository.create.mockReturnValue({ ...createUserDto, id: 1 });
      repository.save.mockResolvedValue({
        id: 1,
        ...createUserDto,
        password: 'hashed-password',
      });

      await service.create(createUserDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.registered',
        expect.objectContaining({
          userId: 1,
          email: 'ana@test.com',
          name: 'Ana',
        }),
      );
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      repository.findOneBy.mockResolvedValue({ id: 99, email: 'ana@test.com' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debería retornar el usuario si existe', async () => {
      const mockUser = { id: 1, name: 'Ana', email: 'ana@test.com' };
      repository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getOne(1);

      expect(result).toEqual(mockUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.getOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateCredentials', () => {
    it('debería retornar el usuario si la contraseña es correcta', async () => {
      const mockUser = { id: 1, email: 'ana@test.com', password: 'hashed' };
      repository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateCredentials(
        'ana@test.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
    });

    it('debería retornar null si la contraseña es incorrecta', async () => {
      const mockUser = { id: 1, email: 'ana@test.com', password: 'hashed' };
      repository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateCredentials('ana@test.com', 'wrong');

      expect(result).toBeNull();
    });

    it('debería retornar null si el usuario no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await service.validateCredentials(
        'noexiste@test.com',
        'pass',
      );

      expect(result).toBeNull();
    });
  });
});
