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
  @IsEnum(TransactionType, {
    message: 'Type must be EXPENSE or DEPOSIT',
  })
  type!: TransactionType;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Amount must be greater than 0' })
  @Transform(({ value }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  amount!: number;

  @IsOptional()
  @IsString({ message: 'Narration must be a string' })
  @MaxLength(500, { message: 'Narration must not exceed 500 characters' })
  narration?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;

  @IsNumber({}, { message: 'Card ID must be a number' })
  @IsNotEmpty({ message: 'Card ID is required' })
  @Transform(({ value }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  cardId!: number;
}
