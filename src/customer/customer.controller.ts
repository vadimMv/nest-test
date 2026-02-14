import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { CustomersService } from './customer.service';
import { CreateCustomerDto } from './create-customer.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('customers')
@UseGuards(AuthGuard('jwt'))
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto, @CurrentUser() user) {
    return this.customersService.create(dto, user.userId);
  }

  @Get()
  async findMyCustomers(@CurrentUser() user) {
    return this.customersService.findAllByUser(user.userId);
  }
}
