import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Customer } from '../customer/customer.entity';
import { UserRoles } from 'src/shared/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.VIEWER,
  })
  role: UserRoles;
}
