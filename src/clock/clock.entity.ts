import { User } from 'src/users/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum Status {
  IN = 'IN',
  OUT = 'OUT',
  BREAK_IN = 'BREAK_IN',
  BREAK_OUT = 'BREAK_OUT',
}

@Entity('clock')
export class Clock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  startAt: Date;

  @Column({ type: 'timestamp' })
  endAt: Date;

  @Column({ type: 'timestamp' })
  breakStartAt: Date;

  @Column({ type: 'timestamp' })
  breakendAt: Date;

  @ManyToOne(() => User, (user) => user.clocks)
  @JoinColumn({ name: 'id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.IN,
  })
  status: Status;
}
