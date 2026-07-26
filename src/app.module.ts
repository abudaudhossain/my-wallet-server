import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config'
import configs from './config';
import { validationSchema } from './config/validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './iam/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      validationSchema,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        `.env`,
      ],
      cache: true,
      expandVariables: true, 
    }),
    PrismaModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
