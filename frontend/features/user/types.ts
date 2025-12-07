export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
}

export type User = {
  id: number;
  name: string;
  email: string;
  accounts?: Account[];
  createdAt: Date;
  updatedAt: Date;
}

export type Account = {
  id: string;
  balance: number;
  currency: string;
  type: AccountType
}
