import { IsString, MinLength } from "class-validator";
import { LoginDto } from "./login.dto";

export class RegisterDto extends LoginDto {
  @MinLength(2)
  @IsString()
  name: string
}
