export const AUTH_MESSAGES = {
  REGISTER_SUCCESS:
    'Registration successful. Please check your email to verify your account.',
  LOGIN_SUCCESS: 'Login successful',
  FORGOT_PASSWORD:
    'If an account exists with this email, a password reset link has been sent.',
  RESET_PASSWORD: 'Password has been reset successfully',
  VERIFY_EMAIL: 'Email verified successfully',
  RESEND_VERIFICATION:
    'If an account exists with this email, a verification email has been sent.',
  REFRESH_SUCCESS: 'Token refreshed successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_PENDING: 'Please verify your email before logging in',
  ACCOUNT_INACTIVE: 'Your account is inactive. Please contact support.',
  ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
} as const;
