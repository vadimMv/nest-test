import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UserRoles } from 'src/shared/roles.enum';
import { Roles } from 'src/auth/roles.decarator';

@Controller('transaction')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('deposit')
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  @HttpCode(HttpStatus.OK)
  async deposit(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user,
  ) {
    return await this.transactionService.deposit(
      createTransactionDto,
      user.userId,
    );
  }

  @Post('withdraw')
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  @HttpCode(HttpStatus.OK)
  async withdraw(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user,
  ) {
    return await this.transactionService.withdraw(
      createTransactionDto,
      user.userId,
    );
  }

  @Post('transfer')
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  @HttpCode(HttpStatus.OK)
  async transfer(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser() user,
  ) {
    return await this.transactionService.transfer(
      user.userId,
      createTransactionDto,
    );
  }

  @Get()
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  getAll() {
    return this.transactionService.getAllTransactions();
  }

  @Get('/accounts/:accountId')
  async getAccountTransactions(
    @Param('accountId') accountId: string,
    @CurrentUser() user,
  ) {
    return await this.transactionService.getAccountTransactions(
      user.userId,
      accountId,
    );
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  async getTransactionById(
    @CurrentUser() user,
    @Param('id') transactionId: string,
  ) {
    return await this.transactionService.getTransactionById(
      user.userId,
      transactionId,
    );
  }
}
