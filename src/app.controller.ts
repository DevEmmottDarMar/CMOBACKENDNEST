import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck(@Res() res: Response) {
    console.log('🔍 Health check endpoint called');
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Backend is running',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    });
  }

  @Get('status')
  status(@Res() res: Response) {
    res.status(200).json({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  }

  @Get('ping')
  ping(@Res() res: Response) {
    res.status(200).json({
      pong: true,
      timestamp: new Date().toISOString(),
    });
  }
}
