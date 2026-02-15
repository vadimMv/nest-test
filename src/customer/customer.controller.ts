import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './create-customer.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserRoles } from 'src/shared/roles.enum';
import { Roles } from 'src/auth/roles.decarator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles(UserRoles.EDITOR, UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateCustomerDto, @CurrentUser() user) {
    return this.customersService.create(dto, user.userId);
  }

  @Get()
  @Roles(UserRoles.VIEWER, UserRoles.EDITOR, UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findMyCustomers(@CurrentUser() user) {
    return this.customersService.findAllByUser(user.userId);
  }

  @Put(':id')
  @Roles(UserRoles.EDITOR, UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user,
  ) {
    return this.customersService.update(id, user.userId, dto);
  }

  @Delete(':id')
  @Roles(UserRoles.EDITOR, UserRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@Param('id') id: string, @CurrentUser() user) {
    return this.customersService.delete(id, user.userId);
  }
}
