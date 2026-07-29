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

  @ApiProperty({ example: '4242' })
  @Expose()
  lastFour!: string;

  @ApiProperty({ example: '12/29' })
  @Expose()
  expires!: string;

  @ApiProperty({ example: 'Visa' })
  @Expose()
  network!: string;

  @ApiProperty({ example: 'from-lime-300 via-emerald-400 to-teal-500' })
  @Expose()
  colors!: string;

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
