import { Prisma, Transaction } from 'src/generated/prisma/client';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

export const TRANSACTION_DETAIL_INCLUDE = {
  card: { select: { name: true } },
  user: { select: { name: true } },
} satisfies Prisma.TransactionInclude;

export type TransactionWithDetails = Transaction & {
  card: { name: string };
  user: { name: string | null };
};

export class TransactionMapper {
  static toResponse(
    transaction: TransactionWithDetails,
  ): TransactionResponseDto {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      narration: transaction.narration,
      date: transaction.date,
      cardId: transaction.cardId,
      cardName: transaction.card.name,
      userId: transaction.userId,
      userName: transaction.user.name,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  static toResponseList(
    transactions: TransactionWithDetails[],
  ): TransactionResponseDto[] {
    return transactions.map((transaction) => this.toResponse(transaction));
  }
}
