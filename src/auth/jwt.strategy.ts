import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RevokedTokensService } from 'src/tokens/revoked-tokens.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private revokedTokensService: RevokedTokensService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'soemthing',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    const revoked = await this.revokedTokensService.isRevoked(payload.jti);

    if (revoked) {
      throw new UnauthorizedException('Token revoked');
    }
    return {
      userId: user.userId,
      email: user.email,
      role: user.role,
      exp: payload.exp,
      jti: payload.jti,
    };
  }
}
