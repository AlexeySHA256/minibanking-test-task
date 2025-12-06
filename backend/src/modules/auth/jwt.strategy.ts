import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthPayload } from '@/common/types';

export function getAccessToken(request: Request) {
  const token = request.cookies.accessToken as unknown;
  if (typeof token === 'string') return token;
  return null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: getAccessToken,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(request: unknown, payload: AuthPayload) {
    return payload;
  }
}
