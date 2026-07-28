import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MonthlySummaryResponseDto {
  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @Expose()
  monthStart!: Date;

  @ApiProperty({ example: '2026-07-31T23:59:59.999Z' })
  @Expose()
  monthEnd!: Date;

  @ApiProperty({
    example: 'July-2026',
    description: 'Month label (monthName-year)',
  })
  @Expose()
  label!: string;

  @ApiProperty({
    example: '1250.00',
    description: 'Total DEPOSIT amount for the month',
  })
  @Expose()
  deposit!: string;

  @ApiProperty({
    example: '480.50',
    description: 'Total EXPENSE amount for the month',
  })
  @Expose()
  expense!: string;

  @ApiProperty({
    example: '769.50',
    description: 'Monthly net balance (deposit - expense)',
  })
  @Expose()
  balance!: string;
}
