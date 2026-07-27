import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @MaxLength(255)
  email!: string;
}
