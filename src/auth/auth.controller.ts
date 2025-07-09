// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/login.dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica al usuario con email y contraseña, retornando un token JWT'
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciales de autenticación'
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'Token JWT para autenticación',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nombre: { type: 'string' },
            email: { type: 'string' },
            rol: { type: 'string', enum: ['tecnico', 'supervisor'] },
            areaId: { type: 'string', format: 'uuid', nullable: true }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas'
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Crea un nuevo usuario y retorna un token JWT'
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Datos del nuevo usuario'
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        access_token: {
          type: 'string',
          description: 'Token JWT para autenticación',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nombre: { type: 'string' },
            email: { type: 'string' },
            rol: { type: 'string', enum: ['tecnico', 'supervisor', 'admin'] },
            areaId: { type: 'string', format: 'uuid', nullable: true }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya existe'
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Recuperar contraseña',
    description: 'Genera un token de recuperación de contraseña y lo envía por email'
  })
  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Email del usuario'
  })
  @ApiResponse({
    status: 200,
    description: 'Token de recuperación generado',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Si el email existe, recibirás un enlace de recuperación de contraseña.'
        },
        resetToken: {
          type: 'string',
          description: 'Token de recuperación (solo para desarrollo)',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description: 'Restablece la contraseña usando el token de recuperación'
  })
  @ApiBody({
    type: ResetPasswordDto,
    description: 'Token de recuperación y nueva contraseña'
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña restablecida exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Contraseña actualizada correctamente'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido o expirado'
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.resetToken,
      resetPasswordDto.newPassword
    );
  }
}
