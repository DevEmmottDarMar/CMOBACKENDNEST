// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(
    email: string,
    pass: string,
  ): Promise<{
    access_token: string;
    user: { id: string; nombre: string; email: string; rol: string };
  }> {
    const user: User | null = await this.usersService.findOneByEmail(email);

    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException(
        'Credenciales inválidas (correo o contraseña incorrectos).',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      rol: user.rol,
      nombre: user.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }
}