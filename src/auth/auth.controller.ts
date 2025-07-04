// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto/login.dto';
@Controller('auth') // Ruta base para autenticación: /auth
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK) // Responde con 200 OK si el login es exitoso
  @Post('login') // Endpoint para iniciar sesión: /auth/login
  async signIn(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

  // Si decides añadir un endpoint de registro público más adelante, iría aquí.
  // @Post('register')
  // async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
  //   return this.authService.signUp(createUserDto);
  // }
}
