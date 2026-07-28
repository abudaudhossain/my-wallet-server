import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class WeeklySummaryListQueryDto {
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
    example: '2026-07-01',
    description:
      'Start of date range (inclusive). Defaults to the first day of the current month.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'From must be a valid ISO date string' })
  from?: string;

  @ApiPropertyOptional({
    example: '2026-07-31',
    description:
      'End of date range (inclusive). Defaults to the last day of the current month.',
  })
  @IsOptional()
  @IsDateString({}, { message: 'To must be a valid ISO date string' })
  to?: string;
}
