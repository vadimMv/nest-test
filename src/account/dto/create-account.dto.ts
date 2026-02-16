import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { AccountType } from '../enums/acount.enums';

export class CreateAccountDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(6, 20)
  accountNumber: string;

  @IsEnum(AccountType)
  accountType: AccountType;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a valid 3-letter ISO code',
  })
  currency?: string;
}
