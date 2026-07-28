import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification-token-value' })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Verification token is required' })
  token!: string;
}
