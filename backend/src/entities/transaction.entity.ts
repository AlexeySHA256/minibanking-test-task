import { numericTransformer } from '@/common/utils/typeorm.util';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  EXCHANGE = 'EXCHANGE',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  fromAccountId: string;

  @Column()
  toAccountId: string;

  @Column({
    type: 'numeric',
    precision: 100,
    scale: 2,
    transformer: numericTransformer,
  })
  value: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @CreateDateColumn()
  createdAt: Date;
}
