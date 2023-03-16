import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {}

  @Get()
  getHello() {
    return {
      message: this.appService.getHello(),
    }
  }

  @Get('dynamic')
  getDynamicHello() {
    return {
      message: this.configService.get<string>('GREETING'),
    }
  }

  @Get('nice')
  getNice() {
    return {
      message: 'Nice',
    }
  }
}
