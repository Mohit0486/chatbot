import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'AI Agent Builder API',
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
