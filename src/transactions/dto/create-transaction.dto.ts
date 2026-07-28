import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransactionType } from 'src/generated/prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType, {
    message: 'Type must be EXPENSE or DEPOSIT',
  })
  type!: TransactionType;

  @ApiProperty({ example: 25.5, minimum: 0.01 })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Amount must be greater than 0' })
  @Transform(({ value }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  amount!: number;

  @ApiPropertyOptional({ example: 'Grocery shopping', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'Narration must be a string' })
  @MaxLength(500, { message: 'Narration must not exceed 500 characters' })
  narration?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'Card ID must be a number' })
  @IsNotEmpty({ message: 'Card ID is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  cardId!: number;
}
