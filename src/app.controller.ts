import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('Health')
@Controller()
export class AppController {
  @Get()
  getHealth(): Record<string, number> {
    return {
      health: new Date().getTime(),
    };
  }
}
