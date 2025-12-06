import { BadRequestException, ConflictException, ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { GetTransactionsRequestDto } from './dto/list.dto';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionType } from '@/entities/transaction.entity';
import { In, Repository } from 'typeorm';
import { createPaginatedResult } from '@/common/utils/pagination.util';
import { Account } from '@/entities/account.entity';
import { Ledger } from '@/entities/ledger.entity';
import { Currency } from '@/common/types';

@Injectable()
export class TransactionsService implements OnModuleInit {
  @InjectRepository(Transaction) transactionRepo: Repository<Transaction>
  @InjectRepository(Account) accountRepo: Repository<Account>

  private exchangeRates: Map<string, number>

  onModuleInit() {
    this.exchangeRates = new Map()
    this.exchangeRates.set("USD:EUR", 0.92)
  }

  getExchangeRate(from: Currency, to: Currency) {
    const directRate = this.exchangeRates.get(`${from}:${to}`)
    if (directRate) return directRate

    const reverseRate = this.exchangeRates.get(`${to}:${from}`)
    if (reverseRate) return 1 / reverseRate
  }

  async exchange(dto: ExchangeDto, userId: number) {
    const accounts = await this.accountRepo.findBy({ userId, currency: In([dto.from, dto.to]) })
    const accountsMap = new Map(accounts.map(acc => ([acc.currency, acc])))
    const fromAccount = accountsMap.get(dto.from)
    const toAccount = accountsMap.get(dto.to)

    if (!fromAccount) throw new BadRequestException(`You do not have a '${dto.from}' account`)
    if (!toAccount) throw new BadRequestException(`You do not have a '${dto.to}' account`)

    if (fromAccount.balance < dto.amount) throw new BadRequestException("Balance is too low")

    const exchangeRate = this.getExchangeRate(dto.from, dto.to)
    if (!exchangeRate) {
      console.error(`No available exchange rate for ${dto.from}:${dto.to}`)
      throw new ForbiddenException(`Exchange between ${dto.from} and ${dto.to} is not currently available`)
    }
    const creditAmount = dto.amount * exchangeRate

    const transaction = await this.createAccountsTransaction(fromAccount.id, toAccount.id, dto.amount, TransactionType.EXCHANGE, creditAmount)

    return transaction
  }

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
      throw new BadRequestException(`Recipient account's currency does not match the selected currency. Account currency is: '${toAccount.currency}', but selected: '${dto.currency}'`)
    }

    const transaction = await this.createAccountsTransaction(fromAccount.id, toAccount.id, dto.amount, TransactionType.TRANSFER)

    return transaction
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

  private async createAccountsTransaction(fromAccountId: string, toAccountId: string, debitAmount: number, type: TransactionType, creditAmount: number = debitAmount) {
    const result = await this.accountRepo.manager.transaction(async (dbTransaction) => {
      await dbTransaction.insert(Ledger, { accountId: fromAccountId, value: -debitAmount })
      await dbTransaction.insert(Ledger, { accountId: toAccountId, value: +creditAmount })

      const updateResult = await dbTransaction.query<[[], number]>(
        'UPDATE account SET balance = balance - $1 WHERE id = $2 AND balance >= $1',
        [debitAmount, fromAccountId]
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
        [creditAmount, toAccountId]
      )

      return await dbTransaction.createQueryBuilder()
        .insert()
        .into(Transaction).values({
          fromAccountId,
          toAccountId,
          value: creditAmount,
          type
        })
        .returning('*')
        .execute()
    })

    const resultRaw = result.raw as [Transaction]

    return resultRaw[0]
  }
}
