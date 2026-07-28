import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class FindTransactionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter transactions by card ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Card ID must be an integer' })
  @Min(1, { message: 'Card ID must be at least 1' })
  cardId?: number;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Filter transactions from this date (inclusive)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'From must be a valid ISO date string' })
  from?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Filter transactions to this date (inclusive)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'To must be a valid ISO date string' })
  to?: string;
}
