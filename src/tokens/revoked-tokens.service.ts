import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevokedToken } from './revoked-token.entity';

@Injectable()
export class RevokedTokensService {
  constructor(
    @InjectRepository(RevokedToken)
    private repo: Repository<RevokedToken>,
  ) {}

  async revokeToken(jti: string, expiresAt: Date) {
    const token = this.repo.create({
      jti,
      expiresAt,
    });

    await this.repo.save(token);
  }

  async isRevoked(jti: string): Promise<boolean> {
    const token = await this.repo.findOne({
      where: { jti },
      select: ['id'],
    });

    return !!token;
  }
}
