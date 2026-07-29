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
import { CurrentStatusSummaryQueryDto } from './dto/current-status-summary-query.dto';
import { CurrentStatusSummaryResponseDto } from './dto/current-status-summary-response.dto';
import { FindTransactionsQueryDto } from './dto/find-transactions-query.dto';
import { MonthlySummaryListQueryDto } from './dto/monthly-summary-list-query.dto';
import { MonthlySummaryQueryDto } from './dto/monthly-summary-query.dto';
import { MonthlySummaryResponseDto } from './dto/monthly-summary-response.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { WeeklySummaryListQueryDto } from './dto/weekly-summary-list-query.dto';
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
    const { page, limit, cardId, from, to, sortBy, sortOrder } = query;

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
        orderBy: [{ [sortBy]: sortOrder }, { id: sortOrder }],
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

    return this.buildWeeklySummary(weekStart, weekEnd, deposit, expense);
  }

  async getWeeklySummaryList(
    userId: number,
    query: WeeklySummaryListQueryDto,
  ): Promise<WeeklySummaryResponseDto[]> {
    if (query.cardId !== undefined) {
      await this.findOwnedCard(userId, query.cardId);
    }

    const { from, to } = this.resolveSummaryListDateRange(query.from, query.to);

    const transactions = await this.transactionRepository.findAmountsInRange(
      {
        userId,
        ...(query.cardId !== undefined && { cardId: query.cardId }),
      },
      from,
      to,
    );

    const weekMap = new Map<
      string,
      { weekStart: Date; weekEnd: Date; deposit: number; expense: number }
    >();

    for (const transaction of transactions) {
      const { weekStart, weekEnd } = this.getWeekRange(transaction.date);
      const key = weekStart.toISOString();
      const entry = weekMap.get(key) ?? {
        weekStart,
        weekEnd,
        deposit: 0,
        expense: 0,
      };

      const amount = Number(transaction.amount.toString());
      if (transaction.type === TransactionType.DEPOSIT) {
        entry.deposit += amount;
      } else {
        entry.expense += amount;
      }

      weekMap.set(key, entry);
    }

    const weeksInRange = this.getWeeksInRange(from, to);

    return weeksInRange.map(({ weekStart, weekEnd }) => {
      const entry = weekMap.get(weekStart.toISOString());
      return this.buildWeeklySummary(
        weekStart,
        weekEnd,
        entry?.deposit ?? 0,
        entry?.expense ?? 0,
      );
    });
  }

  async getMonthlySummary(
    userId: number,
    query: MonthlySummaryQueryDto,
  ): Promise<MonthlySummaryResponseDto> {
    if (query.cardId !== undefined) {
      await this.findOwnedCard(userId, query.cardId);
    }

    const { monthStart, monthEnd } = this.getMonthRange(
      query.date ? new Date(query.date) : new Date(),
    );

    const totals = await this.transactionRepository.sumAmountByType({
      userId,
      ...(query.cardId !== undefined && { cardId: query.cardId }),
      date: { gte: monthStart, lte: monthEnd },
    });

    const deposit = this.getSumForType(totals, TransactionType.DEPOSIT);
    const expense = this.getSumForType(totals, TransactionType.EXPENSE);

    return this.buildMonthlySummary(monthStart, monthEnd, deposit, expense);
  }

  async getMonthlySummaryList(
    userId: number,
    query: MonthlySummaryListQueryDto,
  ): Promise<MonthlySummaryResponseDto[]> {
    if (query.cardId !== undefined) {
      await this.findOwnedCard(userId, query.cardId);
    }

    const { from, to } = this.resolveMonthlySummaryListDateRange(
      query.from,
      query.to,
    );

    const transactions = await this.transactionRepository.findAmountsInRange(
      {
        userId,
        ...(query.cardId !== undefined && { cardId: query.cardId }),
      },
      from,
      to,
    );

    const monthMap = new Map<
      string,
      { monthStart: Date; monthEnd: Date; deposit: number; expense: number }
    >();

    for (const transaction of transactions) {
      const { monthStart, monthEnd } = this.getMonthRange(transaction.date);
      const key = this.getMonthKey(monthStart);
      const entry = monthMap.get(key) ?? {
        monthStart,
        monthEnd,
        deposit: 0,
        expense: 0,
      };

      const amount = Number(transaction.amount.toString());
      if (transaction.type === TransactionType.DEPOSIT) {
        entry.deposit += amount;
      } else {
        entry.expense += amount;
      }

      monthMap.set(key, entry);
    }

    const monthsInRange = this.getMonthsInRange(from, to);

    return monthsInRange.map(({ monthStart, monthEnd }) => {
      const entry = monthMap.get(this.getMonthKey(monthStart));
      return this.buildMonthlySummary(
        monthStart,
        monthEnd,
        entry?.deposit ?? 0,
        entry?.expense ?? 0,
      );
    });
  }

  async getCurrentStatusSummary(
    userId: number,
    query: CurrentStatusSummaryQueryDto,
  ): Promise<CurrentStatusSummaryResponseDto> {
    if (query.cardId !== undefined) {
      await this.findOwnedCard(userId, query.cardId);
    }

    const transactionWhere: Prisma.TransactionWhereInput = {
      userId,
      ...(query.cardId !== undefined && { cardId: query.cardId }),
    };

    const cardWhere: Prisma.CardWhereInput = {
      userId,
      ...(query.cardId !== undefined && { id: query.cardId }),
    };

    const [totals, balanceResult] = await Promise.all([
      this.transactionRepository.sumAmountByType(transactionWhere),
      this.prisma.card.aggregate({
        where: cardWhere,
        _sum: { balance: true },
      }),
    ]);

    const deposit = this.getSumForType(totals, TransactionType.DEPOSIT);
    const expense = this.getSumForType(totals, TransactionType.EXPENSE);
    const balance = balanceResult._sum.balance
      ? Number(balanceResult._sum.balance.toString())
      : 0;

    return {
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

  private buildMonthlySummary(
    monthStart: Date,
    monthEnd: Date,
    deposit: number,
    expense: number,
  ): MonthlySummaryResponseDto {
    const balance = deposit - expense;

    return {
      monthStart,
      monthEnd,
      label: this.getMonthLabel(monthStart),
      deposit: deposit.toFixed(2),
      expense: expense.toFixed(2),
      balance: balance.toFixed(2),
    };
  }

  private resolveMonthlySummaryListDateRange(from?: string, to?: string): {
    from: Date;
    to: Date;
  } {
    const now = new Date();

    const rangeFrom = from
      ? this.startOfUtcDay(new Date(from))
      : this.startOfUtcYear(now);

    const rangeTo = to
      ? this.endOfUtcDay(new Date(to))
      : this.endOfUtcYear(now);

    if (rangeFrom > rangeTo) {
      throw new BadRequestException(TRANSACTION_MESSAGES.INVALID_DATE_RANGE);
    }

    return { from: rangeFrom, to: rangeTo };
  }

  private getMonthRange(referenceDate: Date): {
    monthStart: Date;
    monthEnd: Date;
  } {
    const monthStart = this.startOfUtcMonth(referenceDate);
    const monthEnd = this.endOfUtcMonth(referenceDate);
    return { monthStart, monthEnd };
  }

  private getMonthsInRange(
    from: Date,
    to: Date,
  ): Array<{ monthStart: Date; monthEnd: Date }> {
    const months: Array<{ monthStart: Date; monthEnd: Date }> = [];
    let cursor = this.startOfUtcMonth(from);

    while (cursor <= to) {
      months.push({
        monthStart: cursor,
        monthEnd: this.endOfUtcMonth(cursor),
      });
      cursor = new Date(
        Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1),
      );
      cursor.setUTCHours(0, 0, 0, 0);
    }

    return months;
  }

  /** Label format: monthName-year (e.g. July-2026) */
  private getMonthLabel(monthStart: Date): string {
    const monthName = monthStart.toLocaleString('en-US', {
      month: 'long',
      timeZone: 'UTC',
    });
    return `${monthName}-${monthStart.getUTCFullYear()}`;
  }

  private getMonthKey(monthStart: Date): string {
    return `${monthStart.getUTCFullYear()}-${monthStart.getUTCMonth()}`;
  }

  private startOfUtcYear(date: Date): Date {
    const normalized = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  private endOfUtcYear(date: Date): Date {
    const normalized = new Date(Date.UTC(date.getUTCFullYear(), 11, 31));
    normalized.setUTCHours(23, 59, 59, 999);
    return normalized;
  }

  private buildWeeklySummary(
    weekStart: Date,
    weekEnd: Date,
    deposit: number,
    expense: number,
  ): WeeklySummaryResponseDto {
    const balance = deposit - expense;

    return {
      weekStart,
      weekEnd,
      label: this.getWeekLabel(weekStart),
      deposit: deposit.toFixed(2),
      expense: expense.toFixed(2),
      balance: balance.toFixed(2),
    };
  }

  private resolveSummaryListDateRange(from?: string, to?: string): {
    from: Date;
    to: Date;
  } {
    const now = new Date();

    const rangeFrom = from
      ? this.startOfUtcDay(new Date(from))
      : this.startOfUtcMonth(now);

    const rangeTo = to
      ? this.endOfUtcDay(new Date(to))
      : this.endOfUtcMonth(now);

    if (rangeFrom > rangeTo) {
      throw new BadRequestException(TRANSACTION_MESSAGES.INVALID_DATE_RANGE);
    }

    return { from: rangeFrom, to: rangeTo };
  }

  private getWeeksInRange(
    from: Date,
    to: Date,
  ): Array<{ weekStart: Date; weekEnd: Date }> {
    const weeks: Array<{ weekStart: Date; weekEnd: Date }> = [];
    let cursor = this.getWeekRange(from).weekStart;

    while (cursor <= to) {
      const { weekStart, weekEnd } = this.getWeekRange(cursor);
      weeks.push({ weekStart, weekEnd });
      cursor = new Date(weekStart);
      cursor.setUTCDate(cursor.getUTCDate() + 7);
    }

    return weeks;
  }

  /** Label format: monthName-weekNo (e.g. July-4) */
  private getWeekLabel(weekStart: Date): string {
    const monthName = weekStart.toLocaleString('en-US', {
      month: 'long',
      timeZone: 'UTC',
    });
    const weekNo = Math.ceil(weekStart.getUTCDate() / 7);
    return `${monthName}-${weekNo}`;
  }

  private startOfUtcDay(date: Date): Date {
    const normalized = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  private endOfUtcDay(date: Date): Date {
    const normalized = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
    normalized.setUTCHours(23, 59, 59, 999);
    return normalized;
  }

  private startOfUtcMonth(date: Date): Date {
    const normalized = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    );
    normalized.setUTCHours(0, 0, 0, 0);
    return normalized;
  }

  private endOfUtcMonth(date: Date): Date {
    const normalized = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    );
    normalized.setUTCHours(23, 59, 59, 999);
    return normalized;
  }

  /** ISO week: Monday 00:00:00.000 UTC → Sunday 23:59:59.999 UTC */
  private getWeekRange(referenceDate: Date): {
    weekStart: Date;
    weekEnd: Date;
  } {
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
