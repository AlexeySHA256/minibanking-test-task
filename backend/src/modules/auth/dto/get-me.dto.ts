import { Currency } from '@/common/types';
import { Expose, Type } from 'class-transformer';

class AccountDto {
  @Expose()
  id: string;

  @Expose()
  balance: number;

  @Expose()
  currency: Currency;
}

export class GetMeResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => AccountDto)
  accounts?: AccountDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
