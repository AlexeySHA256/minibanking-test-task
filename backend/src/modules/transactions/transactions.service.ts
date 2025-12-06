import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { GetTransactionsRequestDto } from './dto/list.dto';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionType } from '@/entities/transaction.entity';
import { In, Repository } from 'typeorm';
import { createPaginatedResult } from '@/common/utils/pagination.util';
import { Account } from '@/entities/account.entity';
import { Ledger } from '@/entities/ledger.entity';

@Injectable()
export class TransactionsService {
  @InjectRepository(Transaction) transactionRepo: Repository<Transaction>
  @InjectRepository(Account) accountRepo: Repository<Account>

  async exchange(dto: ExchangeDto, userId: number) { }

  async transfer(dto: TransferDto, userId: number) {
    const fromAccount = await this.accountRepo.findOneBy({ userId, currency: dto.currency })
    if (!fromAccount) {
      throw new BadRequestException(`You do not have a '${dto.currency}' account`)
    }
    if (fromAccount.balance < dto.amount) throw new BadRequestException("Balance is too low")

    const toAccount = await this.accountRepo.findOneBy({ id: dto.toAccountId })
    if (!toAccount) {
      throw new BadRequestException("Recipient account was not found, make sure you've provided a valid account id")
    }
    if (toAccount.currency !== dto.currency) {
      throw new BadRequestException(`Recipient account's currency does not match the selected currency. Account currency is: '${toAccount.currency}', but selected: ${dto.currency}`)
    }

    const result = await this.accountRepo.manager.transaction(async (dbTransaction) => {
      await dbTransaction.insert(Ledger, { accountId: fromAccount.id, value: -dto.amount })
      await dbTransaction.insert(Ledger, { accountId: toAccount.id, value: +dto.amount })

      const updateResult = await dbTransaction.query<[[], number]>(
        'UPDATE account SET balance = balance - $1 WHERE id = $2 AND balance >= $3',
        [dto.amount, fromAccount.id, dto.amount]
      )
      /* 
       * updateResult[1] is a number of affected rows by query
       * if from account update did not affect any rows it means that balance was updated concurrently and does not matched previously checked
      */
      if (updateResult[1] === 0) {
        console.log("Transfer failed due to insufficient balance")
        throw new ConflictException('Transaction failed, please try again')
      }

      console.log("Update result", updateResult)
      await dbTransaction.query(
        'UPDATE account SET balance = balance + $1 WHERE id = $2',
        [dto.amount, toAccount.id]
      )

      return await dbTransaction.createQueryBuilder()
        .insert()
        .into(Transaction).values({
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          value: dto.amount,
          type: TransactionType.TRANSFER
        })
        .returning('*')
        .execute()
    })

    const resultRaw = result.raw as [Transaction]

    return resultRaw[0]
  }

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
