import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserServices } from 'src/users/user.services';
import { UserStatus } from 'src/generated/prisma/client';
import {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly userServices: UserServices,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('auth.jwt.accessSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.userServices.findById(payload.sub);

    if (!user || user.status === UserStatus.BLOCKED || user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Invalid authentication credentials');
    }

    return {
      id: user.id,
      email: user.email,
      role: (user as any).role?.key ?? payload.role,
    };
  }
}
