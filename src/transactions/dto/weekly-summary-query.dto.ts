import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class WeeklySummaryQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter summary by card ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Card ID must be an integer' })
  @Min(1, { message: 'Card ID must be at least 1' })
  cardId?: number;

  @ApiPropertyOptional({
    example: '2026-07-28',
    description:
      'Any date within the target week (ISO). Defaults to the current week.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date must be a valid ISO date string' })
  date?: string;
}
