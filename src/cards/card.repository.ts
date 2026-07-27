import { Injectable } from '@nestjs/common';
import { Card, Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: Prisma.CardWhereUniqueInput): Promise<Card | null> {
    return this.prisma.card.findUnique({ where });
  }

  async findFirst(where: Prisma.CardWhereInput): Promise<Card | null> {
    return this.prisma.card.findFirst({ where });
  }

  async findMany(options: {
    where?: Prisma.CardWhereInput;
    orderBy?: Prisma.CardOrderByWithRelationInput;
  }): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: options.where,
      orderBy: options.orderBy,
    });
  }

  async create(data: Prisma.CardCreateInput): Promise<Card> {
    return this.prisma.card.create({ data });
  }

  async update(
    where: Prisma.CardWhereUniqueInput,
    data: Prisma.CardUpdateInput,
  ): Promise<Card> {
    return this.prisma.card.update({ where, data });
  }

  async delete(where: Prisma.CardWhereUniqueInput): Promise<Card> {
    return this.prisma.card.delete({ where });
  }
}
