import { Currency } from "@/common/types";
import { IsEnum, IsPositive } from "class-validator";

export class ExchangeDto {
  @IsEnum(Currency)
  from: Currency

  @IsEnum(Currency)
  to: Currency

  @IsPositive()
  amount: number
}
