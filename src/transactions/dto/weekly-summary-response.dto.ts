import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WeeklySummaryResponseDto {
  @ApiProperty({ example: '2026-07-27T00:00:00.000Z' })
  @Expose()
  weekStart!: Date;

  @ApiProperty({ example: '2026-08-02T23:59:59.999Z' })
  @Expose()
  weekEnd!: Date;

  @ApiProperty({
    example: '1250.00',
    description: 'Total DEPOSIT amount for the week',
  })
  @Expose()
  deposit!: string;

  @ApiProperty({
    example: '480.50',
    description: 'Total EXPENSE amount for the week',
  })
  @Expose()
  expense!: string;

  @ApiProperty({
    example: '769.50',
    description: 'Weekly net balance (deposit - expense)',
  })
  @Expose()
  balance!: string;
}
