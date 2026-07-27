import { Expose } from 'class-transformer';
import { TransactionType } from 'src/generated/prisma/client';

export class TransactionResponseDto {
  @Expose()
  id!: number;

  @Expose()
  type!: TransactionType;

  @Expose()
  amount!: string;

  @Expose()
  narration!: string | null;

  @Expose()
  date!: Date;

  @Expose()
  cardId!: number;

  @Expose()
  userId!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
