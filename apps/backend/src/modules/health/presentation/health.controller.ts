import { Controller, Get } from '@nestjs/common';
import { GetHealthService } from '../application/get-health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly getHealth: GetHealthService) {}

  @Get()
  check() {
    return this.getHealth.execute();
  }
}
