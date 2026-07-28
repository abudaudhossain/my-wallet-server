import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Card,
  Prisma,
  TransactionType,
} from 'src/generated/prisma/client';
import { createPaginatedResponse } from 'src/common/dto/paginated-response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TRANSACTION_MESSAGES } from './constants/transaction.constants';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { WeeklySummaryQueryDto } from './dto/weekly-summary-query.dto';
import { WeeklySummaryResponseDto } from './dto/weekly-summary-response.dto';
import {
  TRANSACTION_DETAIL_INCLUDE,
  TransactionMapper,
} from './mappers/transaction.mapper';
import { TransactionRepository } from './transaction.repository';

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId: number, dto: CreateTransactionDto) {
    const card = await this.findOwnedCard(userId, dto.cardId);
    const signedAmount = this.toSignedAmount(dto.type, dto.amount);
    this.assertSufficientBalance(card, signedAmount);

    const transaction = await this.prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          type: dto.type,
          amount: new Prisma.Decimal(dto.amount),
          narration: dto.narration,
          date: dto.date ? new Date(dto.date) : new Date(),
          card: { connect: { id: dto.cardId } },
          user: { connect: { id: userId } },
        },
        include: TRANSACTION_DETAIL_INCLUDE,
      });

      await tx.card.update({
        where: { id: dto.cardId },
        data: { balance: { increment: signedAmount } },
      });

      return created;
    });

    return TransactionMapper.toResponse(transaction);
  }

  async findAll(userId: number, query: FindTransactionsQueryDto) {
    const { page, limit, cardId, from, to } = query;

    if (from && to && new Date(from) > new Date(to)) {
      throw new BadRequestException(TRANSACTION_MESSAGES.INVALID_DATE_RANGE);
    }

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(cardId !== undefined && { cardId }),
      ...((from || to) && {
        date: {
          ...(from && { gte: new Date(from) }),
          ...(to && { lte: new Date(to) }),
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      this.transactionRepository.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.transactionRepository.count(where),
    ]);

    return createPaginatedResponse(
      TransactionMapper.toResponseList(transactions),
      total,
      page,
      limit,
    );
  }

  async findOne(userId: number, id: number) {
    const transaction = await this.findOwnedTransaction(userId, id);
    return TransactionMapper.toResponse(transaction);
  }

  async getWeeklySummary(
    userId: number,
    query: WeeklySummaryQueryDto,
  ): Promise<WeeklySummaryResponseDto> {
    if (query.cardId !== undefined) {
      await this.findOwnedCard(userId, query.cardId);
    }

    const { weekStart, weekEnd } = this.getWeekRange(
      query.date ? new Date(query.date) : new Date(),
    );

    const totals = await this.transactionRepository.sumAmountByType({
      userId,
      ...(query.cardId !== undefined && { cardId: query.cardId }),
      date: { gte: weekStart, lte: weekEnd },
    });

    const deposit = this.getSumForType(totals, TransactionType.DEPOSIT);
    const expense = this.getSumForType(totals, TransactionType.EXPENSE);
    const balance = deposit - expense;

    return {
      weekStart,
      weekEnd,
      deposit: deposit.toFixed(2),
      expense: expense.toFixed(2),
      balance: balance.toFixed(2),
    };
  }

  async update(userId: number, id: number, dto: UpdateTransactionDto) {
    const existing = await this.findOwnedTransaction(userId, id);

    const nextType = dto.type ?? existing.type;
    const nextAmount =
      dto.amount !== undefined
        ? dto.amount
        : Number(existing.amount.toString());
    const nextCardId = dto.cardId ?? existing.cardId;

    const nextCard = await this.findOwnedCard(userId, nextCardId);

    const oldSigned = this.toSignedAmount(
      existing.type,
      Number(existing.amount.toString()),
    );
    const newSigned = this.toSignedAmount(nextType, nextAmount);

    if (nextCardId === existing.cardId) {
      const projected = Number(nextCard.balance.toString()) - oldSigned + newSigned;
      if (projected < 0) {
        throw new BadRequestException(TRANSACTION_MESSAGES.INSUFFICIENT_BALANCE);
      }
    } else {
      const oldCard = await this.findOwnedCard(userId, existing.cardId);
      const oldProjected = Number(oldCard.balance.toString()) - oldSigned;
      if (oldProjected < 0) {
        throw new BadRequestException(TRANSACTION_MESSAGES.INSUFFICIENT_BALANCE);
      }
      this.assertSufficientBalance(nextCard, newSigned);
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      if (nextCardId === existing.cardId) {
        await tx.card.update({
          where: { id: existing.cardId },
          data: { balance: { increment: newSigned - oldSigned } },
        });
      } else {
        await tx.card.update({
          where: { id: existing.cardId },
          data: { balance: { increment: -oldSigned } },
        });
        await tx.card.update({
          where: { id: nextCardId },
          data: { balance: { increment: newSigned } },
        });
      }

      return tx.transaction.update({
        where: { id },
        data: {
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.amount !== undefined && {
            amount: new Prisma.Decimal(dto.amount),
          }),
          ...(dto.narration !== undefined && { narration: dto.narration }),
          ...(dto.date !== undefined && { date: new Date(dto.date) }),
          ...(dto.cardId !== undefined && {
            card: { connect: { id: dto.cardId } },
          }),
        },
        include: TRANSACTION_DETAIL_INCLUDE,
      });
    });

    return TransactionMapper.toResponse(transaction);
  }

  async remove(userId: number, id: number) {
    const existing = await this.findOwnedTransaction(userId, id);
    const signedAmount = this.toSignedAmount(
      existing.type,
      Number(existing.amount.toString()),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.card.update({
        where: { id: existing.cardId },
        data: { balance: { increment: -signedAmount } },
      });
      await tx.transaction.delete({ where: { id } });
    });

    return null;
  }

  private async findOwnedTransaction(userId: number, id: number) {
    const transaction = await this.transactionRepository.findFirst({
      id,
      userId,
    });

    if (!transaction) {
      throw new NotFoundException(TRANSACTION_MESSAGES.NOT_FOUND);
    }

    return transaction;
  }

  private async findOwnedCard(userId: number, cardId: number): Promise<Card> {
    const card = await this.prisma.card.findFirst({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException(TRANSACTION_MESSAGES.CARD_NOT_FOUND);
    }

    return card;
  }

  private toSignedAmount(type: TransactionType, amount: number): number {
    return type === TransactionType.DEPOSIT ? amount : -amount;
  }

  private assertSufficientBalance(card: Card, signedAmount: number) {
    if (signedAmount >= 0) {
      return;
    }

    const balance = Number(card.balance.toString());
    if (balance + signedAmount < 0) {
      throw new BadRequestException(TRANSACTION_MESSAGES.INSUFFICIENT_BALANCE);
    }
  }

  /** ISO week: Monday 00:00:00.000 UTC → Sunday 23:59:59.999 UTC */
  private getWeekRange(referenceDate: Date): {
    weekStart: Date;
    weekEnd: Date;
  } {
    console.log('referenceDate', referenceDate);
    const date = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth(),
        referenceDate.getUTCDate(),
      ),
    );
    const day = date.getUTCDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    date.setUTCDate(date.getUTCDate() + diffToMonday);

    const weekStart = new Date(date);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    return { weekStart, weekEnd };
  }

  private getSumForType(
    totals: Array<{
      type: TransactionType;
      _sum: { amount: Prisma.Decimal | null };
    }>,
    type: TransactionType,
  ): number {
    const match = totals.find((row) => row.type === type);
    return match?._sum.amount ? Number(match._sum.amount.toString()) : 0;
  }
}
