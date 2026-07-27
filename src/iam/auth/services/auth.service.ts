import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { ROLES } from 'src/iam/seeds/role';
import { MailService } from 'src/mail/mail.service';
import { TokenType, UserStatus } from 'src/generated/prisma/client';
import { UserMapper } from 'src/users/mappers/user.mapper';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import { UserServices } from 'src/users/user.services';
import { AUTH_MESSAGES } from '../constants/auth.constants';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { PasswordService } from './password.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { RoleRepository } from './role.repository';
import { TokenService } from './token.service';
import { VerificationTokenRepository } from './verification-token.repository';
import { parseDurationToMs } from '../utils/duration.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userServices: UserServices,
    private readonly passwordService: PasswordService,
    private readonly roleRepository: RoleRepository,
    private readonly tokenService: TokenService,
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(data: RegisterDto): Promise<UserResponseDto> {
    const email = data.email.toLowerCase().trim();
    const existingUser = await this.userServices.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }

    const role = await this.roleRepository.findByRole({ key: ROLES.USER });
    if (!role) {
      throw new NotFoundException('Default user role is not configured');
    }

    const passwordHash = await this.passwordService.hashPassword(data.password);

    const user = await this.userServices.create({
      email,
      name: data.name.trim(),
      password: passwordHash,
      status: UserStatus.PENDING,
      isVerified: false,
      role: {
        connect: { id: role.id },
      },
    });

    await this.issueEmailVerificationToken(user.id, user.email, user.name ?? 'User');

    return plainToInstance(
      UserResponseDto,
      UserMapper.toResponse(user),
      { excludeExtraneousValues: true },
    );
  }

  async login(
    data: LoginDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDto> {
    const email = data.email.toLowerCase().trim();
    const user = await this.userServices.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.passwordService.comparePasswords(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    this.assertAccountCanLogin(user.status, user.isVerified);

    const tokens = await this.issueAuthTokens(user, meta);

    return plainToInstance(
      AuthResponseDto,
      {
        user: UserMapper.toResponse(user),
        tokens,
      },
      { excludeExtraneousValues: true },
    );
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<null> {
    const email = data.email.toLowerCase().trim();
    const user = await this.userServices.findByEmail(email);

    if (user && user.status !== UserStatus.BLOCKED) {
      await this.verificationTokenRepository.invalidateActiveByUserAndType(
        user.id,
        TokenType.PASSWORD_RESET,
      );

      const { rawToken, tokenHash } = this.tokenService.generateOpaqueToken();
      const expiresInMs = this.config.getOrThrow<number>(
        'auth.tokens.passwordResetExpiresInMs',
      );

      await this.verificationTokenRepository.create({
        tokenHash,
        type: TokenType.PASSWORD_RESET,
        expiresAt: new Date(Date.now() + expiresInMs),
        user: { connect: { id: user.id } },
      });

      try {
        await this.mailService.sendPasswordReset(
          user.email,
          user.name ?? 'User',
          rawToken,
        );
      } catch (error) {
        this.logger.error(
          `Failed to send password reset email to ${user.email}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return null;
  }

  async resetPassword(data: ResetPasswordDto): Promise<null> {
    const tokenHash = this.tokenService.hashToken(data.token);
    const record = await this.verificationTokenRepository.findByHash(tokenHash);

    if (
      !record ||
      record.type !== TokenType.PASSWORD_RESET ||
      record.usedAt ||
      record.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }

    const passwordHash = await this.passwordService.hashPassword(data.password);

    await this.userServices.update(record.userId, {
      password: passwordHash,
      passwordChangedAt: new Date(),
    });

    await this.verificationTokenRepository.markUsed(record.id);
    await this.verificationTokenRepository.deleteByUserAndType(
      record.userId,
      TokenType.PASSWORD_RESET,
    );
    await this.refreshTokenRepository.revokeAllForUser(record.userId);

    return null;
  }

  async verifyEmail(data: VerifyEmailDto): Promise<null> {
    const tokenHash = this.tokenService.hashToken(data.token);
    const record = await this.verificationTokenRepository.findByHash(tokenHash);

    if (
      !record ||
      record.type !== TokenType.EMAIL_VERIFICATION ||
      record.usedAt ||
      record.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN);
    }

    await this.userServices.update(record.userId, {
      isVerified: true,
      status: UserStatus.ACTIVE,
    });

    await this.verificationTokenRepository.markUsed(record.id);
    await this.verificationTokenRepository.deleteByUserAndType(
      record.userId,
      TokenType.EMAIL_VERIFICATION,
    );

    return null;
  }

  async resendVerification(email: string): Promise<null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userServices.findByEmail(normalizedEmail);

    if (user && !user.isVerified && user.status !== UserStatus.BLOCKED) {
      await this.issueEmailVerificationToken(
        user.id,
        user.email,
        user.name ?? 'User',
      );
    }

    return null;
  }

  async refreshTokens(
    data: RefreshTokenDto,
    meta?: { userAgent?: string; ipAddress?: string },
  ): Promise<AuthResponseDto> {
    const tokenHash = this.tokenService.hashToken(data.refreshToken);
    const stored = await this.refreshTokenRepository.findByHash(tokenHash);

    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() < Date.now()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.refreshTokenRepository.revoke(stored.id);

    const user = stored.user as any;
    this.assertAccountCanLogin(user.status, user.isVerified);

    const fullUser = await this.userServices.findById(user.id);
    if (!fullUser) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.issueAuthTokens(fullUser, meta);

    return plainToInstance(
      AuthResponseDto,
      {
        user: UserMapper.toResponse(fullUser),
        tokens,
      },
      { excludeExtraneousValues: true },
    );
  }

  async logout(refreshToken: string): Promise<null> {
    const tokenHash = this.tokenService.hashToken(refreshToken);
    const stored = await this.refreshTokenRepository.findByHash(tokenHash);

    if (stored && !stored.revokedAt) {
      await this.refreshTokenRepository.revoke(stored.id);
    }

    return null;
  }

  private assertAccountCanLogin(status: UserStatus, isVerified: boolean): void {
    if (status === UserStatus.BLOCKED) {
      throw new ForbiddenException(AUTH_MESSAGES.ACCOUNT_BLOCKED);
    }

    if (status === UserStatus.INACTIVE) {
      throw new ForbiddenException(AUTH_MESSAGES.ACCOUNT_INACTIVE);
    }

    if (!isVerified || status === UserStatus.PENDING) {
      throw new ForbiddenException(AUTH_MESSAGES.ACCOUNT_PENDING);
    }
  }

  private async issueEmailVerificationToken(
    userId: number,
    email: string,
    name: string,
  ): Promise<void> {
    await this.verificationTokenRepository.invalidateActiveByUserAndType(
      userId,
      TokenType.EMAIL_VERIFICATION,
    );

    const { rawToken, tokenHash } = this.tokenService.generateOpaqueToken();
    const expiresInMs = this.config.getOrThrow<number>(
      'auth.tokens.emailVerificationExpiresInMs',
    );

    await this.verificationTokenRepository.create({
      tokenHash,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + expiresInMs),
      user: { connect: { id: userId } },
    });

    try {
      await this.mailService.sendEmailVerification(email, name, rawToken);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async issueAuthTokens(
    user: {
      id: number;
      email: string;
      role?: { key: string } | null;
    },
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const roleKey = (user as any).role?.key ?? ROLES.USER;
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: roleKey,
    };

    const accessExpiresIn = this.config.getOrThrow<string>(
      'auth.jwt.accessExpiresIn',
    );
    const refreshExpiresIn = this.config.getOrThrow<string>(
      'auth.jwt.refreshExpiresIn',
    );

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('auth.jwt.accessSecret'),
      expiresIn: accessExpiresIn as any,
    });

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.config.getOrThrow<string>('auth.jwt.refreshSecret'),
        expiresIn: refreshExpiresIn as any,
      },
    );

    const refreshHash = this.tokenService.hashToken(refreshToken);
    const refreshTtlMs = parseDurationToMs(refreshExpiresIn);

    await this.refreshTokenRepository.create({
      tokenHash: refreshHash,
      expiresAt: new Date(Date.now() + refreshTtlMs),
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
      user: { connect: { id: user.id } },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiresIn,
    };
  }
}
