// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')!, // Asegura que JWT_SECRET exista en .env
      ignoreExpiration: false,
    });
  }

  async validate(payload: {
    email: string;
    sub: string;
    rol: string;
    nombre?: string;
  }): Promise<User> {
    const user: User | null = await this.usersService.findOneById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no autorizado (token inválido o usuario no encontrado).',
      );
    }

    return user;
  }
}
