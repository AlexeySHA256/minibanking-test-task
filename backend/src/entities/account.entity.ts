import { Currency } from '@/common/types';
import { numericTransformer } from '@/common/utils/typeorm.util';
import { Check, Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
}

@Entity()
@Check('balance >= 0')
@Unique(['userId', 'currency'])
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: number;

  @Column({
    type: 'numeric',
    precision: 100,
    scale: 2,
    transformer: numericTransformer,
  })
  balance: number;

  @Column()
  currency: Currency;

  @Column({ default: AccountType.LIABILITY, enum: AccountType })
  type: AccountType;
}
