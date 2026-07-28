import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CurrentStatusSummaryQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Filter summary by card ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Card ID must be an integer' })
  @Min(1, { message: 'Card ID must be at least 1' })
  cardId?: number;
}
