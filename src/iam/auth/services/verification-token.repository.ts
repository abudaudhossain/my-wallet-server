import { Injectable } from '@nestjs/common';
import {
  Prisma,
  TokenType,
  VerificationToken,
} from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class VerificationTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.VerificationTokenCreateInput,
  ): Promise<VerificationToken> {
    return this.prisma.verificationToken.create({ data });
  }

  async findByHash(
    tokenHash: string,
  ): Promise<(VerificationToken & { user: { id: number; email: string; name: string | null } }) | null> {
    return this.prisma.verificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async markUsed(id: number): Promise<VerificationToken> {
    return this.prisma.verificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async deleteByUserAndType(userId: number, type: TokenType): Promise<void> {
    await this.prisma.verificationToken.deleteMany({
      where: { userId, type },
    });
  }

  async invalidateActiveByUserAndType(
    userId: number,
    type: TokenType,
  ): Promise<void> {
    await this.prisma.verificationToken.updateMany({
      where: {
        userId,
        type,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });
  }
}
