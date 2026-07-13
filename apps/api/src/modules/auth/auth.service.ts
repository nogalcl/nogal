import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as argon2 from "argon2";
import { RoleName } from "@nogal/database";
import {
  generateOpaqueToken,
  hashOpaqueToken,
} from "@/common/utils/opaque-token";
import type { Env } from "@/config/env.validation";
import { MailService } from "@/modules/mail/mail.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { UsersService } from "@/modules/users/users.service";
import type { AuthPayload } from "./entities/auth-payload.entity";
import type { LoginInput } from "./dto/login.input";
import type { RegisterInput } from "./dto/register.input";
import { TokenService } from "./token.service";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

// Mensaje deliberadamente genérico: no revela si el fallo fue el email o la
// contraseña, para no facilitar enumeración de cuentas.
const INVALID_CREDENTIALS_MESSAGE = "Correo o contraseña incorrectos.";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService<Env, true>,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.prisma.client.user.findUnique({ where: { email: input.email } }),
      this.usersService.findByUsername(input.username),
    ]);

    if (existingEmail) {
      throw new ConflictException("Ya existe una cuenta con este correo.");
    }
    if (existingUsername) {
      throw new ConflictException("Ese nombre de usuario ya está en uso.");
    }

    const role = await this.prisma.client.role.findUniqueOrThrow({
      where: { name: RoleName.USER },
    });

    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    const user = await this.prisma.client.user.create({
      data: {
        email: input.email,
        passwordHash,
        roleId: role.id,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            username: input.username,
          },
        },
      },
      include: { role: true, profile: { include: { country: true } } },
    });

    // El envío del correo de verificación nunca debe hacer fallar el
    // registro: la cuenta ya se creó arriba, y un proveedor de correo caído
    // no puede dejar al usuario sin cuenta ni explicación. Si falla, queda
    // sin verificar y puede reintentar desde "Reenviar verificación".
    try {
      await this.issueEmailVerificationToken(user.id, user.email);
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de verificación a ${user.email}: ${error instanceof Error ? error.message : error}`,
      );
    }

    return this.issueSession(user.id, role.name);
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(input.email);

    if (!user) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    const passwordValid = await argon2.verify(
      user.passwordHash,
      input.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }

    return this.issueSession(user.id, user.role.name);
  }

  async refresh(refreshToken: string): Promise<AuthPayload> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { role: true } } },
    });

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt < new Date() ||
      stored.user.deletedAt
    ) {
      throw new UnauthorizedException("Sesión inválida o expirada.");
    }

    // Rotación: el token usado se revoca inmediatamente, se emite uno nuevo.
    await this.prisma.client.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueSession(stored.user.id, stored.user.role.name);
  }

  async logout(refreshToken: string): Promise<boolean> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    await this.prisma.client.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return true;
  }

  async verifyEmail(token: string): Promise<boolean> {
    const tokenHash = hashOpaqueToken(token);
    const record = await this.prisma.client.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new BadRequestException(
        "El enlace de verificación no es válido o expiró.",
      );
    }

    await this.prisma.client.$transaction([
      this.prisma.client.emailVerificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      this.prisma.client.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
    ]);

    return true;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.prisma.client.user.findUnique({
      where: { email, deletedAt: null },
    });

    // Siempre se responde con éxito, exista o no la cuenta, para no permitir
    // enumeración de correos registrados.
    if (!user) return true;

    await this.prisma.client.passwordResetToken.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const token = generateOpaqueToken();
    await this.prisma.client.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashOpaqueToken(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    // No debe lanzar si el correo falla: el método siempre responde éxito
    // (ver comentario arriba sobre enumeración), y un proveedor caído no
    // debe convertir esa garantía en un error 500 real.
    try {
      const resetUrl = `${this.configService.get("WEB_APP_URL")}/restablecer-password?token=${token}`;
      await this.mailService.sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de restablecimiento a ${user.email}: ${error instanceof Error ? error.message : error}`,
      );
    }

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const tokenHash = hashOpaqueToken(token);
    const record = await this.prisma.client.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.consumedAt || record.expiresAt < new Date()) {
      throw new BadRequestException("El enlace no es válido o expiró.");
    }

    const passwordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    await this.prisma.client.$transaction([
      this.prisma.client.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.client.passwordResetToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
      // Cambiar la contraseña cierra todas las sesiones activas.
      this.prisma.client.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return true;
  }

  async resendVerificationEmail(userId: string): Promise<boolean> {
    const user = await this.prisma.client.user.findUniqueOrThrow({
      where: { id: userId },
    });
    if (user.emailVerifiedAt) return true;

    await this.issueEmailVerificationToken(user.id, user.email);
    return true;
  }

  private async issueEmailVerificationToken(userId: string, email: string) {
    await this.prisma.client.emailVerificationToken.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const token = generateOpaqueToken();
    await this.prisma.client.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashOpaqueToken(token),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    });

    const verifyUrl = `${this.configService.get("WEB_APP_URL")}/verificar-email?token=${token}`;
    await this.mailService.sendVerificationEmail(email, verifyUrl);
  }

  private async issueSession(
    userId: string,
    role: RoleName,
  ): Promise<AuthPayload> {
    const { token: accessToken, expiresInSeconds } =
      this.tokenService.signAccessToken({ sub: userId, role });

    const {
      token: refreshToken,
      tokenHash,
      expiresAt,
    } = this.tokenService.generateRefreshToken();

    await this.prisma.client.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado.");
    }

    return {
      accessToken,
      accessTokenExpiresInSeconds: expiresInSeconds,
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
      user,
    };
  }
}
