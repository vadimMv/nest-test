import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { Repository, DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionType, TransactionStatus } from './enums/transaction.enums';
import { AccountStatus } from 'src/account/enums/acount.enums';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  async deposit(dto: CreateTransactionDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = await queryRunner.manager.findOne(Account, {
        where: { id: dto.accountId, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (account.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Account is not active');
      }

      const newBalance = Number(account.balance) + dto.amount;

      await queryRunner.manager.update(Account, account.id, {
        balance: newBalance,
      });

      const transaction = queryRunner.manager.create(Transaction, {
        accountId: account.id,
        transactionType: TransactionType.DEPOSIT,
        amount: dto.amount,
        balanceAfter: newBalance,
        status: TransactionStatus.SUCCESS,
        description: dto.description ?? null,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(userId: string, dto: CreateTransactionDto) {
    if (!dto.targetAccountId) {
      throw new BadRequestException('Target account is required');
    }

    if (dto.accountId === dto.targetAccountId) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [sourceAccount, targetAccount] = await Promise.all([
        queryRunner.manager.findOne(Account, {
          where: { id: dto.accountId, userId },
          lock: { mode: 'pessimistic_write' },
        }),
        queryRunner.manager.findOne(Account, {
          where: { id: dto.targetAccountId },
          lock: { mode: 'pessimistic_write' },
        }),
      ]);

      if (!sourceAccount) {
        throw new NotFoundException('Source account not found');
      }
      if (!targetAccount) {
        throw new NotFoundException('Target account not found');
      }
      if (sourceAccount.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Source account is not active');
      }
      if (targetAccount.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Target account is not active');
      }

      const newSourceBalance = Number(sourceAccount.balance) - dto.amount;
      if (newSourceBalance < 0) {
        throw new BadRequestException('Insufficient funds');
      }

      const newTargetBalance = Number(targetAccount.balance) + dto.amount;

      await queryRunner.manager.update(Account, sourceAccount.id, {
        balance: newSourceBalance,
      });
      await queryRunner.manager.update(Account, targetAccount.id, {
        balance: newTargetBalance,
      });

      const transaction = queryRunner.manager.create(Transaction, {
        accountId: sourceAccount.id,
        targetAccountId: targetAccount.id,
        transactionType: TransactionType.TRANSFER,
        amount: dto.amount,
        balanceAfter: newSourceBalance,
        status: TransactionStatus.SUCCESS,
        description: dto.description ?? null,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getAccountTransactions(userId: string, accountId: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return this.transactionRepository.find({
      where: { accountId },
      order: { createdAt: 'DESC' },
    });
  }

  async getTransactionById(userId: string, transactionId: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['account'],
    });

    if (!transaction || transaction.account.userId !== userId) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async withdraw(dto: CreateTransactionDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = await queryRunner.manager.findOne(Account, {
        where: { id: dto.accountId, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (account.status !== AccountStatus.ACTIVE) {
        throw new BadRequestException('Account is not active');
      }

      const newBalance = Number(account.balance) - dto.amount;

      if (newBalance < 0) {
        throw new BadRequestException('Account not have enough amount');
      }

      await queryRunner.manager.update(Account, account.id, {
        balance: newBalance,
      });

      const transaction = queryRunner.manager.create(Transaction, {
        accountId: account.id,
        transactionType: TransactionType.WITHDRAW,
        amount: dto.amount,
        balanceAfter: newBalance,
        status: TransactionStatus.SUCCESS,
        description: dto.description ?? null,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async getAllTransactions() {
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
