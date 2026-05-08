// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, jest.Mock>>;
  let jwtService: Partial<Record<keyof JwtService, jest.Mock>>;

  beforeEach(async () => {
    // Crear mocks de las dependencias
    usersService = {
      validateCredentials: jest.fn(),
      create: jest.fn(),
      getOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('debería retornar el usuario si las credenciales son válidas', async () => {
      const mockUser = { id: 1, email: 'ana@test.com', name: 'Ana' };
      usersService.validateCredentials.mockResolvedValue(mockUser);

      const result = await authService.validateUser(
        'ana@test.com',
        'password123',
      );

      expect(result).toEqual(mockUser);
      expect(usersService.validateCredentials).toHaveBeenCalledWith(
        'ana@test.com',
        'password123',
      );
    });

    it('debería lanzar UnauthorizedException si las credenciales son inválidas', async () => {
      usersService.validateCredentials.mockResolvedValue(null);

      await expect(
        authService.validateUser('ana@test.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('debería retornar un objeto con accessToken y datos del usuario', async () => {
      const mockUser = { id: 1, email: 'ana@test.com', name: 'Ana' } as any;

      const result = await authService.login(mockUser);

      expect(result.accessToken).toBe('fake-jwt-token');
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe('ana@test.com');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'ana@test.com',
      });
    });
  });
});
