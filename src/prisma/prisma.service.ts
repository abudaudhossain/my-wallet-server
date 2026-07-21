import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.getOrThrow<string>('db.databaseUrl'),
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('Prisma connected to the database'); 
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('Prisma disconnected from the database');
  }
}