import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto, userId: string) {
    const existing = await this.customerRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Customer with this email already exists');
    }

    const customer = this.customerRepo.create({
      ...dto,
      userId,
    });

    return this.customerRepo.save(customer);
  }

  async findAllByUser(userId: string) {
    return this.customerRepo.find({
      where: { userId },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
