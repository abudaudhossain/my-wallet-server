import { Expose } from 'class-transformer';

export class CardResponseDto {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  @Expose()
  balance!: string;

  @Expose()
  userId!: number;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
