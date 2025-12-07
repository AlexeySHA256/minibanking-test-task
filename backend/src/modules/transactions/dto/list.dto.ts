import { Currency } from '@/common/types';
import { PaginationRequestDto } from '@/common/utils/pagination.util';
import { TransactionType } from '@/entities/transaction.entity';
import { Expose, Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

export class TransactionDto {
  @Expose()
  id: string;

  @Expose()
  fromAccountId: string;

  @Expose()
  toAccountId: string;

  @Expose()
  value: number;

  @Expose()
  currency: Currency

  @Expose()
  type: TransactionType;

  @Expose()
  createdAt: Date;
}

export class GetTransactionsRequestDto extends PaginationRequestDto {
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;
}

export class GetTransactionsResponseDto {
  @Expose()
  @Type(() => TransactionDto)
  list: TransactionDto[];

  @Expose()
  total: number;

  @Expose()
  lastPage: number;
}
