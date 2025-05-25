import { Injectable, NestMiddleware } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(private readonly metricsService: MetricsService) { }

    use(req: Request, res: Response, next: NextFunction): void {
        const start = process.hrtime();

        res.on('finish', () => {
            const route = req.route?.path || req.originalUrl || req.path || 'unknown';
            const method = req.method;
            const status = res.statusCode;
            const [seconds, nanoseconds] = process.hrtime(start);
            const durationSeconds = seconds + nanoseconds / 1e9;

            this.metricsService.countRequest(route, method, status);
            this.metricsService.recordDuration(route, method, status, durationSeconds);
        });

        next();
    }

}
