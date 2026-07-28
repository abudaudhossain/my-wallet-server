import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TransactionType } from 'src/generated/prisma/client';

export class TransactionResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @Expose()
  type!: TransactionType;

  @ApiProperty({ example: '25.50' })
  @Expose()
  amount!: string;

  @ApiProperty({ example: 'Grocery shopping', nullable: true })
  @Expose()
  narration!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  date!: Date;

  @ApiProperty({ example: 1 })
  @Expose()
  cardId!: number;

  @ApiProperty({ example: 1 })
  @Expose()
  userId!: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt!: Date;
}
