import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

export class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  accessToken!: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Expose()
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  @Expose()
  tokenType!: string;

  @ApiProperty({ example: '15m' })
  @Expose()
  expiresIn!: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;

  @ApiProperty({ type: AuthTokensDto })
  @Expose()
  @Type(() => AuthTokensDto)
  tokens!: AuthTokensDto;
}
