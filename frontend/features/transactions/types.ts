export enum TransactionType {
  TRANSFER = 'TRANSFER',
  EXCHANGE = 'EXCHANGE',
}

export type Currency = { name: string, symbol: string }

export type Transaction = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  value: number;
  currency: string;
  type: TransactionType;
  createdAt: Date;
}

export type TransactionListResponse = {
  list: Transaction[];
  total: number;
  lastPage: number;
}

