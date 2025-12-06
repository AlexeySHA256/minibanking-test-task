import { Currency } from "@/common/types";
import { IsEnum, IsPositive, IsUUID } from "class-validator";

export class TransferDto {
  @IsUUID()
  toAccountId: string

  @IsEnum(Currency)
  currency: Currency

  @IsPositive()
  amount: number
}
