import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { TransactionType } from '../enums/transaction.enums';

export class CreateTransactionDto {
  @IsUUID()
  accountId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'Minimum deposit amount is $0.01' })
  @Max(10000, { message: 'Maximum deposit amount is $10,000' })
  amount: number;

  @IsOptional()
  @IsUUID()
  targetAccountId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  description?: string;
}
