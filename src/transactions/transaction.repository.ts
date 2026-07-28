import { Injectable } from '@nestjs/common';
import { Prisma, Transaction, TransactionType } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  TRANSACTION_DETAIL_INCLUDE,
  type TransactionWithDetails,
} from './mappers/transaction.mapper';

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
  ): Promise<TransactionWithDetails | null> {
    return this.prisma.transaction.findFirst({
      where,
      include: TRANSACTION_DETAIL_INCLUDE,
    });
  }

  async findMany(options: {
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<TransactionWithDetails[]> {
    return this.prisma.transaction.findMany({
      where: options.where,
      orderBy: options.orderBy,
      skip: options.skip,
      take: options.take,
      include: TRANSACTION_DETAIL_INCLUDE,
    });
  }

  async count(where?: Prisma.TransactionWhereInput): Promise<number> {
    return this.prisma.transaction.count({ where });
  }

  async sumAmountByType(
    where: Prisma.TransactionWhereInput,
  ): Promise<
    Array<{ type: TransactionType; _sum: { amount: Prisma.Decimal | null } }>
  > {
    const [deposit, expense] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.DEPOSIT },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: { ...where, type: TransactionType.EXPENSE },
        _sum: { amount: true },
      }),
    ]);

    return [
      { type: TransactionType.DEPOSIT, _sum: deposit._sum },
      { type: TransactionType.EXPENSE, _sum: expense._sum },
    ];
  }

  async create(
    data: Prisma.TransactionCreateInput,
  ): Promise<TransactionWithDetails> {
    return this.prisma.transaction.create({
      data,
      include: TRANSACTION_DETAIL_INCLUDE,
    });
  }

  async update(
    where: Prisma.TransactionWhereUniqueInput,
    data: Prisma.TransactionUpdateInput,
  ): Promise<TransactionWithDetails> {
    return this.prisma.transaction.update({
      where,
      data,
      include: TRANSACTION_DETAIL_INCLUDE,
    });
  }

  async delete(
    where: Prisma.TransactionWhereUniqueInput,
  ): Promise<Transaction> {
    return this.prisma.transaction.delete({ where });
  }
}
