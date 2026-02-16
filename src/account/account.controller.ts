import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decarator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoles } from 'src/shared/roles.enum';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @Roles(UserRoles.ADMIN, UserRoles.EDITOR)
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser() user,
  ) {
    return this.accountService.create(createAccountDto, user.userId);
  }

  @Get()
  @Roles(UserRoles.ADMIN)
  findAll() {
    return this.accountService.findAll();
  }

  @Get('/me')
  findMyAccounts(@CurrentUser() user) {
    return this.accountService.findAllByUser(user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user) {
    return this.accountService.findOneForUser(id, user.userId);
  }

  @Get(':id/balance')
  getBalance(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user) {
    return this.accountService.getBalnce(id, user.userId);
  }
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user,
  ) {
    return this.accountService.updateForUser(id, user.userId, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user) {
    return this.accountService.close(id, user.userId);
  }
}
