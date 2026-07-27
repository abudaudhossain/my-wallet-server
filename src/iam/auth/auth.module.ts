import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/users/user.module';
import { MailModule } from 'src/mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { RefreshTokenRepository } from './services/refresh-token.repository';
import { RoleRepository } from './services/role.repository';
import { TokenService } from './services/token.service';
import { VerificationTokenRepository } from './services/verification-token.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    MailModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('auth.jwt.accessSecret'),
        signOptions: {
          expiresIn: config.getOrThrow<string>('auth.jwt.accessExpiresIn') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    RoleRepository,
    TokenService,
    VerificationTokenRepository,
    RefreshTokenRepository,
    JwtStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, PasswordService, JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
