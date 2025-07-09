// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service'; // Ruta corregida
import { User } from '../../users/entities/user.entity'; // Ruta corregida

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET')!,
      ignoreExpiration: false,
    });
  }

  // === CORRECCIÓN CLAVE AQUÍ: Incluir 'areaId' en el tipo de 'payload' ===
  async validate(payload: {
    email: string;
    sub: string; // ID del usuario
    rol: string;
    nombre?: string;
    areaId?: string; // <-- ¡AÑADIR ESTO! Para que TypeScript lo reconozca
  }): Promise<User> { // El objeto User ya incluye areaId
    // Buscar al usuario por su ID (payload.sub)
    // usersService.findOneById ya está configurado para popular la relación 'area'
    const user: User | null = await this.usersService.findOneById(payload.sub);

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no autorizado (token inválido o usuario no encontrado).',
      );
    }

    // El objeto 'user' retornado por validate es lo que se adjunta a 'req.user'.
    // Como usersService.findOneById ya trae el User completo (con su areaId),
    // req.user.areaId estará disponible en el controlador.
    return user;
  }
}

// Exportar el JwtAuthGuard
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}