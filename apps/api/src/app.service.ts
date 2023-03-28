import { Injectable } from '@nestjs/common'

import pk from '../package.json'

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World World version ${pk.version} `
  }
}
