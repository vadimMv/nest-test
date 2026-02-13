import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { BlacklistedToken } from './blacklisted-token.entity';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(BlacklistedToken)
    private readonly blacklistRepository: Repository<BlacklistedToken>,
    private readonly jwtService: JwtService,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepository.create({
      ...dto,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }

  async logout(token: string): Promise<void> {
    await this.blacklistRepository.save({ token });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const entry = await this.blacklistRepository.findOne({ where: { token } });
    return !!entry;
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: Number(userId) } });
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    return this.jwtService.sign(payload) as string;
  }
}
