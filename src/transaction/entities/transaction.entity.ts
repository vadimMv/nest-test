import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TransactionStatus, TransactionType } from '../enums/transaction.enums';
import { Account } from '../../account/entities/account.entity';

@Entity('transactions')
@Index(['accountId', 'createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  accountId: string;

  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'uuid', nullable: true })
  targetAccountId: string | null;

  @ManyToOne(() => Account, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'targetAccountId' })
  targetAccount: Account | null;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType: TransactionType;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
  })
  balanceAfter: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.SUCCESS,
  })
  status: TransactionStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
