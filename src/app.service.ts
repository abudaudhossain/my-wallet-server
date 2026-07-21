import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  private prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  async getHello(): Promise<string> {
    const user = await this.prisma.user.create({
      data: {
        email: 'test@test.com',
        password: 'test123',
      },
    });
    console.log(user);
    return 'Hello World!';
  }
}
