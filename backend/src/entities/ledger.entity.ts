import { numericTransformer } from "@/common/utils/typeorm.util";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ledger {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  accountId: string

  @Column()
  transactionId: string

  @Column({ type: "numeric", precision: 100, scale: 2, transformer: numericTransformer })
  value: number

  @CreateDateColumn()
  createdAt: Date
}
