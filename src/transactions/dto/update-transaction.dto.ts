import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { TransactionType } from 'src/generated/prisma/client';

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionType, {
    message: 'Type must be EXPENSE or DEPOSIT',
  })
  type?: TransactionType;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Amount must be a number with up to 2 decimal places' },
  )
  @IsPositive({ message: 'Amount must be greater than 0' })
  @Transform(({ value }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  amount?: number;

  @IsOptional()
  @IsString({ message: 'Narration must be a string' })
  @MaxLength(500, { message: 'Narration must not exceed 500 characters' })
  narration?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Card ID must be a number' })
  @Transform(({ value }) =>
    typeof value === 'string' ? Number(value) : value,
  )
  cardId?: number;
}
