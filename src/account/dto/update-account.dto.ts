import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { AccountType } from '../enums/acount.enums';

export class UpdateAccountDto {
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency must be a valid 3-letter ISO code',
  })
  currency?: string;
}
