import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  name!: string | null;

  @Expose()
  isVerified!: boolean;

  @Expose()
  status!: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  role!: string;
}
