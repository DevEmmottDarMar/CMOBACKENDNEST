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
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Backend is running',
    });
  }

  @Get('api')
  apiHealthCheck(@Res() res: Response) {
    res.status(200).json({
      status: 'ok',
      message: 'API is running',
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
