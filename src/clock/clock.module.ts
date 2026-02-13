import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clock } from './clock.entity';
import { ClockService } from './clock.service';
import { ClockController } from './clock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Clock])],
  controllers: [ClockController],
  providers: [ClockService],
  exports: [ClockService],
})
export class ClockModule {}
