import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountStatus } from './enums/acount.enums';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  async create(
    createAccountDto: CreateAccountDto,
    userId: string,
  ): Promise<Account> {
    const existing = await this.accountRepo.findOne({
      where: { accountNumber: createAccountDto.accountNumber },
    });

    if (existing) {
      throw new ConflictException('Account number already exists');
    }

    const account = this.accountRepo.create({
      ...createAccountDto,
      userId,
    });

    return this.accountRepo.save(account);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUser(userId: string): Promise<Account[]> {
    return this.accountRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneForUser(id: string, userId: string): Promise<Partial<Account>> {
    const account = await this.accountRepo.findOne({
      where: { id, userId },
      select: [
        'id',
        'accountType',
        'accountNumber',
        'currency',
        'status',
        'createdAt',
      ],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async getBalnce(id: string, userId: string): Promise<Partial<Account>> {
    const account = await this.accountRepo.findOne({
      where: { id, userId },
      select: ['userId', 'accountNumber', 'balance'],
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async updateForUser(
    id: string,
    userId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    Object.assign(account, updateAccountDto);

    return this.accountRepo.save(account);
  }

  async close(id: string, userId: string): Promise<Account> {
    const account = await this.accountRepo.findOne({
      where: { id, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    account.status = AccountStatus.CLOSED;

    return this.accountRepo.save(account);
  }
}
