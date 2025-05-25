import { MiddlewareConsumer, Module } from '@nestjs/common';
import { Registry } from 'prom-client';
import { MetricsService } from './metrics.service';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsMiddleware } from './metrics.middleware';

@Module({
  providers: [
    Registry,
    MetricsService,
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['route', 'method', 'status_code'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['route', 'method', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5], // adjust buckets as needed
    }),
  ],
  controllers: [MetricsController],
  exports: [MetricsService],
})
export class MonitoringModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
  
}