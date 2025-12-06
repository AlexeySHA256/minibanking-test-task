import { Injectable } from '@nestjs/common';
import { GetTransactionsRequestDto } from './dto/list.dto';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '@/entities/transaction.entity';
import { In, Repository } from 'typeorm';
import { createPaginatedResult } from '@/common/utils/pagination.util';
import { Account } from '@/entities/account.entity';

@Injectable()
export class TransactionsService {
  @InjectRepository(Transaction) transactionRepo: Repository<Transaction>
  @InjectRepository(Account) accountRepo: Repository<Account>

  async exchange(dto: ExchangeDto, userId: number) { }

  async transfer(dto: TransferDto, userId: number) { }

  async getList(dto: GetTransactionsRequestDto, userId: number) {
    const accountsQuery = this.accountRepo.createQueryBuilder().select('id').where({ userId }).getQueryAndParameters()
    const rawAccountsIds = await this.accountRepo.query<{ id: string }[]>(...accountsQuery)
    const accountsIds = rawAccountsIds.map(item => item.id)

    let queryBuilder = this.transactionRepo.createQueryBuilder()
      .where({ fromAccountId: In(accountsIds) })
      .orderBy(`"createdAt"`, "DESC")
      .limit(dto.limit)
      .offset(dto.offset)

    if (dto.type) queryBuilder = queryBuilder.andWhere({ type: dto.type })

    const [list, total] = await queryBuilder.getManyAndCount()

    return createPaginatedResult(list, total, dto.limit)
  }
}
