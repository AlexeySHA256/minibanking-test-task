import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '@/entities/transaction.entity';
import { Account } from '@/entities/account.entity';
import { AccountsModule } from '@/modules/accounts/accounts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Account]),
    AccountsModule
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController]
})
export class TransactionsModule { }
