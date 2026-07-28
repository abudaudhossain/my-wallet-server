import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'user@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  @Expose()
  name!: string | null;

  @ApiProperty({ example: true })
  @Expose()
  isVerified!: boolean;

  @ApiProperty({ example: 'ACTIVE' })
  @Expose()
  status!: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ example: 'USER' })
  @Expose()
  role!: string;
}
