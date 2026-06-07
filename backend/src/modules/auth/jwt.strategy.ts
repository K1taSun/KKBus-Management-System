import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    let secret = process.env.JWT_SECRET;
    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'FATAL: Zmienna środowiskowa JWT_SECRET nie jest ustawiona w trybie produkcyjnym.',
        );
      }
      secret = 'dev-secret-change-me-in-production';
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.headers && request.headers.cookie) {
            const rawCookies = request.headers.cookie;
            const cookies = rawCookies.split(';').reduce((acc, cookie) => {
              const parts = cookie.split('=');
              const key = parts[0]?.trim();
              const val = parts.slice(1).join('=')?.trim();
              if (key) {
                acc[key] = val;
              }
              return acc;
            }, {} as Record<string, string>);
            token = cookies['accessToken'];
          }
          return token || ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
