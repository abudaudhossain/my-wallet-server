import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { AUTH_MESSAGES } from './constants/auth.constants';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthService } from './services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ResponseMessage(AUTH_MESSAGES.REGISTER_SUCCESS)
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ResponseMessage(AUTH_MESSAGES.LOGIN_SUCCESS)
  login(@Body() data: LoginDto, @Req() req: Request) {
    return this.authService.login(data, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiOkResponse({ description: 'Password reset email sent if account exists' })
  @ResponseMessage(AUTH_MESSAGES.FORGOT_PASSWORD)
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using a reset token' })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ResponseMessage(AUTH_MESSAGES.RESET_PASSWORD)
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with a verification token' })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ResponseMessage(AUTH_MESSAGES.VERIFY_EMAIL)
  verifyEmail(@Body() data: VerifyEmailDto) {
    return this.authService.verifyEmail(data);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiOkResponse({ description: 'Verification email resent' })
  @ResponseMessage(AUTH_MESSAGES.RESEND_VERIFICATION)
  resendVerification(@Body() data: ResendVerificationDto) {
    return this.authService.resendVerification(data.email);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access and refresh tokens' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ResponseMessage(AUTH_MESSAGES.REFRESH_SUCCESS)
  refresh(@Body() data: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshTokens(data, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiOkResponse({ description: 'Logged out successfully' })
  @ResponseMessage(AUTH_MESSAGES.LOGOUT_SUCCESS)
  logout(@Body() data: RefreshTokenDto) {
    return this.authService.logout(data.refreshToken);
  }
}
