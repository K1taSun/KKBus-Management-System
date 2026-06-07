import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        let secret = process.env.JWT_SECRET;
        if (!secret) {
          if (process.env.NODE_ENV === 'production') {
            throw new Error(
              'FATAL: Zmienna środowiskowa JWT_SECRET nie jest ustawiona w trybie produkcyjnym.',
            );
          }
          console.warn(
            'WARNING: Zmienna środowiskowa JWT_SECRET nie jest ustawiona. ' +
            'Używam domyślnego klucza deweloperskiego. Ustaw bezpieczny klucz w produkcji!',
          );
          secret = 'dev-secret-change-me-in-production';
        }
        return { secret };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}

