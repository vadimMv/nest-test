import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { UserRoles } from 'src/shared/roles.enum';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdateRoleDto {
  @IsEnum(UserRoles)
  role: UserRoles;
}
