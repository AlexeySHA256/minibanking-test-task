import { QueryRunner } from 'typeorm';
import { User } from '@/entities/user.entity';
import { Account } from '@/entities/account.entity';
import { Transaction, TransactionType } from '@/entities/transaction.entity';
import { Ledger } from '@/entities/ledger.entity';
import { faker } from '@faker-js/faker';
import { dataSource } from './datasource';
import { Currency } from '@/common/types';

const PASSWORD = 'qwerty123';

async function seedUsers(queryRunner: QueryRunner, count: number): Promise<User[]> {
  const userRepo = queryRunner.manager.getRepository(User);

  const users = Array.from({ length: count }, () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return userRepo.create({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: PASSWORD,
    });
  });

  const savedUsers = await userRepo.save(users);

  return savedUsers;
}

async function seedAccounts(queryRunner: QueryRunner, users: User[]): Promise<Account[]> {
  const accountRepo = queryRunner.manager.getRepository(Account);

  const accounts: Account[] = [];

  for (const user of users) {
    accounts.push(
      accountRepo.create({
        userId: user.id,
        currency: Currency.USD,
        balance: faker.number.float({ min: 500, max: 50000, fractionDigits: 2 }),
      })
    );

    accounts.push(
      accountRepo.create({
        userId: user.id,
        currency: Currency.EUR,
        balance: faker.number.float({ min: 300, max: 35000, fractionDigits: 2 }),
      })
    );
  }

  const savedAccounts = await accountRepo.save(accounts);

  return savedAccounts;
}

async function seedTransactions(queryRunner: QueryRunner, accounts: Account[], maxPerAccount: number): Promise<void> {
  const transactionRepo = queryRunner.manager.getRepository(Transaction);
  const ledgerRepo = queryRunner.manager.getRepository(Ledger);
  const accountRepo = queryRunner.manager.getRepository(Account);

  const transactions: Transaction[] = []
  const ledgers: Ledger[] = []

  for (const fromAccount of accounts) {
    const count = faker.number.int({ min: 0, max: maxPerAccount })

    for (let i = 0; i < count; i++) {
      if (fromAccount.balance < 1) break

      const type = faker.helpers.weightedArrayElement([
        { weight: 80, value: TransactionType.TRANSFER },
        { weight: 20, value: TransactionType.EXCHANGE },
      ]);

      const possibleRecipients = accounts.filter(
        account => account.id !== fromAccount.id &&
          type === TransactionType.TRANSFER ?
          account.userId !== fromAccount.userId && account.currency === fromAccount.currency :
          account.userId === fromAccount.userId
      );

      if (possibleRecipients.length === 0) continue;

      const toAccount = faker.helpers.arrayElement(possibleRecipients);

      const amount = faker.number.float({
        min: 1,
        max: fromAccount.balance,
        fractionDigits: 2,
      });

      // Create transaction
      const transaction = await transactionRepo.save(
        transactionRepo.create({
          fromAccountId: fromAccount.id,
          toAccountId: toAccount.id,
          value: amount,
          type,
        })
      );

      transactions.push(transaction)

      // TODO: handle exchange rates for exchange transaction

      // Update balances
      fromAccount.balance -= amount;
      toAccount.balance += amount;
      await accountRepo.save([fromAccount, toAccount]);

      // Create ledger entries (double-entry)
      const transactionLedgers = await ledgerRepo.save([
        ledgerRepo.create({ accountId: fromAccount.id, value: -amount }),
        ledgerRepo.create({ accountId: toAccount.id, value: +amount }),
      ]);

      ledgers.push(...transactionLedgers)
    }
  }
}

export async function main() {
  console.log('🧹 Cleaning up old data');

  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  // Clear existing data
  await dataSource.synchronize(true);

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.startTransaction();

  try {
    const users = await seedUsers(queryRunner, 20);
    console.log("Users created")
    const accounts = await seedAccounts(queryRunner, users);
    console.log("Accounts created")
    await seedTransactions(queryRunner, accounts, 10);
    console.log("Transactions created")

    await queryRunner.commitTransaction();
    console.log('Seed completed successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Seed failed, rolling back all changes:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

main()
