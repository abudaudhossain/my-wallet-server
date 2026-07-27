import { Transaction } from 'src/generated/prisma/client';
import { TransactionResponseDto } from '../dto/transaction-response.dto';

export class TransactionMapper {
  static toResponse(transaction: Transaction): TransactionResponseDto {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount.toString(),
      narration: transaction.narration,
      date: transaction.date,
      cardId: transaction.cardId,
      userId: transaction.userId,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  static toResponseList(
    transactions: Transaction[],
  ): TransactionResponseDto[] {
    return transactions.map((transaction) => this.toResponse(transaction));
  }
}
