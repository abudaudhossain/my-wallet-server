import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CardResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Main Wallet' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Primary spending card', nullable: true })
  @Expose()
  description!: string | null;

  @ApiProperty({ example: '1500.00' })
  @Expose()
  balance!: string;

  @ApiProperty({ example: 1 })
  @Expose()
  userId!: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt!: Date;
}
