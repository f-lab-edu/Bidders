import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction): void {
        const { ip, method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';

        res.on('finish', () => {
            const { statusCode } = res;
            const timeOptions = {
                timeZone: 'Asia/Seoul',
                hour12: false,
            };
            const currentTime = new Date().toLocaleString('en-US', timeOptions);
            const logMessage = `${currentTime} ${method} ${originalUrl} ${statusCode} ${userAgent} ${ip}`;

            if (statusCode >= 400 && statusCode <= 499) {
                this.logger.warn(logMessage);
            } else if (statusCode >= 500 && statusCode <= 599) {
                this.logger.error(logMessage);
            } else {
                this.logger.log(logMessage);
            }
        });

        next();
    }
}
