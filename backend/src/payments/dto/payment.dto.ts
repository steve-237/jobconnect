import { IsNumber, IsPositive, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class DepositDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;
}

export class WithdrawDto {
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  iban!: string;
}
