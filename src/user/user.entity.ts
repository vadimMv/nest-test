import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
<<<<<<< Updated upstream
import { Customer } from '../customer/customer.entity';
=======
import { Account } from '../account/entities/account.entity';
import { UserRoles } from 'src/shared/roles.enum';
>>>>>>> Stashed changes

@Entity('users')
@Index(['email'])
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

<<<<<<< Updated upstream
  @OneToMany(() => Customer, (customer) => customer.user)
  customers: Customer[];
=======
  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.VIEWER,
  })
  role: UserRoles;
>>>>>>> Stashed changes
}
