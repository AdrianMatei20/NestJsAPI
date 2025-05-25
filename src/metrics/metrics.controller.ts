import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Registry } from 'prom-client';

@Controller()
export class MetricsController {
  constructor(private readonly registry: Registry) { }

  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.registry.contentType);
    res.end(await this.registry.metrics());
  }
}
