import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { AUTH_MESSAGES } from './constants/auth.constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage(AUTH_MESSAGES.REGISTER_SUCCESS)
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.LOGIN_SUCCESS)
  login(@Body() data: LoginDto, @Req() req: Request) {
    return this.authService.login(data, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.FORGOT_PASSWORD)
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.RESET_PASSWORD)
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.VERIFY_EMAIL)
  verifyEmail(@Body() data: VerifyEmailDto) {
    return this.authService.verifyEmail(data);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.RESEND_VERIFICATION)
  resendVerification(@Body() data: ResendVerificationDto) {
    return this.authService.resendVerification(data.email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.REFRESH_SUCCESS)
  refresh(@Body() data: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshTokens(data, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage(AUTH_MESSAGES.LOGOUT_SUCCESS)
  logout(@Body() data: RefreshTokenDto) {
    return this.authService.logout(data.refreshToken);
  }
}
