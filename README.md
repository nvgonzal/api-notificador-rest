<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">API Notificador</h1>

<p align="center">
  Sistema de notificaciones construido con <strong>NestJS</strong> que combina autenticación JWT, arquitectura orientada a eventos, colas de trabajo con Redis y envío de correos transaccionales.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS 11" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/BullMQ-5-D72B22" alt="BullMQ" />
</p>

---

## Acerca del proyecto

Esta API expone un flujo completo de notificaciones donde los eventos de dominio (por ejemplo, el alta de un usuario) se desacoplan de los efectos secundarios (envío de email, persistencia de notificación) mediante un bus de eventos interno y una cola de trabajos distribuida.

El objetivo del repositorio es **demostrar conocimientos sólidos del ecosistema NestJS** y de los patrones que se aplican en aplicaciones backend reales: modularización, inyección de dependencias, autenticación con JWT, arquitectura event-driven, procesamiento asíncrono, ORM, validación declarativa y documentación OpenAPI.

> [!NOTE]
> El proyecto está pensado como una vitrina técnica. La cobertura de tests, la documentación Swagger y la separación de responsabilidades priorizan claridad sobre features.

## Características

- **Autenticación** con JWT, estrategia de Passport y guard global con decorador `@Public()` para rutas abiertas.
- **Gestión de usuarios** con hashing de contraseñas (bcrypt) y serialización segura (`@Exclude` + `ClassSerializerInterceptor`).
- **Notificaciones** con CRUD parcial: listado, conteo de no leídas, marcar como leída individual y masiva.
- **Arquitectura orientada a eventos**: `UserRegisteredEvent` desacopla el alta del usuario de los efectos secundarios.
- **Colas con BullMQ** sobre Redis para procesar el envío del email de bienvenida fuera del request original, con reintentos y backoff exponencial.
- **Email transaccional** con `@nestjs-modules/mailer` y plantillas Handlebars.
- **Validación declarativa** con `class-validator` y DTOs tipados.
- **Documentación OpenAPI** generada automáticamente con Swagger en `/api/docs`.
- **Suite de tests unitarios** con Jest cubriendo controllers, services, listeners y processors.

## Arquitectura

```
HTTP ──> AuthController / UsersController / NotificationsController
                │
                ▼
        Service Layer (UsersService, AuthService, NotificationsService)
                │
                ├──► TypeORM Repository ──► MySQL
                │
                └──► EventEmitter2 ──► UsersListener
                                            │
                                            ▼
                                  BullMQ Queue (Redis)
                                            │
                                            ▼
                                NotificationProcessor
                                      │        │
                                      │        └──► MailService ──► SMTP
                                      ▼
                              NotificationsService (persiste)
```

Flujo típico al registrar un usuario:

1. `POST /auth/register` valida el DTO, hashea la contraseña y persiste el usuario.
2. Se emite `UserRegisteredEvent` mediante `EventEmitter2`.
3. `UsersListener` recibe el evento y encola un job `send-welcome-email` en BullMQ.
4. `NotificationProcessor` consume el job, envía el correo con Handlebars y registra la notificación en BD.

## Stack y librerías

### Core de NestJS

| Paquete | Rol |
| ------- | --- |
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | Núcleo del framework y runtime HTTP. |
| `@nestjs/config` | Configuración por entorno con `registerAs` y namespaces (`database`, `redis`). |
| `@nestjs/typeorm` + `typeorm` + `mysql2` | ORM y driver de MySQL. |
| `@nestjs/event-emitter` | Bus de eventos in-process para desacoplar dominio y efectos. |
| `@nestjs/bullmq` + `bullmq` | Colas de trabajo persistidas en Redis. |
| `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt` | Autenticación basada en JSON Web Tokens. |
| `@nestjs-modules/mailer` + `nodemailer` + `handlebars` | Envío de correos con plantillas. |
| `@nestjs/swagger` | Documentación OpenAPI automática. |
| `@nestjs/mapped-types` | Generación de DTOs derivados (`PartialType`, etc.). |

### Soporte y calidad

| Paquete | Rol |
| ------- | --- |
| `class-validator` + `class-transformer` | Validación y transformación de DTOs vía `ValidationPipe` global. |
| `bcrypt` | Hashing de contraseñas. |
| `reflect-metadata` + `rxjs` | Requeridos por el sistema de decoradores y observables. |
| `jest` + `ts-jest` + `supertest` | Testing unitario y e2e. |
| `eslint` + `prettier` | Estilo y linting. |

## Patrones aplicados

- **Modular Architecture**: cada feature (`auth`, `users`, `notifications`, `mail`) es un módulo autocontenido con su controller, service y dependencias.
- **Guard global con opt-out**: `JwtAuthGuard` registrado vía `APP_GUARD` protege toda la API; las rutas se abren explícitamente con `@Public()`.
- **Custom decorators**: `@CurrentUser()` extrae el usuario autenticado del request; `@Public()` marca endpoints abiertos.
- **Custom pipes**: `LowercaseEmailPipe` normaliza emails antes de validar duplicados.
- **Event-driven decoupling**: los handlers HTTP no conocen los efectos colaterales; éstos se atan al evento del dominio.
- **Job queue con reintentos**: `attempts: 3` y backoff exponencial para tolerancia a fallos transitorios del SMTP.
- **Serialización segura**: la entidad `User` marca `password` con `@Exclude` y el `ClassSerializerInterceptor` global la filtra de las respuestas.

## Endpoints

Documentación interactiva disponible en `http://localhost:3000/api/docs` una vez levantada la app.

### Auth (`/auth`)

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `POST` | `/auth/register` | Registra un usuario y retorna un JWT. |
| `POST` | `/auth/login` | Autentica credenciales y retorna un JWT. |
| `GET`  | `/auth/profile` | Devuelve el perfil del usuario autenticado. |

### Users (`/users`)

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `GET`   | `/users/me` | Información del usuario autenticado. |
| `PATCH` | `/users/me` | Actualiza datos del usuario autenticado. |

### Notifications (`/notifications`)

| Método | Ruta | Descripción |
| ------ | ---- | ----------- |
| `GET`   | `/notifications` | Lista todas las notificaciones del usuario. |
| `GET`   | `/notifications/unread` | Lista las no leídas. |
| `GET`   | `/notifications/unread/count` | Cuenta las no leídas (útil para badges). |
| `PATCH` | `/notifications/:id/read` | Marca una notificación como leída. |
| `PATCH` | `/notifications/read-all` | Marca todas como leídas. |

## Requisitos

- **Node.js** 20 o superior
- **Yarn** (o npm)
- **Docker** y **Docker Compose** para levantar MySQL y Redis

## Puesta en marcha

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd api-notificador-nest
yarn install
```

### 2. Configurar variables de entorno

Copiá el archivo de ejemplo y ajustá los valores:

```bash
cp .env.example .env
```

Variables esperadas:

| Variable | Descripción |
| -------- | ----------- |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | Conexión a MySQL. |
| `REDIS_HOST`, `REDIS_PORT` | Conexión a Redis para BullMQ. |
| `JWT_SECRET`, `JWT_EXPIRATION` | Firma y expiración de los JWT. |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM` | Credenciales SMTP. |

### 3. Levantar infraestructura

El `docker-compose.yml` provee MySQL 8.4, phpMyAdmin y Redis 7:

```bash
docker compose up -d
```

| Servicio | URL / Puerto |
| -------- | ------------ |
| MySQL | `localhost:3306` |
| phpMyAdmin | `http://localhost:8080` |
| Redis | `localhost:6379` |

> [!TIP]
> Para usar un proveedor SMTP de pruebas (Mailtrap, MailHog, Ethereal), basta con apuntar las variables `MAIL_*` al host y credenciales del servicio.

### 4. Ejecutar la aplicación

```bash
# desarrollo con watch mode
yarn start:dev

# producción
yarn build
yarn start:prod
```

La API queda disponible en `http://localhost:3000` y la documentación Swagger en `http://localhost:3000/api/docs`.

> [!WARNING]
> `synchronize: true` está habilitado en la configuración de TypeORM para acelerar la demo. **No usar en producción**: en ese escenario se debe migrar a `typeorm migration:run`.

## Tests

```bash
# unitarios
yarn test

# cobertura
yarn test:cov

# e2e
yarn test:e2e
```

La suite cubre `AuthService`, `UsersService`, `NotificationsService`, `UsersListener` y `NotificationProcessor`, incluyendo el flujo asincrónico con BullMQ mockeado vía `getQueueToken`.

## Estructura del proyecto

```
src/
├── auth/                 # Login, registro, JWT, guards y decoradores
│   ├── decorators/       # @Public, @CurrentUser
│   ├── guards/           # JwtAuthGuard (registrado como APP_GUARD)
│   └── strategies/       # JwtStrategy (Passport)
├── users/                # CRUD de usuarios, pipes y DTOs
├── notifications/        # Controller, service, listeners y processors
│   ├── events/           # UserRegisteredEvent
│   ├── listeners/        # UsersListener (encola jobs)
│   └── processors/       # NotificationProcessor (consume jobs)
├── mail/                 # MailerModule + plantillas Handlebars
├── entity/               # User, Notification (TypeORM)
├── config/               # database.config, redis.config
├── app.module.ts
└── main.ts               # Bootstrap, Swagger, ValidationPipe global
```
