import { Currency } from '@/common/types';
import { Account, AccountType } from '@/entities/account.entity';
import { Ledger } from '@/entities/ledger.entity';
import { Transaction, TransactionType } from '@/entities/transaction.entity';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

const INITIAL_ASSETS = {
  [Currency.USD]: 1000000,
  [Currency.EUR]: 500000,
};

@Injectable()
export class AccountsService implements OnModuleInit {
  @InjectRepository(Account) accountRepo: Repository<Account>;

  private assetAccountsMap: Map<Currency, Account>;
  private exchangeRatesMap: Map<string, number>;

  getExchangeRate(from: Currency, to: Currency) {
    const directRate = this.exchangeRatesMap.get(`${from}:${to}`);
    if (directRate) return directRate;

    const reverseRate = this.exchangeRatesMap.get(`${to}:${from}`);
    if (reverseRate) return 1 / reverseRate;
  }

  onModuleInit() {
    // Initialize exchange rates

    this.exchangeRatesMap = new Map();
    this.exchangeRatesMap.set('USD:EUR', 0.92);

    // Initialize asset accounts

    this.assetAccountsMap = new Map();

    return Promise.all(
      Object.values(Currency).map(async (currency) => {
        let account = await this.accountRepo.findOneBy({
          type: AccountType.ASSET,
          currency,
        });
        if (!account) {
          account = await this.accountRepo.save({
            userId: 0,
            balance: INITIAL_ASSETS[currency],
            currency,
            type: AccountType.ASSET,
          });
        }

        this.assetAccountsMap.set(currency, account);
      })
    )
  }

  getList(userId: number) {
    return this.accountRepo.findBy({ userId })
  }

  async getBalance(accountId: string) {
    const queryAndParameters = this.accountRepo.createQueryBuilder().select("balance").where({ id: accountId }).getQueryAndParameters()
    const [{ balance }] = await this.accountRepo.query<{ balance: number }[]>(...queryAndParameters)

    return { balance }
  }

  async createAndCreditInitialAccounts(manager: EntityManager, userId: number) {
    const accountsInsertResult = await manager
      .createQueryBuilder(Account, 'account')
      .insert()
      .values([
        { currency: Currency.USD, balance: 1000, userId },
        { currency: Currency.EUR, balance: 500, userId },
      ])
      .returning('*')
      .execute();

    const accounts = accountsInsertResult.generatedMaps as Account[];

    // Create transactions with initial assets transfer from system accounts

    const transactionsInsertResult = await manager
      .createQueryBuilder()
      .insert()
      .into(Transaction)
      .values(
        accounts.map((account) => ({
          fromAccountId: this.assetAccountsMap.get(account.currency)!.id,
          toAccountId: account.id,
          currency: account.currency,
          value: account.balance,
          type: TransactionType.TRANSFER,
        })),
      )
      .returning('*')
      .execute();

    const transactions = transactionsInsertResult.raw as Transaction[];

    // Decrease asset accounts balances

    await Promise.all(
      transactions.map((tx) =>
        manager.query(
          'UPDATE account SET balance = balance - $1 WHERE id = $2',
          [tx.value, tx.fromAccountId],
        ),
      ),
    );

    // Create ledger pair entires per each created transaction

    await manager.insert(
      Ledger,
      transactions.flatMap((tx) => [
        {
          accountId: tx.fromAccountId,
          transactionId: tx.id,
          value: -tx.value,
        },
        {
          accountId: tx.toAccountId,
          transactionId: tx.id,
          value: +tx.value,
        },
      ]),
    );

    return accounts;
  }
}
