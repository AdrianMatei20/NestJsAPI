import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total') private counter: Counter<string>,
    @InjectMetric('http_request_duration_seconds') private histogram: Histogram<string>,
  ) { }

  countRequest(route: string, method: string, statusCode: number) {
    this.counter.inc({ route, method, status_code: statusCode.toString() });
  }

  recordDuration(route: string, method: string, statusCode: number, durationSeconds: number) {
    this.histogram.observe({ route, method, status_code: statusCode.toString() }, durationSeconds);
  }
}
