import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ClockService } from './clock.service';
import { JwtAuthGuard } from 'src/users/jwt-auth.guard';

@Controller('clock')
@UseGuards(JwtAuthGuard)
export class ClockController {
  constructor(private readonly clockService: ClockService) {}

  @Post('in')
  clockIn(@Request() req) {
    return this.clockService.clockIn(req.user.id);
  }

  @Post('out')
  clockOut(@Request() req) {
    return this.clockService.clockOut(req.user.id);
  }

  @Post('break-in')
  breakIn(@Request() req) {
    return this.clockService.breakIn(req.user.id);
  }

  @Post('break-out')
  breakOut(@Request() req) {
    return this.clockService.breakOut(req.user.id);
  }
}
