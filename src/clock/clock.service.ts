import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Clock, Status } from './clock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClockService {
  constructor(
    @InjectRepository(Clock)
    private clockRepository: Repository<Clock>,
  ) {}

  async clockIn(userId: number) {
    const existing = await this.clockRepository.findOne({
      where: { user: { id: userId }, status: Status.IN },
    });

    if (existing) {
      throw new ConflictException('Clock already started');
    }

    const clock = this.clockRepository.create({
      user: { id: userId },
      startAt: new Date(),
      status: Status.IN,
    });

    return this.clockRepository.save(clock);
  }

  async clockOut(userId: number) {
    const clock = await this.clockRepository.findOne({
      where: { user: { id: userId }, status: Status.IN },
    });

    if (!clock) {
      throw new NotFoundException('No active clock found');
    }

    clock.endAt = new Date();
    clock.status = Status.OUT;

    return this.clockRepository.save(clock);
  }

  async breakIn(userId: number) {
    const clock = await this.clockRepository.findOne({
      where: { user: { id: userId }, status: Status.IN },
    });

    if (!clock) {
      throw new NotFoundException('No active clock found');
    }

    clock.breakStartAt = new Date();
    clock.status = Status.BREAK_IN;

    return this.clockRepository.save(clock);
  }

  async breakOut(userId: number) {
    const clock = await this.clockRepository.findOne({
      where: { user: { id: userId }, status: Status.BREAK_IN },
    });

    if (!clock) {
      throw new NotFoundException('No active break found');
    }

    clock.breakendAt = new Date();
    clock.status = Status.IN;

    return this.clockRepository.save(clock);
  }
}
