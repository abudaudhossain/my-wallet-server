import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CurrentStatusSummaryResponseDto {
  @ApiProperty({
    example: '5250.00',
    description: 'Total DEPOSIT amount across all transactions',
  })
  @Expose()
  deposit!: string;

  @ApiProperty({
    example: '1480.50',
    description: 'Total EXPENSE amount across all transactions',
  })
  @Expose()
  expense!: string;

  @ApiProperty({
    example: '3769.50',
    description: 'Current balance across all cards',
  })
  @Expose()
  balance!: string;
}
