import { Currency } from "@/common/types";
import { numericTransformer } from "@/common/utils/typeorm.util";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Account {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  userId: number

  @Column({ type: "numeric", transformer: numericTransformer })
  balance: number

  @Column()
  currency: Currency
}
