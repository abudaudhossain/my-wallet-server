import { Injectable } from '@nestjs/common';
import { Prisma, Transaction } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.TransactionWhereUniqueInput,
  ): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where });
  }

  async findFirst(
    where: Prisma.TransactionWhereInput,
  ): Promise<Transaction | null> {
    return this.prisma.transaction.findFirst({ where });
  }

  async findMany(options: {
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: options.where,
      orderBy: options.orderBy,
    });
  }

  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  async update(
    where: Prisma.TransactionWhereUniqueInput,
    data: Prisma.TransactionUpdateInput,
  ): Promise<Transaction> {
    return this.prisma.transaction.update({ where, data });
  }

  async delete(
    where: Prisma.TransactionWhereUniqueInput,
  ): Promise<Transaction> {
    return this.prisma.transaction.delete({ where });
  }
}
