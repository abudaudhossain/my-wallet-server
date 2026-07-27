import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().min(5).required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  EMAIL_VERIFICATION_EXPIRES_IN_MS: Joi.number().optional(),
  PASSWORD_RESET_EXPIRES_IN_MS: Joi.number().optional(),
  FRONTEND_URL: Joi.string().uri().optional(),

  MAIL_HOST: Joi.string().optional().allow(''),
  MAIL_PORT: Joi.number().optional(),
  MAIL_SECURE: Joi.boolean().truthy('true').falsy('false').optional(),
  MAIL_USER: Joi.string().optional().allow(''),
  MAIL_PASSWORD: Joi.string().optional().allow(''),
  MAIL_FROM: Joi.string().optional().allow(''),
});
