import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevokedToken } from './revoked-token.entity';
import { RevokedTokensService } from './revoked-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature([RevokedToken])],
  providers: [RevokedTokensService],
  exports: [RevokedTokensService],
})
export class RevokedTokensModule {}
