import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCardDto {
  @ApiPropertyOptional({ example: 'Main Wallet', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    example: 'Primary spending card',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({ example: '4242' })
  @IsOptional()
  @IsString({ message: 'Last four must be a string' })
  @IsNotEmpty({ message: 'Last four is required' })
  lastFour?: string;

  @ApiPropertyOptional({ example: '12/29' })
  @IsOptional()
  @IsString({ message: 'Expires must be a string' })
  @IsNotEmpty({ message: 'Expires is required' })
  expires?: string;

  @ApiPropertyOptional({ example: 'Visa' })
  @IsOptional()
  @IsString({ message: 'Network must be a string' })
  @IsNotEmpty({ message: 'Network is required' })
  network?: string;

  @ApiPropertyOptional({ example: 'from-lime-300 via-emerald-400 to-teal-500' })
  @IsOptional()
  @IsString({ message: 'Colors must be a string' })
  @IsNotEmpty({ message: 'Colors is required' })
  colors?: string;
}
