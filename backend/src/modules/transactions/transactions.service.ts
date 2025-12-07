import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { GetTransactionsRequestDto } from './dto/list.dto';
import { TransferDto } from './dto/transfer.dto';
import { ExchangeDto } from './dto/exchange.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, TransactionType } from '@/entities/transaction.entity';
import { In, Repository } from 'typeorm';
import { createPaginatedResult } from '@/common/utils/pagination.util';
import { Account } from '@/entities/account.entity';
import { Ledger } from '@/entities/ledger.entity';
import { AccountsService } from '@/modules/accounts/accounts.service';

@Injectable()
export class TransactionsService {
  @InjectRepository(Transaction) transactionRepo: Repository<Transaction>;
  @InjectRepository(Account) accountRepo: Repository<Account>;
  @Inject() accountsService: AccountsService;

  async exchange(dto: ExchangeDto, userId: number) {
    const accounts = await this.accountRepo.findBy({
      userId,
      currency: In([dto.from, dto.to]),
    });
    const accountsMap = new Map(accounts.map((acc) => [acc.currency, acc]));
    const fromAccount = accountsMap.get(dto.from);
    const toAccount = accountsMap.get(dto.to);

    if (!fromAccount)
      throw new BadRequestException(`You do not have a '${dto.from}' account`);
    if (!toAccount)
      throw new BadRequestException(`You do not have a '${dto.to}' account`);

    if (fromAccount.balance < dto.amount)
      throw new BadRequestException('Balance is too low');

    const exchangeRate = this.accountsService.getExchangeRate(`${dto.from}:${dto.to}`);
    if (!exchangeRate) {
      console.error(`No available exchange rate for ${dto.from}:${dto.to}`);
      throw new ForbiddenException(
        `Exchange between ${dto.from} and ${dto.to} is not currently available`,
      );
    }
    const creditAmount = dto.amount * exchangeRate;

    const transaction = await this.conductTransaction(
      fromAccount,
      toAccount,
      dto.amount,
      TransactionType.EXCHANGE,
      creditAmount,
    );

    return transaction;
  }

  async transfer(dto: TransferDto, userId: number) {
    const fromAccount = await this.accountRepo.findOneBy({
      userId,
      currency: dto.currency,
    });

    if (!fromAccount) {
      throw new BadRequestException(
        `You do not have a '${dto.currency}' account`,
      );
    }
    if (fromAccount.balance < dto.amount)
      throw new BadRequestException('Balance is too low');

    const toAccount = await this.accountRepo.findOneBy({ id: dto.toAccountId });

    if (!toAccount) {
      throw new BadRequestException(
        "Recipient account was not found, make sure you've provided a valid account id",
      );
    }
    if (toAccount.currency !== dto.currency) {
      throw new BadRequestException(
        `Recipient account's currency does not match the selected currency. Account currency is: '${toAccount.currency}', but selected: '${dto.currency}'`,
      );
    }

    const transaction = await this.conductTransaction(
      fromAccount,
      toAccount,
      dto.amount,
      TransactionType.TRANSFER,
    );

    return transaction;
  }

  async getList(dto: GetTransactionsRequestDto, userId: number) {
    const accountsQuery = this.accountRepo
      .createQueryBuilder()
      .select('id')
      .where({ userId })
      .getQueryAndParameters();
    const rawAccountsIds = await this.accountRepo.query<{ id: string }[]>(
      ...accountsQuery,
    );
    const accountsIds = rawAccountsIds.map((item) => item.id);

    let queryBuilder = this.transactionRepo
      .createQueryBuilder()
      .where({ fromAccountId: In(accountsIds) })
      .orderBy(`"createdAt"`, 'DESC')
      .limit(dto.limit)
      .offset(dto.offset);

    if (dto.type) queryBuilder = queryBuilder.andWhere({ type: dto.type });

    const [list, total] = await queryBuilder.getManyAndCount();

    return createPaginatedResult(list, total, dto.limit);
  }

  private conductTransaction(
    fromAccount: Account,
    toAccount: Account,
    debitAmount: number,
    type: TransactionType,
    creditAmount: number = debitAmount,
  ) {
    return this.accountRepo.manager.transaction(async (dbTransaction) => {
      const updateResult = await dbTransaction.query<[[], number]>(
        'UPDATE account SET balance = balance - $1 WHERE id = $2 AND balance >= $1',
        [debitAmount, fromAccount.id],
      );
      /*
       * updateResult[1] is a number of affected rows by query
       * if from account update did not affect any rows it means that balance was updated concurrently and does not matched previously checked
       */
      if (updateResult[1] === 0) {
        console.log('Transfer failed due to insufficient balance');
        throw new ConflictException('Transaction failed, please try again');
      }

      await dbTransaction.query(
        'UPDATE account SET balance = balance + $1 WHERE id = $2',
        [creditAmount, toAccount.id],
      );

      const transactionInsertResult = await dbTransaction
        .createQueryBuilder()
        .insert()
        .into(Transaction)
        .values({
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          value: creditAmount,
          currency: toAccount.currency,
          type,
        })
        .returning('*')
        .execute();

      const [transaction] = transactionInsertResult.raw as [Transaction];

      await dbTransaction.insert(Ledger, [
        {
          accountId: fromAccount.id,
          value: -debitAmount,
          transactionId: transaction.id,
        },
        {
          accountId: toAccount.id,
          value: +creditAmount,
          transactionId: transaction.id,
        },
      ]);

      return transaction;
    });
  }
}
