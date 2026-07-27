export default () => ({
  auth: {
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    tokens: {
      emailVerificationExpiresInMs:
        Number(process.env.EMAIL_VERIFICATION_EXPIRES_IN_MS) ||
        24 * 60 * 60 * 1000,
      passwordResetExpiresInMs:
        Number(process.env.PASSWORD_RESET_EXPIRES_IN_MS) || 60 * 60 * 1000,
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});
