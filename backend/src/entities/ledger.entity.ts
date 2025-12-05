import { numericTransformer } from "@/common/utils/typeorm.util";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Ledger {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  accountId: string

  @Column({ type: "numeric", transformer: numericTransformer })
  value: number

  @CreateDateColumn()
  createdAt: Date
}
