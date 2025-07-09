// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

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
    // === CORRECCIÓN CLAVE AQUÍ: areaId debe ser 'string | null' ===
    user: { id: string; nombre: string; email: string; rol: string; areaId: string | null }; 
  }> {
    const user: User | null = await this.usersService.findOneByEmail(email);

    if (!user || !(await this.usersService.verifyPassword(pass, user.password))) {
      throw new UnauthorizedException(
        'Credenciales inválidas (correo o contraseña incorrectos).',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      rol: user.rol,
      nombre: user.nombre,
      areaId: user.areaId, // Esto puede ser string o null, si viene de la DB
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        areaId: user.areaId || null, // Asegura que sea string o null
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<{
    access_token: string;
    user: { id: string; nombre: string; email: string; rol: string; areaId: string | null };
  }> {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    // Crear el nuevo usuario
    const newUser = await this.usersService.create(createUserDto);

    // Generar token JWT para el nuevo usuario
    const payload = {
      email: newUser.email,
      sub: newUser.id,
      rol: newUser.rol,
      nombre: newUser.nombre,
      areaId: newUser.areaId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        areaId: newUser.areaId || null,
      },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string; resetToken?: string }> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message: 'Si el email existe, recibirás un enlace de recuperación de contraseña.',
      };
    }

    // Generar token de recuperación (válido por 1 hora)
    const resetPayload = {
      email: user.email,
      sub: user.id,
      type: 'password_reset',
    };

    const resetToken = this.jwtService.sign(resetPayload, { expiresIn: '1h' });

    // En un entorno real, aquí enviarías el token por email
    // Por ahora, lo devolvemos en la respuesta para pruebas
    return {
      message: 'Si el email existe, recibirás un enlace de recuperación de contraseña.',
      resetToken, // Solo para desarrollo/pruebas
    };
  }

  async resetPassword(resetToken: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Verificar el token de recuperación
      const payload = this.jwtService.verify(resetToken);
      
      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Token inválido');
      }

      // Buscar el usuario
      const user = await this.usersService.findOneByEmail(payload.email);
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      // Actualizar la contraseña (el UsersService se encarga del hash)
      await this.usersService.update(user.id, { password: newPassword });

      return {
        message: 'Contraseña actualizada correctamente',
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token inválido o expirado');
      }
      throw error;
    }
  }
}